# Contributing

Thanks for taking the time to look. This project is small. PRs and issues welcome.

## Repo layout

```
apps/
  web/         # Next.js 16.2 + Tailwind v4 + shadcn (landing page)
  extension/   # MV3 Chrome extension (TS + esbuild)
packages/
  shared/      # Types + formatters consumed by both apps
scripts/       # Icon generation
```

## Setup

```bash
pnpm install
pnpm build          # turbo: builds web + extension + shared
```

Per-workspace dev:

```bash
pnpm --filter @repo/web dev          # localhost:3000
pnpm --filter @repo/extension dev    # esbuild watch -> dist/
```

## Loading the extension locally

1. Build it: `pnpm --filter @repo/extension build`
2. `chrome://extensions` -> Developer mode on
3. Load unpacked -> pick `apps/extension/dist/`
4. Visit any URL like `https://ui.shadcn.com/create?preset=b5JPhn173`

## What's worth a PR

- Bug fixes for preset decode discrepancies vs `shadcn apply`
- Improvements to the DESIGN.md formatter (clearer rules, missing tokens)
- New export formats (Tailwind v3 config, JSON-LD, etc.)
- Landing page copy / accessibility fixes
- Test coverage (extension is untested)

## What probably isn't

- Adding telemetry, analytics, or remote calls
- New permissions in `manifest.json`
- Build-time fetches that require auth
- UI redesigns of `ui.shadcn.com/create` itself

## Style

- TypeScript strict. No `any` without justification.
- Prefer Edit over Write when changing existing files.
- No em dashes. Use `.` `:` `-` instead.
- Default to no comments. Add one only when the WHY is non-obvious.
- Match existing component patterns; don't introduce new abstractions casually.

## Commits

Prefer Conventional Commits format:

```
fix(extractor): handle sera/lyra style radius override
feat(formatter): add formatGlobalsCss with @theme inline block
```

## Tests / verification before PR

- `pnpm build` passes (web + extension + shared all green)
- For extension changes: load unpacked, visit a preset URL, verify the dialog opens and exports match `pnpm dlx shadcn@latest apply <code>`
- For web changes: `pnpm --filter @repo/web dev`, verify the section in browser

## Releasing (maintainers)

```bash
pnpm release patch        # 0.1.0 -> 0.1.1
pnpm release minor        # 0.1.0 -> 0.2.0
pnpm release major        # 0.1.0 -> 1.0.0
pnpm release 0.3.0-beta.1 # explicit
```

That bumps `apps/extension/{manifest,package}.json`, commits `chore(release): v<version>`, and tags `v<version>` locally. Then build the extension and create the GitHub release manually:

```bash
git push origin main --tags
pnpm --filter @repo/extension build
gh release create v<version> \
  apps/extension/shadcn-design-md-<version>.zip \
  --title v<version> --generate-notes
```

The local build emits `shadcn-design-md-<version>.zip` with `manifest.json` at the zip root (no nested folder). Upload that file to the Chrome Web Store as-is.

## Code of Conduct

By contributing, you agree to follow [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
