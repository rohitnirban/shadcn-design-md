import { getPresetData } from "./extractor";
import {
  formatDesignMd,
  formatRawPreset,
  formatGlobalsCss,
} from "./formatter";

const BUTTON_ID = "shadcn-design-md-button";
const DIALOG_ID = "shadcn-design-md-dialog";
const BACKDROP_ID = "shadcn-design-md-backdrop";

function buttonText(b: HTMLElement): string {
  return (b.textContent ?? "").trim();
}

/** Sidebar "Shuffle" button. Used as the row anchor. */
function findShuffleButton(): HTMLElement | null {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>("button"));
  return buttons.find((b) => buttonText(b) === "Shuffle") ?? null;
}

/**
 * Sidebar "Create Project" button. Distinct from header CP button.
 * Walk up from Shuffle until we hit a container with a sibling CP button.
 */
function findSidebarCreateButton(shuffle: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = shuffle.parentElement;
  while (node && node !== document.body) {
    const cp = Array.from(
      node.querySelectorAll<HTMLElement>("button")
    ).find((b) => buttonText(b) === "Create Project" && b !== shuffle);
    if (cp) return cp;
    node = node.parentElement;
  }
  return null;
}

function buildButton(template: HTMLElement): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.id = BUTTON_ID;
  btn.type = "button";
  btn.setAttribute("aria-label", "Open design.md export dialog");
  btn.className = template.className;
  btn.textContent = "DESIGN.md";
  return btn;
}

function destroyDialog() {
  document.getElementById(DIALOG_ID)?.remove();
  document.getElementById(BACKDROP_ID)?.remove();
  document.removeEventListener("keydown", escClose, true);
  document.body.style.overflow = "";
}

