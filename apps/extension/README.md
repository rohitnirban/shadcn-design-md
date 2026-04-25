# shadcn design.md - Chrome extension

Adds a `design.md` button to [`ui.shadcn.com/create`](https://ui.shadcn.com/create) that exports the current preset as a markdown file.

## Build

```bash
pnpm install
pnpm --filter @repo/extension build
```

Output lands in `apps/extension/dist/` and `apps/extension/extension.zip`.

`pnpm --filter @repo/extension dev` runs esbuild in watch mode.

## Load unpacked in Chrome

1. Run the build above.
2. Open `chrome://extensions`.
3. Toggle **Developer mode** (top right).
4. Click **Load unpacked**, select `apps/extension/dist/`.
5. Visit https://ui.shadcn.com/create?preset=b5JPhn173 - a **design.md** button should appear next to the install / share buttons.

> Screenshots: _placeholder_ - drop `screenshot-button.png` and `screenshot-popover.png` here once the extension is loaded.

## Data source

**Chosen: DOM scrape (option 3 from the spec).**

We probed the documented endpoint candidates first:

| URL | Result |
| --- | --- |
| `https://ui.shadcn.com/r/presets/<code>.json` | 404 (SPA shell) |
| `https://ui.shadcn.com/api/presets/<code>` | 404 (SPA shell) |
| `https://ui.shadcn.com/r/presets/<code>` | 404 (SPA shell) |

The preset code in the URL is bit-packed and decoded entirely client-side - the SSR HTML never carries the decoded values. There is no public JSON endpoint to call.

We therefore read what the page itself has already painted: visible config labels via DOM walk (Style, Base Color, Font, Icon Library, Radius), and the live CSS custom properties on `:root` for both light and dark themes (we toggle `.dark` on `<html>` briefly to capture the dark variant).

**Future work:** port the bit-packing decoder from [`shadcn-ui/ui` `packages/shadcn/src/preset/`](https://github.com/shadcn-ui/ui/tree/main/packages/shadcn/src/preset) so the extension can produce a `design.md` from a preset URL alone, without a `/create` tab open.

## Testing

1. Load unpacked.
2. Open https://ui.shadcn.com/create?preset=b5JPhn173 in a fresh tab.
3. Wait for the page to settle - the button injects on `document_idle` and a `MutationObserver` retries on late re-renders.
4. Click **design.md** → popover with **Download design.md** and **Copy design.md**.
5. Try outside-click and `Esc` to dismiss.
6. Switch the page theme and re-export - dark CSS variables should appear in the output.

## Permissions

Minimal MV3:

- `content_scripts.matches`: `https://ui.shadcn.com/create*`
- No `activeTab`, `downloads`, `storage`, or host permissions beyond the match pattern.
- File save uses `Blob` + `<a download>`; clipboard uses `navigator.clipboard.writeText`.
