// Data source: full offline decode.
//
// We reverse-engineered ui.shadcn.com/create by downloading its client chunks
// and extracting the embedded theme registry. The preset model has three
// discrete overlay layers:
//
//   1. baseColor → provides the FULL cssVars for both light and dark
//      (background, card, popover, primary, accent, chart-*, sidebar-*, ...).
//      Values live in the `cssVars.light` / `cssVars.dark` of the base-color
//      entry inside `themes.json`.
//
//   2. theme → provides a PARTIAL cssVars overlay that tints primary,
//      chart-*, secondary, and sidebar-primary. Applied on top of the
//      baseColor vars. (Most presets have theme == baseColor, in which
//      case this step is a no-op.)
//
//   3. chartColor → if different from `theme`, overlay the chart-1..5
//      tokens from that theme's overlay.
//
// `themes.json` is extracted verbatim from ui.shadcn.com client chunk
// `c6945af4c1af3ad3.js` (look for `let o=[{name:"neutral",...}]`). The
// preset code itself is decoded via the base62 bit-unpacker ported from
// `shadcn@4.4.0 → dist/chunk-XEZLDAV3.js` below.
//
// Result: no network fetch, no DOM scrape, no CSS-variable hunting.
// Everything the user could pick on /create is resolvable from the URL.

import type { CssVars, PresetData } from "@repo/shared";
import { loadThemes, type ThemesMap } from "./themeLoader";

// ─── Preset bit-pack decoder (port of shadcn CLI chunk-XEZLDAV3.js) ─────────
const BASE62 =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const STYLES = ["nova", "vega", "maia", "lyra", "mira", "luma", "sera"];
const BASE_COLORS = [
  "neutral",
  "stone",
  "zinc",
  "gray",
  "mauve",
  "olive",
  "mist",
  "taupe",
];
const THEME_COLORS = [
  "neutral",
  "stone",
  "zinc",
  "gray",
  "amber",
  "blue",
  "cyan",
  "emerald",
  "fuchsia",
  "green",
  "indigo",
  "lime",
  "orange",
  "pink",
  "purple",
  "red",
  "rose",
  "sky",
  "teal",
  "violet",
  "yellow",
  "mauve",
  "olive",
  "mist",
  "taupe",
];
const ICON_LIBRARIES = ["lucide", "hugeicons", "tabler", "phosphor", "remixicon"];
const FONTS = [
  "inter",
  "noto-sans",
  "nunito-sans",
  "figtree",
  "roboto",
  "raleway",
  "dm-sans",
  "public-sans",
  "outfit",
  "jetbrains-mono",
  "geist",
  "geist-mono",
  "lora",
  "merriweather",
  "playfair-display",
  "noto-serif",
  "roboto-slab",
  "oxanium",
  "manrope",
  "space-grotesk",
  "montserrat",
  "ibm-plex-sans",
  "source-sans-3",
  "instrument-sans",
  "eb-garamond",
  "instrument-serif",
];
const FONTS_HEADING = ["inherit", ...FONTS];
const RADII = ["default", "none", "small", "medium", "large"];
const MENU_ACCENT = ["subtle", "bold"];
const MENU_COLOR = [
  "default",
  "inverted",
  "default-translucent",
  "inverted-translucent",
];

interface BitField {
  key: string;
  values: readonly string[];
  bits: number;
}
const FIELDS_A: BitField[] = [
  { key: "menuColor", values: MENU_COLOR, bits: 3 },
  { key: "menuAccent", values: MENU_ACCENT, bits: 3 },
  { key: "radius", values: RADII, bits: 4 },
  { key: "font", values: FONTS, bits: 6 },
  { key: "iconLibrary", values: ICON_LIBRARIES, bits: 6 },
  { key: "theme", values: THEME_COLORS, bits: 6 },
  { key: "baseColor", values: BASE_COLORS, bits: 6 },
  { key: "style", values: STYLES, bits: 6 },
];
const FIELDS_B: BitField[] = [
  ...FIELDS_A,
  { key: "chartColor", values: THEME_COLORS, bits: 6 },
  { key: "fontHeading", values: FONTS_HEADING, bits: 5 },
];

function fromBase62(s: string): number {
  let t = 0;
  for (let i = 0; i < s.length; i++) {
    const idx = BASE62.indexOf(s[i] as string);
    if (idx === -1) return -1;
    t = t * 62 + idx;
  }
  return t;
}

interface Decoded {
  style: string;
  baseColor: string;
  theme: string;
  chartColor: string;
  font: string;
  iconLibrary: string;
  radius: string;
  menuAccent: string;
  menuColor: string;
  fontHeading: string;
}

function decodePreset(code: string | null): Decoded | null {
  if (!code || code.length < 2) return null;
  const prefix = code[0];
  if (prefix !== "a" && prefix !== "b") return null;
  const fields = prefix === "a" ? FIELDS_A : FIELDS_B;
  const num = fromBase62(code.slice(1));
  if (num < 0) return null;

  const out: Record<string, string> = {};
  let shift = 0;
  for (const f of fields) {
    const mask = 2 ** f.bits;
    const idx = Math.floor(num / 2 ** shift) % mask;
    out[f.key] = (f.values[idx] ?? f.values[0]) as string;
    shift += f.bits;
  }
  if (prefix === "a") out.fontHeading = "inherit";
  // chartColor defaults to theme when absent (variant "a" presets).
  if (!out.chartColor) out.chartColor = out.theme as string;
  return out as unknown as Decoded;
}

