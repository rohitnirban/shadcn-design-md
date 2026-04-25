import type { PresetData } from "./types";

/**
 * Raw decoded preset config as JSON. This is the byte-equivalent of what
 * the shadcn CLI gets after running `decodePreset(code)` internally.
 *
 * Use this if your downstream tool wants the structured config rather
 * than the markdown narrative.
 */
export function formatRawPreset(data: PresetData): string {
  const out = {
    code: data.code ?? null,
    sourceUrl:
      data.sourceUrl ??
      (data.code
        ? `https://ui.shadcn.com/create?preset=${data.code}`
        : null),
    generatedAt: data.generatedAt ?? new Date().toISOString(),
    install: data.code
      ? {
          init: `npx shadcn@latest init --preset ${data.code} --template next`,
          apply: `npx shadcn@latest apply ${data.code}`,
        }
      : null,
    decoded: data.decoded ?? null,
    resolved: {
      style: data.style ?? null,
      baseColor: data.baseColor ?? null,
      font: data.font ?? null,
      iconLibrary: data.iconLibrary ?? null,
      radius: data.radius ?? null,
    },
    cssVars: {
      light: data.cssVarsLight ?? null,
      dark: data.cssVarsDark ?? null,
    },
  };
  return JSON.stringify(out, null, 2);
}

/**
 * Resolved globals.css output: `:root`, `.dark`, and `@theme inline` blocks
 * with the actual OKLCH preset values inlined. Mirrors what
 * `pnpm dlx shadcn@latest apply <code>` writes into the project's CSS file.
 */
const CSS_VAR_ORDER = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--radius",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
];

function emitBlock(
  selector: string,
  vars: Record<string, string> | undefined,
  includeRadius: boolean
): string {
  if (!vars) return "";
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const key of CSS_VAR_ORDER) {
    if (key === "--radius" && !includeRadius) continue;
    const v = vars[key];
    if (v === undefined) continue;
    seen.add(key);
    lines.push(`  ${key}: ${v};`);
  }
  // Append any extras the registry produced that aren't in our canonical order.
  for (const [k, v] of Object.entries(vars)) {
    if (seen.has(k)) continue;
    if (k === "--radius" && !includeRadius) continue;
    lines.push(`  ${k}: ${v};`);
  }
  return `${selector} {\n${lines.join("\n")}\n}`;
}

const THEME_INLINE = `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}`;

export function formatGlobalsCss(data: PresetData): string {
  const root = emitBlock(":root", data.cssVarsLight, true);
  const dark = emitBlock(".dark", data.cssVarsDark, false);
  return [root, dark, THEME_INLINE].filter(Boolean).join("\n\n") + "\n";
}