function escClose(e: KeyboardEvent) {
  if (e.key === "Escape") destroyDialog();
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

type View = "design" | "raw" | "css";

interface DialogState {
  view: View;
  designMd: string;
  rawJson: string;
  globalsCss: string;
  code: string;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

async function openDialog() {
  destroyDialog();

  const backdrop = el("div");
  backdrop.id = BACKDROP_ID;
  backdrop.className = "shadcn-dmd-backdrop";
  backdrop.addEventListener("click", destroyDialog);

  const dialog = el("div");
  dialog.id = DIALOG_ID;
  dialog.className = "shadcn-dmd-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "shadcn-dmd-title");
  dialog.addEventListener("click", (e) => e.stopPropagation());

  // Header
  const header = el("header", "shadcn-dmd-header");
  const titleWrap = el("div", "shadcn-dmd-title-wrap");
  const title = el("h2", "shadcn-dmd-title", "Export DESIGN.md");
  title.id = "shadcn-dmd-title";
  const subtitle = el(
    "p",
    "shadcn-dmd-subtitle",
    "Portable design spec for AI coding agents. Decoded from this preset."
  );
  titleWrap.append(title, subtitle);
  const closeBtn = el("button", "shadcn-dmd-close", "×");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.addEventListener("click", destroyDialog);
  header.append(titleWrap, closeBtn);

  // Tabs
  const tabs = el("div", "shadcn-dmd-tabs");
  const tabDesign = el("button", "shadcn-dmd-tab is-active", "DESIGN.md");
  tabDesign.type = "button";
  const tabRaw = el("button", "shadcn-dmd-tab", "Raw decoded");
  tabRaw.type = "button";
  const tabCss = el("button", "shadcn-dmd-tab", "Export CSS");
  tabCss.type = "button";
  tabs.append(tabDesign, tabRaw, tabCss);

  // Meta strip
  const meta = el("div", "shadcn-dmd-meta");

  // Body
  const body = el("div", "shadcn-dmd-body");
  const pre = el("pre", "shadcn-dmd-code");
  const codeEl = el("code");
  pre.appendChild(codeEl);
  body.appendChild(pre);

  // Footer actions
  const footer = el("footer", "shadcn-dmd-footer");
  const status = el("span", "shadcn-dmd-status");
  const actions = el("div", "shadcn-dmd-actions");
  const copyBtn = el("button", "shadcn-dmd-btn", "Copy");
  copyBtn.type = "button";
  copyBtn.disabled = true;
  const downloadBtn = el(
    "button",
    "shadcn-dmd-btn shadcn-dmd-btn-primary",
    "Download"
  );
  downloadBtn.type = "button";
  downloadBtn.disabled = true;
  actions.append(copyBtn, downloadBtn);
  footer.append(status, actions);

  dialog.append(header, tabs, meta, body, footer);
  document.body.append(backdrop, dialog);
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", escClose, true);

  // Load preset data
  const state: DialogState = {
    view: "design",
    designMd: "",
    rawJson: "",
    globalsCss: "",
    code: "design",
  };

  status.textContent = "Resolving preset…";

  try {
    const data = await getPresetData();
    state.designMd = formatDesignMd(data);
    state.rawJson = formatRawPreset(data);
    state.globalsCss = formatGlobalsCss(data);
    state.code = data.code ?? "design";

    meta.innerHTML = "";
    const chip = (label: string, value?: string) => {
      if (!value) return;
      const c = el("span", "shadcn-dmd-chip");
      c.append(
        el("span", "shadcn-dmd-chip-key", label),
        el("span", "shadcn-dmd-chip-val", value)
      );
      meta.appendChild(c);
    };
    chip("preset", data.code);
    chip("style", data.decoded?.style);
    chip("base", data.decoded?.baseColor);
    chip("theme", data.decoded?.theme);
    chip("font", data.decoded?.font);
    chip("icons", data.decoded?.iconLibrary);
    chip("radius", data.radius);

    render();
    status.textContent = "Ready.";
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  } catch (e) {
    status.textContent = "Failed to resolve preset.";
    console.error("[shadcn design.md]", e);
  }

  function payload(): { text: string; lang: string; copyLabel: string; downloadLabel: string; filename: string; mime: string } {
    switch (state.view) {
      case "raw":
        return {
          text: state.rawJson,
          lang: "language-json",
          copyLabel: "Copy raw JSON",
          downloadLabel: "Download raw.json",
          filename: `preset-${state.code}.json`,
          mime: "application/json",
        };
      case "css":
        return {
          text: state.globalsCss,
          lang: "language-css",
          copyLabel: "Copy CSS",
          downloadLabel: "Download globals.css",
          filename: `globals-${state.code}.css`,
          mime: "text/css",
        };
      default:
        return {
          text: state.designMd,
          lang: "language-markdown",
          copyLabel: "Copy DESIGN.md",
          downloadLabel: "Download DESIGN.md",
          filename: `DESIGN-${state.code}.md`,
          mime: "text/markdown",
        };
    }
  }

  function render() {
    tabDesign.classList.toggle("is-active", state.view === "design");
    tabRaw.classList.toggle("is-active", state.view === "raw");
    tabCss.classList.toggle("is-active", state.view === "css");
    const p = payload();
    codeEl.className = p.lang;
    codeEl.textContent = p.text;
    pre.scrollTop = 0;
    copyBtn.textContent = p.copyLabel;
    downloadBtn.textContent = p.downloadLabel;
  }

  tabDesign.addEventListener("click", () => {
    state.view = "design";
    render();
  });
  tabRaw.addEventListener("click", () => {
    state.view = "raw";
    render();
  });
  tabCss.addEventListener("click", () => {
    state.view = "css";
    render();
  });

  copyBtn.addEventListener("click", async () => {
    const ok = await copyToClipboard(payload().text);
    status.textContent = ok ? "Copied to clipboard." : "Copy failed.";
  });

  downloadBtn.addEventListener("click", () => {
    const p = payload();
    downloadFile(p.filename, p.text, p.mime);
    status.textContent = `Downloaded ${p.filename}`;
  });
}

function inject() {
  if (document.getElementById(BUTTON_ID)) return;

  const shuffle = findShuffleButton();
  if (!shuffle) return;

  const createBtn = findSidebarCreateButton(shuffle);
  if (!createBtn || !createBtn.parentElement) return;

  const btn = buildButton(createBtn);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (document.getElementById(DIALOG_ID)) {
      destroyDialog();
    } else {
      void openDialog();
    }
  });

  // Insert design.md immediately before the sidebar "Create Project" button.
  // Visual order: Shuffle -> DESIGN.md -> Create Project.
  createBtn.parentElement.insertBefore(btn, createBtn);
}

function start() {
  inject();
  const obs = new MutationObserver(() => inject());
  obs.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
