import { build, context } from "esbuild";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");
const watch = process.argv.includes("--watch");

async function copyAssets() {
  await mkdir(dist, { recursive: true });
  await cp(resolve(root, "manifest.json"), resolve(dist, "manifest.json"));
  await cp(resolve(root, "src/styles.css"), resolve(dist, "styles.css"));
  if (existsSync(resolve(root, "icons"))) {
    // Only copy PNG icons referenced by manifest. Source SVG stays out of the
    // shipped artifact so Chrome Web Store doesn't get confused by stray files.
    await cp(resolve(root, "icons"), resolve(dist, "icons"), {
      recursive: true,
      filter: (src) => !src.toLowerCase().endsWith(".svg"),
    });
  }
}

const buildOptions = {
  entryPoints: [resolve(root, "src/content.ts")],
  bundle: true,
  format: "iife",
  target: ["chrome120"],
  outfile: resolve(dist, "content.js"),
  sourcemap: watch ? "inline" : false,
  legalComments: "none",
  logLevel: "info",
};

await rm(dist, { recursive: true, force: true });
await copyAssets();

if (watch) {
  const ctx = await context({
    ...buildOptions,
    plugins: [
      {
        name: "copy-assets-on-rebuild",
        setup(b) {
          b.onEnd(() => copyAssets().catch(console.error));
        },
      },
    ],
  });
  await ctx.watch();
  console.log("[extension] watching for changes...");
} else {
  await build(buildOptions);
  console.log("[extension] built ->", dist);
}
