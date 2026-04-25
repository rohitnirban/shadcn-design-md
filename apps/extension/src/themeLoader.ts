// Runtime theme loader.
//
// Fetches the /_next/static/chunks/*.js file that carries the full
// `registry:theme` array from ui.shadcn.com, hand-parses it (no `eval` or
// `new Function`, MV3 CSP forbids both), and returns a `{ [themeName]:
// { light, dark } }` map. Always uses live data so values stay in sync
// with whatever ui.shadcn.com/create deploys.
//
// Fallback: the bundled `@repo/shared/themes.json` snapshot if the live
// fetch or parse ever fails. That keeps the extension usable offline too.

import bundledThemes from "@repo/shared/themes.json";

export type ThemeEntry = {
  light?: Record<string, string>;
  dark?: Record<string, string>;
};
export type ThemesMap = Record<string, ThemeEntry>;

const BUNDLED = bundledThemes as ThemesMap;

// Marker unique to the preset theme array in ui.shadcn.com chunks.
const MARKER = '{name:"neutral",title:"Neutral",type:"registry:theme"';

let cache: ThemesMap | null = null;
let inflight: Promise<ThemesMap> | null = null;

export async function loadThemes(): Promise<ThemesMap> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const live = await loadLive();
      if (live && Object.keys(live).length > 0) {
        cache = live;
        return live;
      }
    } catch (e) {
      console.warn("[shadcn design.md] live theme load failed, using bundled snapshot", e);
    }
    cache = BUNDLED;
    return BUNDLED;
  })();
  return inflight;
}

async function loadLive(): Promise<ThemesMap | null> {
  const urls = Array.from(
    new Set(
      Array.from(document.scripts)
        .map((s) => s.src)
        .filter((s) => /\/_next\/static\/chunks\/[a-z0-9./_-]+\.js/i.test(s))
    )
  );

  // Fetch in parallel; first hit wins.
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, { credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.includes(MARKER)) throw new Error("no marker");
      return parseThemesFromSource(text);
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      return r.value;
    }
  }
  return null;
}

/** Find the theme array in the bundle source and hand-parse it. */
function parseThemesFromSource(src: string): ThemesMap {
  const markerIdx = src.indexOf(MARKER);
  if (markerIdx < 0) throw new Error("marker not found");
  // Walk back to the enclosing `[`.
  let open = markerIdx;
  while (open > 0 && src.charCodeAt(open) !== 91 /* [ */) open--;
  if (src.charCodeAt(open) !== 91) throw new Error("no array open bracket");

  const [arr, end] = parseJsValue(src, open);
  if (!Array.isArray(arr)) throw new Error("parsed value is not an array");
  const out: ThemesMap = {};
  for (const entry of arr) {
    if (
      entry &&
      typeof entry === "object" &&
      typeof entry.name === "string" &&
      entry.cssVars
    ) {
      out[entry.name] = entry.cssVars;
    }
  }
  if (Object.keys(out).length === 0) throw new Error("no themes parsed");
  void end;
  return out;
}

// ─── Hand-written JS object-literal parser ──────────────────────────────────
// Handles: objects (bare + quoted keys), arrays, strings (single/double),
// numbers, true/false/null. No trailing commas (minified bundles don't use
// them). No comments. No identifier references. Only what the theme array
// uses. Intentionally narrow so there's no surprise execution surface.

function parseJsValue(src: string, i: number): [unknown, number] {
  i = skipWs(src, i);
  const c = src[i];
  if (c === "{") return parseObject(src, i);
  if (c === "[") return parseArray(src, i);
  if (c === '"' || c === "'") return parseString(src, i);
  if (c === "t" || c === "f") return parseBool(src, i);
  if (c === "n") return parseNull(src, i);
  if (c === "-" || (c !== undefined && c >= "0" && c <= "9")) {
    return parseNumber(src, i);
  }
  throw new Error(`unexpected ${JSON.stringify(c)} at ${i}`);
}

function skipWs(src: string, i: number): number {
  while (i < src.length) {
    const c = src.charCodeAt(i);
    // space, tab, CR, LF, comma
    if (c === 32 || c === 9 || c === 10 || c === 13 || c === 44) i++;
    else break;
  }
  return i;
}

function parseObject(src: string, i: number): [Record<string, unknown>, number] {
  if (src[i] !== "{") throw new Error("expected { at " + i);
  i++;
  const obj: Record<string, unknown> = {};
  while (i < src.length) {
    i = skipWs(src, i);
    if (src[i] === "}") return [obj, i + 1];
    const [key, k2] = parseKey(src, i);
    i = skipWs(src, k2);
    if (src[i] !== ":") throw new Error("expected : at " + i);
    i++;
    const [val, v2] = parseJsValue(src, i);
    obj[key] = val;
    i = v2;
  }
  throw new Error("unterminated object");
}

function parseKey(src: string, i: number): [string, number] {
  i = skipWs(src, i);
  const c = src[i];
  if (c === '"' || c === "'") return parseString(src, i);
  // bare identifier: [A-Za-z_$][A-Za-z0-9_$-]*
  const start = i;
  while (i < src.length) {
    const ch = src[i];
    if (
      (ch !== undefined &&
        ((ch >= "a" && ch <= "z") ||
          (ch >= "A" && ch <= "Z") ||
          (ch >= "0" && ch <= "9") ||
          ch === "_" ||
          ch === "$" ||
          ch === "-"))
    ) {
      i++;
    } else break;
  }
  if (i === start) throw new Error("bad key at " + start);
  return [src.slice(start, i), i];
}

function parseArray(src: string, i: number): [unknown[], number] {
  if (src[i] !== "[") throw new Error("expected [ at " + i);
  i++;
  const arr: unknown[] = [];
  while (i < src.length) {
    i = skipWs(src, i);
    if (src[i] === "]") return [arr, i + 1];
    const [val, v2] = parseJsValue(src, i);
    arr.push(val);
    i = v2;
  }
  throw new Error("unterminated array");
}

function parseString(src: string, i: number): [string, number] {
  const quote = src[i];
  if (quote !== '"' && quote !== "'") throw new Error("expected quote at " + i);
  i++;
  let out = "";
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") {
      const next = src[i + 1];
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else if (next === "r") out += "\r";
      else if (next === "u") {
        const hex = src.slice(i + 2, i + 6);
        out += String.fromCharCode(parseInt(hex, 16));
        i += 6;
        continue;
      } else if (next !== undefined) {
        out += next;
      }
      i += 2;
      continue;
    }
    if (c === quote) return [out, i + 1];
    out += c;
    i++;
  }
  throw new Error("unterminated string");
}

function parseNumber(src: string, i: number): [number, number] {
  const start = i;
  if (src[i] === "-" || src[i] === "+") i++;
  while (i < src.length) {
    const c = src[i] ?? "";
    if ((c >= "0" && c <= "9") || c === "." || c === "e" || c === "E" || c === "-" || c === "+") {
      i++;
    } else break;
  }
  return [parseFloat(src.slice(start, i)), i];
}

function parseBool(src: string, i: number): [boolean, number] {
  if (src.startsWith("true", i)) return [true, i + 4];
  if (src.startsWith("false", i)) return [false, i + 5];
  throw new Error("bad bool at " + i);
}

function parseNull(src: string, i: number): [null, number] {
  if (src.startsWith("null", i)) return [null, i + 4];
  throw new Error("bad null at " + i);
}
