import { createWriteStream } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");

const manifest = JSON.parse(
  await readFile(resolve(dist, "manifest.json"), "utf8")
);
const versionedName = `shadcn-design-md-${manifest.version}.zip`;
// Versioned name primary; also keep generic extension.zip for local convenience.
const outVersioned = resolve(root, versionedName);
const out = resolve(root, "extension.zip");

// Minimal ZIP writer (store + deflate, no external deps).
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const files = [];
for await (const f of walk(dist)) {
  const name = relative(dist, f).replaceAll("\\", "/");
  const data = await readFile(f);
  const compressed = deflateRawSync(data);
  files.push({
    name,
    data,
    compressed,
    crc: crc32(data),
  });
}

const ws = createWriteStream(out);
const central = [];
let offset = 0;
const dosTime = (d = new Date()) => {
  const t =
    ((d.getHours() & 0x1f) << 11) |
    ((d.getMinutes() & 0x3f) << 5) |
    ((d.getSeconds() / 2) & 0x1f);
  const dt =
    (((d.getFullYear() - 1980) & 0x7f) << 9) |
    (((d.getMonth() + 1) & 0x0f) << 5) |
    (d.getDate() & 0x1f);
  return { t, dt };
};
const { t, dt } = dosTime();

for (const f of files) {
  const nameBuf = Buffer.from(f.name, "utf8");
  const useDeflate = f.compressed.length < f.data.length;
  const body = useDeflate ? f.compressed : f.data;
  const method = useDeflate ? 8 : 0;

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(method, 8);
  local.writeUInt16LE(t, 10);
  local.writeUInt16LE(dt, 12);
  local.writeUInt32LE(f.crc, 14);
  local.writeUInt32LE(body.length, 18);
  local.writeUInt32LE(f.data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);

  ws.write(local);
  ws.write(nameBuf);
  ws.write(body);

  const cd = Buffer.alloc(46);
  cd.writeUInt32LE(0x02014b50, 0);
  cd.writeUInt16LE(20, 4);
  cd.writeUInt16LE(20, 6);
  cd.writeUInt16LE(0, 8);
  cd.writeUInt16LE(method, 10);
  cd.writeUInt16LE(t, 12);
  cd.writeUInt16LE(dt, 14);
  cd.writeUInt32LE(f.crc, 16);
  cd.writeUInt32LE(body.length, 20);
  cd.writeUInt32LE(f.data.length, 24);
  cd.writeUInt16LE(nameBuf.length, 28);
  cd.writeUInt16LE(0, 30);
  cd.writeUInt16LE(0, 32);
  cd.writeUInt16LE(0, 34);
  cd.writeUInt16LE(0, 36);
  cd.writeUInt32LE(0, 38);
  cd.writeUInt32LE(offset, 42);
  central.push(Buffer.concat([cd, nameBuf]));

  offset += 30 + nameBuf.length + body.length;
}

const cdStart = offset;
let cdSize = 0;
for (const c of central) {
  ws.write(c);
  cdSize += c.length;
}

const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(files.length, 8);
eocd.writeUInt16LE(files.length, 10);
eocd.writeUInt32LE(cdSize, 12);
eocd.writeUInt32LE(cdStart, 16);
eocd.writeUInt16LE(0, 20);
ws.write(eocd);
ws.end();

await new Promise((res) => ws.on("close", res));

// Sanity check: manifest.json must be at the root of the zip, no nested dir.
const rootEntries = files.map((f) => f.name);
if (!rootEntries.includes("manifest.json")) {
  throw new Error(
    `[extension] zip layout invalid. manifest.json missing from root. entries:\n  ${rootEntries.join("\n  ")}`
  );
}
const nested = rootEntries.filter((n) => n.startsWith("extension/") || n.startsWith("dist/"));
if (nested.length > 0) {
  throw new Error(
    `[extension] zip has nested top-level dir. entries:\n  ${nested.join("\n  ")}`
  );
}

// Mirror to versioned filename for clarity at upload time.
await readFile(out).then((buf) =>
  import("node:fs/promises").then((fs) => fs.writeFile(outVersioned, buf))
);

console.log("[extension] zipped ->", out);
console.log("[extension] zipped ->", outVersioned);
console.log("[extension] zip layout OK (manifest.json at root, " + rootEntries.length + " entries)");
console.log("");
console.log("Upload either file to chrome://extensions or Chrome Web Store.");
console.log("Do NOT re-zip the dist/ folder yourself - that wraps it in an extra dir.");