// ─── Overlay resolver ───────────────────────────────────────────────────────
// Source: ui.shadcn.com/create chunk c6945af4c1af3ad3.js
//   let f = [
//     {name:"default", value:""},          // → use base color's stored radius
//     {name:"none",    value:"0"},
//     {name:"small",   value:"0.45rem"},
//     {name:"medium",  value:"0.625rem"},
//     {name:"large",   value:"0.875rem"}
//   ];
const RADIUS_MAP: Record<string, string> = {
  none: "0",
  small: "0.45rem",
  medium: "0.625rem",
  default: "0.625rem",
  large: "0.875rem",
};

// Source-of-truth transform from chunk 5c6f7e39aa513b3a.js:
//   const l = "lyra" === n.style || "sera" === n.style;
//   const i = l ? "none" : n.radius;
// The /create page forces radius to "none" for the lyra and sera visual
// styles regardless of what the URL preset code says.
function applyStyleRadiusOverride(style: string, radius: string): string {
  if (style === "lyra" || style === "sera") return "none";
  return radius;
}

const CHART_KEYS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

// Direct port of the official `y(e)` resolver from ui.shadcn.com/create
// (chunk c6945af4c1af3ad3.js). The page calls this exact pipeline to turn
// a preset config into the cssVars that drive the preview, so reproducing
// it here gives byte-identical output.
function mergeLayer(
  themes: ThemesMap,
  scheme: "light" | "dark",
  baseColor: string,
  theme: string,
  chartColor: string,
  radiusName: string,
  menuAccent: string
): CssVars {
  // 1. base ← theme merge (full base, then theme partials override).
  const base = themes[baseColor]?.[scheme] ?? {};
  const themeOverlay =
    theme !== baseColor ? (themes[theme]?.[scheme] ?? {}) : {};
  const merged: Record<string, string> = { ...base, ...themeOverlay };

  // 2. chart overlay. Always applied if chartColor entry exists (the
  //    official resolver doesn't skip when chartColor === theme; idempotent
  //    in that case so we mirror it).
  const chartSrc = themes[chartColor]?.[scheme];
  if (chartSrc) {
    for (const k of CHART_KEYS) {
      const v = chartSrc[k];
      if (v) merged[k] = v;
    }
  }

  // 3. menuAccent === "bold" → accent / accent-foreground take primary.
  if (menuAccent === "bold") {
    if (merged.primary) merged.accent = merged.primary;
    if (merged["primary-foreground"]) {
      merged["accent-foreground"] = merged["primary-foreground"];
    }
  }

  // 4. Radius. Only set on light. Dark inherits from `:root` per spec.
  if (scheme === "light") {
    if (radiusName === "none") {
      merged.radius = "0";
    } else if (radiusName !== "default") {
      const r = RADIUS_MAP[radiusName];
      if (r) merged.radius = r;
    } else if (!merged.radius) {
      merged.radius = themes[baseColor]?.light?.radius ?? "0.625rem";
    }
  } else {
    delete merged.radius;
  }

  // shadcn v4 themes ship `destructive` without a paired `-foreground`.
  // The DESIGN.md format expects the pair, so synthesize it.
  if (merged.destructive && !merged["destructive-foreground"]) {
    merged["destructive-foreground"] = "oklch(0.985 0 0)";
  }

  const out: CssVars = {};
  for (const [k, v] of Object.entries(merged)) {
    out[`--${k}`] = v;
  }
  return out;
}

function prettyFont(slug?: string): string | undefined {
  if (!slug || slug === "inherit") return undefined;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Public entry point ─────────────────────────────────────────────────────
export async function getPresetData(): Promise<PresetData> {
  const code =
    new URL(location.href).searchParams.get("preset") ?? undefined;

  const base: PresetData = {
    code,
    sourceUrl: code
      ? `https://ui.shadcn.com/create?preset=${code}`
      : location.href,
    generatedAt: new Date().toISOString(),
  };

  const decoded = decodePreset(code ?? null);
  if (!decoded) return base;

  const themes = await loadThemes();

  // Apply the page's style→radius override before merging.
  const effectiveRadius = applyStyleRadiusOverride(
    decoded.style,
    decoded.radius
  );

  const cssVarsLight = mergeLayer(
    themes,
    "light",
    decoded.baseColor,
    decoded.theme,
    decoded.chartColor,
    effectiveRadius,
    decoded.menuAccent
  );
  const cssVarsDark = mergeLayer(
    themes,
    "dark",
    decoded.baseColor,
    decoded.theme,
    decoded.chartColor,
    effectiveRadius,
    decoded.menuAccent
  );

  const resolvedRadius =
    cssVarsLight["--radius"] ?? RADIUS_MAP[effectiveRadius] ?? "0.625rem";

  const data: PresetData = {
    ...base,
    style: decoded.style,
    baseColor: decoded.baseColor,
    font: prettyFont(decoded.font),
    iconLibrary: decoded.iconLibrary,
    radius: resolvedRadius,
    decoded: {
      style: decoded.style,
      baseColor: decoded.baseColor,
      theme: decoded.theme,
      chartColor: decoded.chartColor,
      font: decoded.font,
      fontHeading: decoded.fontHeading,
      iconLibrary: decoded.iconLibrary,
      radius: decoded.radius,
      menuAccent: decoded.menuAccent,
      menuColor: decoded.menuColor,
    },
    cssVarsLight,
    cssVarsDark,
  };
  console.debug("[shadcn design.md] resolved preset", data);
  return data;
}
