# Security

## Reporting a vulnerability

Open a private security advisory via GitHub:

1. Go to the repo's **Security** tab
2. **Report a vulnerability**
3. Describe the issue, impact, and reproduction steps

Please don't open a public issue for security problems.

## Scope

In scope:

- The Chrome extension's content script (preset decode, theme registry fetch, dialog UI, file save, clipboard)
- The shared formatter (`packages/shared/src/formatter.ts`)
- The landing page (`apps/web`)

Out of scope:

- `ui.shadcn.com` itself
- Vulnerabilities in third-party deps already disclosed upstream (forward those to the upstream project)
- Issues that require a malicious browser extension already running with broader permissions

## Threat model notes

The extension is intentionally minimal:

- MV3 manifest with one `content_scripts` match (`https://ui.shadcn.com/create*`)
- No `permissions`, no `host_permissions`, no `activeTab`, no `downloads`, no `storage`
- File save uses `Blob` + `<a download>`; clipboard uses `navigator.clipboard.writeText`
- The only network call is the live theme registry fetch from `ui.shadcn.com` (CSP-allowed connect-src)
- Preset decode is pure-JS, no `eval` / `new Function`

If you find a way to expand the effective permission surface or exfiltrate data, that's worth reporting.

## Disclosure timeline

- **Day 0**: report received
- **Within 5 days**: acknowledgement + initial assessment
- **Within 30 days**: fix or mitigation plan
- **Public disclosure**: after a fix ships, or 90 days from report (whichever is sooner), unless coordinated otherwise
