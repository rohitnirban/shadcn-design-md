# shadcn DESIGN.md

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Add%20to%20Chrome-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/shadcn-designmd/kjmjiabdahkbogclcjjladohijlmffng)

Chrome extension that exports any shadcn preset on [`ui.shadcn.com/create`](https://ui.shadcn.com/create) as a portable design spec for AI coding agents.

> **Install:** [Chrome Web Store →](https://chromewebstore.google.com/detail/shadcn-designmd/kjmjiabdahkbogclcjjladohijlmffng) · or grab the unpacked zip from [Releases](https://github.com/rohitnirban/shadcn-design-md/releases/latest).

Three formats from one click:

- **DESIGN.md** - human-readable narrative + agent rules (semantic tokens, FieldGroup, no manual `dark:`, etc.)
- **Raw decoded JSON** - structured preset config (style, baseColor, theme, chartColor, font, fontHeading, iconLibrary, radius, menuAccent, menuColor) + resolved CSS vars
- **Export CSS** - resolved `globals.css` with `:root`, `.dark`, and `@theme inline` blocks

Output is byte-equivalent to what `pnpm dlx shadcn@latest apply <code>` writes.

## Why

shadcn presets are great for humans. AI coding agents need three things: rules, values, and a CSS file they can drop in. This extension produces all three from any preset URL, locally, with zero permissions.

- **Byte-equivalent decode** - same base62 bitpack algorithm shipped in the shadcn CLI
- **Live theme registry** - fetches the current registry chunk so OKLCH values stay in sync
- **Zero permissions** - MV3 manifest with one `content_scripts` match, no host perms
- **Open source. MIT** - no telemetry, no analytics, no account

## Repo layout

```
apps/
  web/         # Next.js 16.2 + Tailwind v4 + shadcn (landing page)
  extension/   # MV3 Chrome extension (TS + esbuild)
packages/
  shared/      # Types + formatters consumed by both apps
scripts/       # Icon generation
```

## Versions (locked)

| | |
| --- | --- |
| Next.js | `16.2.4` |
| React | `19.2.5` |
| React Compiler | enabled (stable, requires `babel-plugin-react-compiler@^1.0.0`) |
| Tailwind | `v4.2.4` |
| Turborepo | `^2.9.6` |
| Node | `>=20` (tested on 24) |
| pnpm | `10.x` |

## Install

```bash
pnpm install
```

## Develop

```bash
pnpm dev          # turbo: web dev server + extension watch
```

Per-workspace:

```bash
pnpm --filter @repo/web dev          # localhost:3000
pnpm --filter @repo/extension dev    # esbuild watch -> dist/
```

## Build

```bash
pnpm build
```

- `apps/web` -> `.next/`
- `apps/extension` -> `apps/extension/dist/` and `apps/extension/extension.zip`

## Install the extension

### Chrome Web Store (recommended)

[Add to Chrome](https://chromewebstore.google.com/detail/shadcn-designmd/kjmjiabdahkbogclcjjladohijlmffng), then visit https://ui.shadcn.com/create?preset=b5JPhn173.

### Unpacked (for development or if you prefer to side-load)

1. `pnpm install && pnpm build` (or download `shadcn-design-md-<version>.zip` from [Releases](https://github.com/rohitnirban/shadcn-design-md/releases/latest) and unzip)
2. Open `chrome://extensions`
3. Toggle Developer mode (top right)
4. **Load unpacked** -> select `apps/extension/dist/` (or the unzipped release folder)
5. Visit https://ui.shadcn.com/create?preset=b5JPhn173

The DESIGN.md button slots into the sidebar between **Shuffle** and **Create Project**. Click it. Pick a tab. Copy or download.

## Architecture notes

- **Preset decode** lives in [`apps/extension/src/extractor.ts`](apps/extension/src/extractor.ts). Direct port of the shadcn CLI's `decodePreset` (base62 bitpack) plus the official `y(e)` resolver pipeline (baseColor merge -> theme overlay -> chartColor overlay -> menuAccent bold swap -> radius override).
- **Theme registry** is fetched at runtime by [`apps/extension/src/themeLoader.ts`](apps/extension/src/themeLoader.ts) from the public chunk on `ui.shadcn.com`. CSP-safe hand-written JS literal parser; no `eval` / `new Function`. Falls back to a bundled snapshot if the live fetch ever fails.
- **Formatters** live in [`packages/shared/src/formatter.ts`](packages/shared/src/formatter.ts): `formatDesignMd`, `formatRawPreset`, `formatGlobalsCss`. Both apps import from the same source so what you see on the landing page matches what the extension produces.
- **Dialog UI** is in [`apps/extension/src/content.ts`](apps/extension/src/content.ts) - native DOM, no React, uses shadcn-style OKLCH tokens, dark-mode media query.

## Privacy

The preset code decodes locally. The only network call is the public theme registry chunk on `ui.shadcn.com`. No telemetry, no analytics, no account, no cookies. Audit the source - it's small.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Bug reports and PRs welcome.

## License

[MIT](./LICENSE)
