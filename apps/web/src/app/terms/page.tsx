import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | shadcn DESIGN.md",
  description:
    "Terms of service for the shadcn DESIGN.md Chrome extension and landing page.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "2026-04-25";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={UPDATED}>
      <h2>Acceptance</h2>
      <p>
        By installing, using, or distributing the shadcn DESIGN.md Chrome
        extension or this website (collectively, the &quot;Software&quot;),
        you agree to these terms. If you do not agree, do not use the
        Software.
      </p>

      <h2>License</h2>
      <p>
        The Software is open source under the{" "}
        <a href="https://github.com/rohitnirban/shadcn-design-md/blob/main/LICENSE">
          MIT License
        </a>
        . You may use, copy, modify, merge, publish, distribute,
        sublicense, and sell copies, subject to the conditions in that
        license.
      </p>

      <h2>No warranty</h2>
      <p>
        The Software is provided &quot;as is&quot;, without warranty of any
        kind, express or implied, including but not limited to the
        warranties of merchantability, fitness for a particular purpose,
        and noninfringement. See the LICENSE file for the full disclaimer.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        In no event shall the authors or copyright holders be liable for
        any claim, damages, or other liability, whether in an action of
        contract, tort, or otherwise, arising from, out of, or in
        connection with the Software or the use or other dealings in the
        Software.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not use the Software to violate any applicable law or to
        infringe the rights of others. The extension is designed to read
        publicly accessible data on{" "}
        <code>ui.shadcn.com/create</code> and produce derived files for
        your own use.
      </p>

      <h2>Third-party services</h2>
      <p>
        The extension fetches the public theme registry chunk from{" "}
        <code>ui.shadcn.com</code>, which is operated by a third party.
        Use of <code>ui.shadcn.com</code> is governed by that site&apos;s
        own terms.
      </p>

      <h2>Trademarks</h2>
      <p>
        &quot;shadcn&quot; and related marks are property of their
        respective owners. This project is independent and not affiliated
        with, endorsed by, or sponsored by shadcn-ui or its maintainers.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may change. Updates are reflected by changing the
        &quot;Last updated&quot; date above and recorded in the
        project&apos;s git history. Continued use after a change
        constitutes acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: open an issue at{" "}
        <a href="https://github.com/rohitnirban/shadcn-design-md/issues">
          github.com/rohitnirban/shadcn-design-md/issues
        </a>
        .
      </p>
    </LegalPage>
  );
}
