import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Security | shadcn DESIGN.md",
  description:
    "Security policy, threat model, and vulnerability disclosure for the shadcn DESIGN.md Chrome extension.",
  alternates: { canonical: "/security" },
};

const UPDATED = "2026-04-25";

export default function SecurityPage() {
  return (
    <LegalPage title="Security" updated={UPDATED}>
      <h2>Reporting a vulnerability</h2>
      <p>
        Open a private security advisory on GitHub:
      </p>
      <ol>
        <li>
          Go to the{" "}
          <a href="https://github.com/rohitnirban/shadcn-design-md/security">
            repository&apos;s Security tab
          </a>
          .
        </li>
        <li>Click <strong>Report a vulnerability</strong>.</li>
        <li>Describe the issue, impact, and reproduction steps.</li>
      </ol>
      <p>
        Please don&apos;t open a public issue for security problems.
      </p>

      <h2>Threat model</h2>
      <p>The extension is intentionally minimal:</p>
      <ul>
        <li>
          MV3 manifest with a single <code>content_scripts.matches</code>{" "}
          entry: <code>https://ui.shadcn.com/create*</code>.
        </li>
        <li>
          No <code>permissions</code>, no <code>host_permissions</code>, no{" "}
          <code>activeTab</code>, no <code>downloads</code>, no{" "}
          <code>storage</code>.
        </li>
        <li>
          File save uses <code>Blob</code> +{" "}
          <code>&lt;a download&gt;</code>; clipboard uses{" "}
          <code>navigator.clipboard.writeText</code>.
        </li>
        <li>
          The only network call is the live theme registry fetch from{" "}
          <code>ui.shadcn.com</code> (CSP-allowed connect-src).
        </li>
        <li>
          Preset decode is pure JavaScript: no <code>eval</code>, no{" "}
          <code>new Function</code>.
        </li>
      </ul>

      <h2>Scope</h2>
      <p>
        <strong>In scope:</strong>
      </p>
      <ul>
        <li>
          Extension content script: preset decode, registry fetch, dialog
          UI, file save, clipboard.
        </li>
        <li>
          Shared formatter (
          <code>packages/shared/src/formatter.ts</code>).
        </li>
        <li>This landing page (<code>apps/web</code>).</li>
      </ul>
      <p>
        <strong>Out of scope:</strong>
      </p>
      <ul>
        <li><code>ui.shadcn.com</code> itself.</li>
        <li>
          Vulnerabilities in third-party dependencies already disclosed
          upstream (please report those to the upstream project).
        </li>
        <li>
          Issues that require a malicious browser extension already running
          with broader permissions than this one.
        </li>
      </ul>

      <h2>Disclosure timeline</h2>
      <ul>
        <li><strong>Day 0:</strong> report received.</li>
        <li>
          <strong>Within 5 days:</strong> acknowledgement and initial
          assessment.
        </li>
        <li>
          <strong>Within 30 days:</strong> fix or mitigation plan.
        </li>
        <li>
          <strong>Public disclosure:</strong> after a fix ships, or 90 days
          from report (whichever is sooner), unless coordinated otherwise.
        </li>
      </ul>

      <h2>Audit</h2>
      <p>
        The repository is open source (MIT). Source:{" "}
        <a href="https://github.com/rohitnirban/shadcn-design-md">
          github.com/rohitnirban/shadcn-design-md
        </a>
        . Production builds are reproducible with{" "}
        <code>pnpm install --frozen-lockfile &amp;&amp; pnpm build</code>.
      </p>
    </LegalPage>
  );
}
