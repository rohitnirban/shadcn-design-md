import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | shadcn DESIGN.md",
  description:
    "Privacy policy for the shadcn DESIGN.md Chrome extension and landing page. No telemetry, no analytics, no account.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "2026-04-25";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={UPDATED}>
      <h2>Summary</h2>
      <p>
        The shadcn DESIGN.md Chrome extension does not collect, transmit,
        store, or share any personal data. There is no account system, no
        analytics, no telemetry, and no remote logging. Everything happens
        locally in your browser.
      </p>

      <h2>What the extension does</h2>
      <p>
        On <code>https://ui.shadcn.com/create*</code>, the extension reads
        the <code>?preset=</code> query parameter, decodes it locally with
        the same algorithm shipped in the shadcn CLI, and renders three
        export formats inside a dialog: a Markdown spec, a JSON config, and
        a CSS file.
      </p>

      <h2>Data the extension touches</h2>
      <ul>
        <li>
          <strong>Preset code from the URL.</strong> Read from
          <code>location.href</code>. Decoded in JavaScript. Never sent off
          your machine.
        </li>
        <li>
          <strong>Theme registry.</strong> Fetched from the public
          <code>/_next/static/chunks/</code> URL on{" "}
          <code>ui.shadcn.com</code>. This is the same file the page itself
          loads. No identifying parameters are added.
        </li>
        <li>
          <strong>Clipboard.</strong> Used only when you click Copy. The
          extension writes to your clipboard via{" "}
          <code>navigator.clipboard.writeText</code>. Nothing is read from
          your clipboard.
        </li>
        <li>
          <strong>Downloads.</strong> Files are produced by{" "}
          <code>Blob</code> + <code>&lt;a download&gt;</code>. Your browser
          handles the save dialog. The extension does not request the
          <code>downloads</code> permission.
        </li>
      </ul>

      <h2>Permissions</h2>
      <ul>
        <li>
          <code>content_scripts.matches</code>: <code>ui.shadcn.com/create*</code>
        </li>
        <li>No <code>activeTab</code>, no <code>downloads</code>, no <code>storage</code>, no <code>host_permissions</code>.</li>
      </ul>

      <h2>Cookies and local storage</h2>
      <p>
        The extension does not set cookies and does not write to
        <code>localStorage</code>, <code>sessionStorage</code>, or
        <code>chrome.storage</code>.
      </p>

      <h2>This website</h2>
      <p>
        The landing page at this domain is a static site. It does not set
        analytics cookies, does not embed third-party trackers, and does not
        collect personal data. Standard server access logs may be retained
        by the hosting provider for operational purposes.
      </p>

      <h2>Third parties</h2>
      <p>
        The extension communicates only with <code>ui.shadcn.com</code> to
        fetch the public theme registry chunk. The site is hosted on the
        third party listed in the project's deployment configuration; refer
        to that provider's privacy policy for hosting-related processing.
      </p>

      <h2>Children</h2>
      <p>
        The extension and site are not directed at children under 13. No
        personal data is knowingly collected from anyone, including
        children.
      </p>

      <h2>Changes</h2>
      <p>
        Material changes will be reflected by updating the &quot;Last
        updated&quot; date above and recorded in the project&apos;s git
        history.
      </p>

      <h2>Contact</h2>
      <p>
        Open an issue at{" "}
        <a href="https://github.com/rohitnirban/shadcn-design-md/issues">
          github.com/rohitnirban/shadcn-design-md/issues
        </a>
        .
      </p>
    </LegalPage>
  );
}