function yamlString(v: string): string {
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function prettyFontHeading(slug?: string): string | undefined {
  if (!slug || slug === "inherit") return undefined;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatDesignMd(data: PresetData): string {
  const code = data.code ?? "<preset>";
  const sourceUrl =
    data.sourceUrl ?? `https://ui.shadcn.com/create?preset=${code}`;
  const generated = data.generatedAt ?? new Date().toISOString();
  const name = `Preset ${code}`;

  const installLine = `npx shadcn@latest apply ${code}`;
  const initLine = `npx shadcn@latest init --preset ${code} --template next`;

  const cfgLines: string[] = [];
  if (data.style) cfgLines.push(`  style:        ${yamlString(data.style)}`);
  if (data.baseColor) cfgLines.push(`  baseColor:    ${yamlString(data.baseColor)}`);
  if (data.font) cfgLines.push(`  font:         ${yamlString(data.font)}`);
  if (data.iconLibrary) cfgLines.push(`  iconLibrary:  ${yamlString(data.iconLibrary)}`);
  if (data.radius) cfgLines.push(`  radius:       ${yamlString(data.radius)}`);

  const frontMatter = `---
# ============================================================================
# DESIGN.md. Universal design system spec for AI coding agents.
#
# Follows the Google Labs DESIGN.md specification (open-sourced April 2026)
# AND the shadcn/ui Skills conventions (shadcn-ui/ui @ /skills/shadcn).
#
# Consumed by Claude Code, Cursor, Copilot, v0, Lovable, Stitch, Gemini CLI.
# YAML front matter is machine-readable; markdown body encodes rules and
# rationale. Both are authoritative.
# ----------------------------------------------------------------------------
# Generated: ${generated}
# Source:    ${sourceUrl}
# ============================================================================

version: alpha
name: ${yamlString(name)}
description: >
  Visual identity is defined by the shadcn preset \`${code}\`. Apply it with
  the install command below. Never hard-code OKLCH values, font sizes, or
  radius numbers in components. Always read live values from the project's
  \`globals.css\` (which the apply command rewrites).

# ---------------------------------------------------------------------------
# PRESET. The single source of truth for colors, fonts, radius, charts.
#
# Don't paste color values, font stacks, or radius numbers into this file.
# Apply the preset; let it own \`globals.css\`. Re-applying with a different
# code re-themes the whole project without touching component code.
# ---------------------------------------------------------------------------
preset:
  code:     ${yamlString(code)}
  url:      ${yamlString(sourceUrl)}
  apply:    ${yamlString(installLine)}
  init:     ${yamlString(initLine)}
${
  cfgLines.length > 0
    ? `\n  # Decoded preset config (informational only. Apply command is the truth):\n${cfgLines.join("\n")}\n`
    : "\n"
}
---

# ${name}

## Overview

The product should feel **[e.g. confident, minimal, editorial]** and read
as **[playful | professional]**. Density bias: **[dense | spacious]**.

Target user: **[e.g. ops managers who live in the product for hours]**.
Emotional response: **[e.g. calm, capable, in control]**.

Design principles, ordered by priority:

1. Clarity over decoration. Type and layout carry hierarchy before color does.
2. Semantic tokens, not raw colors. Every hex has a reason; every reason has a token.
3. Composition over invention. Prefer an assembled pattern over a bespoke one.
4. Accessibility is a floor, not a feature. WCAG AA is the minimum.

## Visual identity

The colors, font choices, radius, and chart palette are owned by the
shadcn preset \`${code}\`. **Apply the preset; do not redefine its tokens
inside this file.**

\`\`\`bash
${installLine}
\`\`\`

The apply command rewrites \`globals.css\` with the preset's full \`:root\`
and \`.dark\` blocks (background, foreground, card, popover, primary +
foreground, secondary + foreground, muted + foreground, accent +
foreground, destructive, border, input, ring, chart-1..5, sidebar-* and
\`--radius\`). Re-running with a different preset code re-themes the
entire project without touching component code. That's the point.

To bootstrap a fresh project from this preset:

\`\`\`bash
${initLine}
\`\`\`

Inspect or change the live values:

\`\`\`bash
# Read project config (framework, base, iconLibrary, aliases, installed list)
npx shadcn@latest info --json

# Browse / add components
npx shadcn@latest search <query>
npx shadcn@latest add <component> [more...]

# Read component-specific docs before generating code
npx shadcn@latest docs <component>
\`\`\`

## Colors. Usage rules (values come from the preset)

The palette is expressed in **OKLCH** so lightness and chroma translate
evenly across dark mode. Never hard-code raw hex or Tailwind colors
(\`bg-blue-500\`, \`text-emerald-600\`) inside components. Use semantic
tokens, all of which resolve to the values the preset wrote into
\`globals.css\`.

- **\`background\` / \`foreground\`**: app canvas and its text color.
- **\`card\` / \`card-foreground\`**: elevated content surface.
- **\`primary\` / \`primary-foreground\`**: the single most important action
  per screen. Reserve it. Never use it for decoration.
- **\`secondary\`**: subtle action surfaces, chips, quiet buttons.
- **\`muted\` / \`muted-foreground\`**: metadata, captions, de-emphasised text.
- **\`accent\`**: hover states and subtle highlights.
- **\`destructive\`**: delete, remove, irreversible actions. Exclusive use.
- **\`border\` / \`input\` / \`ring\`**: chrome. \`ring\` drives focus rings.
- **\`chart-1…chart-5\`**: categorical data colors used by shadcn Charts.
- **\`sidebar-*\`**: scoped tokens for the Sidebar primitive.

### Dark mode

Triggered by the \`.dark\` class on \`<html>\` (via \`next-themes\`
\`attribute="class"\`). The \`.dark\` block in \`globals.css\` redefines the
same variables. **Never author \`dark:\` color utilities in components.**

Two dark-mode details worth knowing:

1. **Primary inverts.** In light mode \`primary\` is near-black on near-white
   text; in dark mode it's near-white on near-black text. The name stays,
   the role stays, only lightness flips.
2. **Borders use alpha-channel OKLCH** (\`oklch(1 0 0 / 10%)\`). This keeps
   chrome subtle across whatever surface sits behind it. A solid
   dark-grey border would look too heavy on \`card\` but too light on
   \`background\`.

## Typography

The font stack comes from the preset (read from \`globals.css\` /
\`@theme\` after applying). Maximum **two font weights per screen**.
Labels and captions use \`label-*\` tokens; running text uses \`body-md\`.

- **Display & headlines**: Semibold. Tight tracking on display sizes.
- **Body**: Regular, comfortable reading line-height (1.5 to 1.6).
- **Labels**: Medium at 12 to 13px. Buttons, tags, table headers.
- **Mono**: for code, IDs, API keys, numeric columns.

## Layout

Fluid grid below \`lg\`, fixed **max-width 1280px** container above it.
Spacing follows an **8px base scale** with a 4px half-step. Related
content is grouped inside \`Card\` with 24px internal padding.

Breakpoints match Tailwind defaults: \`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536\`.

## Elevation & Depth

Hierarchy is carried by **tonal layers and borders**, not heavy shadows.
\`card\` sits one step above \`background\`. Overlays (\`Dialog\`, \`Sheet\`,
\`Drawer\`, \`Popover\`) use a single soft shadow plus \`border\`. Never
compound shadows. Focus is always conveyed by \`ring\`.

## Shapes

Corner radius is driven by a single \`--radius\` CSS variable supplied by
the preset; the \`rounded\` scale (\`rounded-sm\`, \`rounded-md\`,
\`rounded-lg\`, \`rounded-xl\`) derives from it. Interactive elements use
\`rounded-md\`. Cards use \`rounded-xl\`. Avatars and pill chips use
\`rounded-full\`.

## Components

Components follow shadcn/ui conventions. The assistant should **search
existing registries before authoring custom UI**:

\`\`\`bash
npx shadcn@latest search <intent>
npx shadcn@latest add <component>
\`\`\`

Compose, don't reinvent:

- **Settings page** -> \`Tabs\` + \`Card\` + \`Field\`/\`FieldGroup\` form controls
- **Dashboard** -> \`Sidebar\` + \`Card\` + \`Chart\` + \`Table\`
- **Data entry** -> \`FieldSet\` + \`FieldGroup\` + \`Field\` + \`Input\`/\`Select\`/\`Textarea\`
- **Confirmation flow** -> \`Dialog\` (with required \`DialogTitle\`)
- **Side panels** -> \`Sheet\` (with required \`SheetTitle\`)
- **Menus** -> \`DropdownMenu\` / \`Command\` (items wrapped in their \`*Group\`)
- **Option sets of 2 to 7** -> \`ToggleGroup\`, not manually styled buttons
- **Empty states** -> \`Empty\` component, not ad-hoc markup
- **Loading** -> \`Skeleton\` for layout, \`Button\` \`loading\` prop for actions

## Agent Rules (shadcn/ui Skill)

### Styling (\`rules/styling.md\`)

- **Semantic tokens only.** \`bg-primary\`, \`text-muted-foreground\`,
  \`border-border\`. Never raw Tailwind palette colors (\`bg-blue-500\`,
  \`text-emerald-600\`, \`text-red-600\`). For status indicators use
  \`Badge\` variants or \`text-destructive\`.
- **No manual \`dark:\` overrides.** Semantic tokens flip automatically via
  the \`.dark\` CSS variable block. \`bg-background\`, not
  \`bg-white dark:bg-gray-950\`.
- **\`className\` is for layout, not style.** Margin, width, grid, flex:
  yes. Overriding component colors or typography: no. Edit the component
  source or add a \`cva\` variant instead.
- **Spacing uses \`gap-*\`.** Never \`space-y-*\` / \`space-x-*\`.
  \`flex flex-col gap-4\`, not \`space-y-4\`.
- **Equal dimensions use \`size-*\`.** \`size-10\`, not \`w-10 h-10\`.
  Applies to avatars, icons, skeletons, icon-only buttons.
- **\`truncate\` is the shorthand.** Never
  \`overflow-hidden text-ellipsis whitespace-nowrap\`.
- **Conditional classes go through \`cn()\`** (from \`@/lib/utils\`).
  Never string-interpolate ternaries inside \`className\`.
- **Built-in variants first.** \`variant="outline"\`, \`size="sm"\` before custom
  \`className\`. Add new variants via \`cva\` in the component file when needed.
- **No manual \`z-index\` on overlays.** Dialog, Popover, Sheet, Tooltip
  ship with correct z-index. Don't stack extras.

### Composition (\`rules/composition.md\`)

- **Items always inside their Group.** \`SelectItem\` -> \`SelectGroup\`,
  \`DropdownMenuItem\` -> \`DropdownMenuGroup\`, \`CommandItem\` ->
  \`CommandGroup\`. Rendering items directly in the content container
  breaks the API.
- **Overlays require a Title.** \`Dialog\`, \`Sheet\`, \`Drawer\` must render
  \`DialogTitle\` / \`SheetTitle\` / \`DrawerTitle\` for screen readers. Hide
  visually with \`className="sr-only"\` when the design has no title.
- **Slot patterns.** Use \`asChild\` (Radix base) or \`render\` (Base UI base)
  for custom triggers. Check the \`base\` field via \`npx shadcn@latest info\`.

### Forms (\`rules/forms.md\`)

- **Use \`FieldGroup\` + \`Field\`.** Never raw \`<div>\` + \`<Label>\` with
  \`space-y-*\` for form layout.
- **\`InputGroup\` has specific children.** \`InputGroupInput\` /
  \`InputGroupTextarea\`. Never raw \`Input\`/\`Textarea\` nested inside.
- **Buttons-in-inputs use \`InputGroupAddon\`.** Never absolutely-position a
  \`Button\` inside an \`Input\`.
- **Option sets (2 to 7 choices) use \`ToggleGroup\`.** Don't loop \`Button\`
  with manual active state.
- **Group related checkboxes/radios with \`FieldSet\` + \`FieldLegend\`.**
  Not a \`<div>\` with a heading.
- **Validation:** \`data-invalid\` on \`Field\`, \`aria-invalid\` on the
  control. Pair with \`FieldDescription\` for the error message.
- **Disabled:** \`data-disabled\` on \`Field\`, \`disabled\` on the control.
- **Hidden labels:** \`FieldLabel className="sr-only"\`. Never omit the label.

### Icons (\`rules/icons.md\`)

- **Match the project's \`iconLibrary\`.** Lucide (\`lucide-react\`) by default;
  confirm with \`npx shadcn@latest info\`. Don't mix libraries.
- **Icons in buttons use \`data-icon\`.** \`data-icon="inline-start"\` or
  \`"inline-end"\`. No manual \`mr-2\` / \`ml-2\`. No sizing classes on icons
  rendered inside a component. The component handles it.

### Shortest correct examples

\`\`\`tsx
// Form layout: FieldGroup + Field, not div + Label.
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>

// Validation: data-invalid on Field, aria-invalid on the control.
<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Invalid email.</FieldDescription>
</Field>

// Icons in buttons: data-icon, no sizing classes.
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

// Spacing: gap-*, not space-y-*.
<div className="flex flex-col gap-4">        {/* correct */}
<div className="space-y-4">                  {/* wrong   */}

// Equal dimensions: size-*, not w-* h-*.
<Avatar className="size-10" />                {/* correct */}
<Avatar className="w-10 h-10" />              {/* wrong   */}

// Status colors: Badge variants or semantic tokens.
<Badge variant="secondary">+20.1%</Badge>     {/* correct */}
<span className="text-emerald-600">+20.1%</span> {/* wrong */}
\`\`\`

## Adding custom colors

Add the variable pair to the global CSS file (path comes from
\`shadcn info\`, typically \`app/globals.css\`). **Never create a new CSS
file** for this.

\`\`\`css
/* 1. Define under :root and .dark */
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

/* 2a. Tailwind v4: register inline in the same CSS file */
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}

/* 2b. Tailwind v3: register in tailwind.config.js instead */
\`\`\`

Check the Tailwind version with \`npx shadcn@latest info\` before adding
color variables.

## Do's and Don'ts

**Do**

- Apply the preset (\`${installLine}\`) instead of pasting color values.
- Reserve \`primary\` for the single most-important action per screen.
- Pair every surface token with its \`-foreground\` companion.
- Check registries with \`shadcn search\` before authoring custom UI.
- Use \`FieldGroup\` + \`Field\` for every form, even a single input.
- Wrap \`*Item\` components in their \`*Group\` parent.
- Render a title inside every \`Dialog\` / \`Sheet\` / \`Drawer\` (use \`sr-only\` if hiding).
- Use \`cn()\` for any conditional \`className\`.
- Maintain WCAG AA (4.5:1 for normal text, 3:1 for large text and UI chrome).

**Don't**

- Don't paste OKLCH values, font sizes, or radius numbers from this file.
  Re-apply the preset to change them.
- Don't use raw Tailwind palette colors (\`bg-blue-500\`, \`text-red-600\`,
  \`text-emerald-600\`). Go through semantic tokens.
- Don't write manual \`dark:\` overrides. The \`.dark\` class handles it.
- Don't use \`space-y-*\` or \`space-x-*\`. Use \`flex\` + \`gap-*\`.
- Don't use \`w-X h-X\` for equal dimensions. Use \`size-X\`.
- Don't override component colors via \`className\`. Edit source or add a \`cva\` variant.
- Don't nest raw \`Input\`/\`Textarea\` inside \`InputGroup\`.
- Don't loop \`Button\`s for a 2 to 7 option set. Use \`ToggleGroup\`.
- Don't apply manual \`z-index\` to overlays.
- Don't mix icon libraries. Match \`components.json\` -> \`iconLibrary\`.
- Don't mix rounded and sharp corners in the same view.
- Don't use more than two font weights on one screen.
`;

  void prettyFontHeading; // reserved for future use
  return frontMatter;
}

// Sample data for the landing page preview. Only metadata, no colors.
export const exampleDesignMdData: PresetData = {
  code: "b5JPhn173",
  sourceUrl: "https://ui.shadcn.com/create?preset=b5JPhn173",
  generatedAt: "2026-04-24T00:00:00.000Z",
  style: "vega",
  baseColor: "taupe",
  font: "Inter",
  iconLibrary: "lucide",
  radius: "0.625rem",
};

export const exampleDesignMd = formatDesignMd(exampleDesignMdData);
