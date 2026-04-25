#!/usr/bin/env node
// Bump extension version, commit, tag. You then push the tag manually.
//
// Usage:  pnpm release <version>     (e.g. pnpm release 0.2.0)
//         pnpm release patch         (0.1.0 -> 0.1.1)
//         pnpm release minor         (0.1.0 -> 0.2.0)
//         pnpm release major         (0.1.0 -> 1.0.0)
//
// Updates:
//   apps/extension/manifest.json  ("version")
//   apps/extension/package.json   ("version")
// Then:
//   git add ...
//   git commit -m "chore(release): v<version>"
//   git tag    "v<version>"
//
// Push trigger is intentionally manual:
//   git push origin main --tags

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const manifestPath = resolve(root, "apps/extension/manifest.json");
const pkgPath = resolve(root, "apps/extension/package.json");

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}
function writeJson(p, obj) {
  writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}
function sh(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root });
}

function bump(curr, kind) {
  const m = curr.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (!m) throw new Error(`unparseable version: ${curr}`);
  let [, major, minor, patch] = m;
  major = +major; minor = +minor; patch = +patch;
  if (kind === "patch") patch += 1;
  else if (kind === "minor") { minor += 1; patch = 0; }
  else if (kind === "major") { major += 1; minor = 0; patch = 0; }
  else throw new Error(`unknown bump kind: ${kind}`);
  return `${major}.${minor}.${patch}`;
}

function isVersion(s) {
  return /^\d+\.\d+\.\d+([.\-+].*)?$/.test(s);
}

const arg = process.argv[2];
if (!arg) {
  console.error("usage: pnpm release <version|patch|minor|major>");
  process.exit(2);
}

const manifest = readJson(manifestPath);
const pkg = readJson(pkgPath);
const current = manifest.version;

let next;
if (["patch", "minor", "major"].includes(arg)) {
  next = bump(current, arg);
} else if (isVersion(arg)) {
  next = arg;
} else {
  console.error(`error: "${arg}" is neither a semver nor patch|minor|major`);
  process.exit(2);
}

console.log(`bump: ${current} -> ${next}`);

manifest.version = next;
pkg.version = next;
writeJson(manifestPath, manifest);
writeJson(pkgPath, pkg);

// Verify clean working tree (other than the bumped files)
const status = execSync("git status --porcelain", { cwd: root }).toString().trim();
const allowed = new Set([
  "apps/extension/manifest.json",
  "apps/extension/package.json",
]);
const dirty = status
  .split("\n")
  .filter(Boolean)
  .map((l) => l.slice(3))
  .filter((p) => !allowed.has(p));
if (dirty.length > 0) {
  console.error("error: working tree has uncommitted changes outside the bump:");
  for (const p of dirty) console.error(`  - ${p}`);
  process.exit(1);
}

sh(`git add apps/extension/manifest.json apps/extension/package.json`);
sh(`git commit -m "chore(release): v${next}"`);
sh(`git tag v${next}`);

console.log("");
console.log(`done. push the tag to trigger the GitHub release workflow:`);
console.log(`  git push origin main --tags`);
