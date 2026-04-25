export const faqs = [
  {
    question: "What does the extension actually do?",
    answer:
      "On any preset URL at ui.shadcn.com/create, it adds a DESIGN.md button next to the sidebar's Create Project. Click it and you get a portable design spec for AI coding agents. Three formats: human-readable DESIGN.md, raw decoded JSON config, and resolved globals.css with :root, .dark, and @theme inline blocks.",
  },
  {
    question: "Where do the colors come from?",
    answer:
      "The preset code in the URL (e.g. b4toiItxg0) is base62 bit-packed. The extension decodes it client-side using the same algorithm shipped in the shadcn CLI, then resolves the OKLCH values from the live theme registry on ui.shadcn.com. Output is byte-equivalent to what 'pnpm dlx shadcn@latest apply <code>' writes into globals.css.",
  },
  {
    question: "What permissions does it need?",
    answer:
      "Only the content_scripts match for https://ui.shadcn.com/create*. No activeTab, no downloads, no storage, no host permissions. File save uses a Blob plus an anchor tag; clipboard uses navigator.clipboard. No telemetry, no analytics, no remote calls beyond fetching the public theme registry chunk.",
  },
  {
    question: "Why three export formats?",
    answer:
      "DESIGN.md gives an AI coding agent the rules: semantic tokens only, no manual dark: overrides, FieldGroup over div+Label, etc. The raw JSON gives a structured config for tools that want to programmatically consume the preset. The globals.css gives you a drop-in file if you just want the colors and don't want to invoke the CLI.",
  },
  {
    question: "Does it work with all presets?",
    answer:
      "Yes. Any URL that takes a ?preset=<code> param is supported, including the encoded short codes (b-prefix, a-prefix) and the named presets like radix-vega. The full preset model is decoded: style, baseColor, theme, chartColor, font, fontHeading, iconLibrary, radius, menuAccent, menuColor.",
  },
  {
    question: "How do I install it?",
    answer:
      "Build with pnpm install && pnpm --filter @repo/extension build, then load apps/extension/dist as an unpacked extension at chrome://extensions with Developer mode on. A signed Chrome Web Store release is in the works.",
  },
];
