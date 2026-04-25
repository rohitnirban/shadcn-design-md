// Rasterize the project icon (see apps/web/src/app/icon.svg) into:
//   - apps/extension/icons/icon{16,48,128}.png
//   - apps/web/src/app/favicon.ico (16 + 32 + 48 PNG-encoded entries)
//
// SDF rasterizer with analytic anti-aliasing. No native deps.
//
// Source SVG (256x256 viewBox):
//   rect rx=64, fill #030303
//   stroke white, width 10, round caps/joins:
//     - line  (72.5, 109.5) → (183.5, 109.5)
//     - line  (109.5, 109.5) → (109.5, 183.5)
//     - rounded-rect (72.5, 72.5, 111, 111) corner-r ≈ 12.333
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, crc32 } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const extIcons = resolve(root, "apps/extension/icons");
const webApp = resolve(root, "apps/web/src/app");
mkdirSync(extIcons, { recursive: true });
mkdirSync(webApp, { recursive: true });

const STROKE = 10;
const STROKE_HALF = STROKE / 2;
const BG = [3, 3, 3];
const FG = [255, 255, 255];
const VIEW = 256;
const BG_RX = 64;

const INNER = { x: 72.5, y: 72.5, w: 111, h: 111, r: 12.333 };
const SEG_H = { ax: 72.5, ay: 109.5, bx: 183.5, by: 109.5 };
const SEG_V = { ax: 109.5, ay: 109.5, bx: 109.5, by: 183.5 };

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function sdRoundedRect(px, py, x, y, w, h, r) {
  const cx = x + w / 2,
    cy = y + h / 2;
  const dx = Math.abs(px - cx) - w / 2 + r;
  const dy = Math.abs(py - cy) - h / 2 + r;
  return (
    Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) +
    Math.min(Math.max(dx, dy), 0) -
    r
  );
}
function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax,
    pay = py - ay;
  const bax = bx - ax,
    bay = by - ay;
  const denom = bax * bax + bay * bay;
  const t = denom === 0 ? 0 : clamp01((pax * bax + pay * bay) / denom);
  return Math.hypot(pax - bax * t, pay - bay * t);
}

function renderPng(size) {
  const scale = size / VIEW;
  const pxUnits = 1 / scale;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let p = 0;
  for (let py = 0; py < size; py++) {
    raw[p++] = 0; // PNG filter byte: none
    for (let px = 0; px < size; px++) {
      const x = (px + 0.5) / scale;
      const y = (py + 0.5) / scale;

      const sdBg = sdRoundedRect(x, y, 0, 0, VIEW, VIEW, BG_RX);
      const bgAlpha = clamp01(0.5 - sdBg / pxUnits);

      const sdH = sdSegment(x, y, SEG_H.ax, SEG_H.ay, SEG_H.bx, SEG_H.by);
      const sdV = sdSegment(x, y, SEG_V.ax, SEG_V.ay, SEG_V.bx, SEG_V.by);
      const sdInner = Math.abs(
        sdRoundedRect(x, y, INNER.x, INNER.y, INNER.w, INNER.h, INNER.r)
      );
      const strokeDist = Math.min(sdH, sdV, sdInner) - STROKE_HALF;
      const strokeAlpha = clamp01(0.5 - strokeDist / pxUnits);

      const r = strokeAlpha * FG[0] + (1 - strokeAlpha) * BG[0];
      const g = strokeAlpha * FG[1] + (1 - strokeAlpha) * BG[1];
      const b = strokeAlpha * FG[2] + (1 - strokeAlpha) * BG[2];
      const a = Math.round(bgAlpha * 255);

      raw[p++] = Math.round(r);
      raw[p++] = Math.round(g);
      raw[p++] = Math.round(b);
      raw[p++] = a;
    }
  }
  return encodePng(size, size, raw);
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePng(w, h, raw) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function buildIco(pngs) {
  // ICONDIR header (6) + ICONDIRENTRY per image (16) + payloads.
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  for (let i = 0; i < count; i++) {
    const { size, png } = pngs[i];
    const e = i * 16;
    entries[e + 0] = size >= 256 ? 0 : size;
    entries[e + 1] = size >= 256 ? 0 : size;
    entries[e + 2] = 0; // palette
    entries[e + 3] = 0; // reserved
    entries.writeUInt16LE(1, e + 4); // planes
    entries.writeUInt16LE(32, e + 6); // bit depth
    entries.writeUInt32LE(png.length, e + 8); // bytes
    entries.writeUInt32LE(offset, e + 12); // file offset
    offset += png.length;
  }
  return Buffer.concat([header, entries, ...pngs.map((p) => p.png)]);
}

const sizes = [16, 32, 48, 128, 256];
const cache = {};
for (const s of sizes) {
  cache[s] = renderPng(s);
  console.log(`rendered ${s}x${s} PNG (${cache[s].length} bytes)`);
}

// Extension icons
for (const s of [16, 48, 128]) {
  const out = resolve(extIcons, `icon${s}.png`);
  writeFileSync(out, cache[s]);
  console.log(`wrote ${out}`);
}

// Favicon ICO (16 + 32 + 48)
const ico = buildIco([
  { size: 16, png: cache[16] },
  { size: 32, png: cache[32] },
  { size: 48, png: cache[48] },
]);
const icoPath = resolve(webApp, "favicon.ico");
writeFileSync(icoPath, ico);
console.log(`wrote ${icoPath} (${ico.length} bytes)`);
