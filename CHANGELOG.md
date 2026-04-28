# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-04-28

### Added
- DESIGN.md output now embeds a resolved `globals.css` block (`:root`, `.dark`, `@theme inline`) alongside the raw decoded preset JSON, so the export is a single drop-in spec for AI coding agents.
- CI workflow uploads the built extension zip as a downloadable artifact on every push.

### Changed
- Landing page Install / Add to Chrome / Download CTAs (hero, navbar, mobile menu, CTA section, footer, install FAQ) now redirect to `https://github.com/rohitnirban/shadcn-design-md/releases/latest` until the Chrome Web Store listing is approved.

### Fixed
- Extension build no longer nests the output inside an extra `extension/` folder; `manifest.json` sits at the zip root.
- CI zip-layout check rewritten to use POSIX-compatible `awk | grep -qx` instead of the Perl-only `\d` shorthand that failed on the GitHub runner.

## [0.1.0] - 2026-04-26

### Added
- Initial public release of the `shadcn DESIGN.md` Chrome extension (MV3).
- Adds a **DESIGN.md** button next to *Create Project* on `https://ui.shadcn.com/create`.
- Decodes shadcn preset codes (base62 bit-packed `b-` / `a-` prefixes and named presets like `radix-vega`) client-side using the same algorithm shipped in the shadcn CLI.
- Resolves OKLCH values from the live theme registry on `ui.shadcn.com`; output is byte-equivalent to `pnpm dlx shadcn@latest apply <code>`.
- Three export formats: human-readable `DESIGN.md`, raw decoded JSON, and resolved `globals.css`.
- Full preset model decoded: `style`, `baseColor`, `theme`, `chartColor`, `font`, `fontHeading`, `iconLibrary`, `radius`, `menuAccent`, `menuColor`.
- Tag-triggered GitHub release workflow that publishes `shadcn-design-md-<version>.zip` plus `.sha256` to the Releases page.

[0.1.1]: https://github.com/rohitnirban/shadcn-design-md/releases/tag/v0.1.1
[0.1.0]: https://github.com/rohitnirban/shadcn-design-md/releases/tag/v0.1.0
