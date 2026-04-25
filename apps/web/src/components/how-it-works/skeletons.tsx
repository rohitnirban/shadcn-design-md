"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogoSVG } from "../logo";

/* ============================================================================
 * 1. Install the extension.
 *    Animated chrome://extensions tile flips from "Load unpacked" -> installed.
 * ========================================================================== */

export const DesignYourWorkflowSkeleton = () => {
  const [phase, setPhase] = useState<"idle" | "loading" | "ready">("idle");
  useEffect(() => {
    const a = setTimeout(() => setPhase("loading"), 600);
    const b = setTimeout(() => setPhase("ready"), 1800);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center px-6 py-8">
      <motion.div
        layout
        className="shadow-card relative flex w-72 flex-col gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            chrome://extensions
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">MV3</span>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 220 }}
            className="shrink-0"
          >
            <LogoSVG width={36} height={36} />
          </motion.div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold text-foreground">
              shadcn DESIGN.md
            </span>
            <span className="text-xs text-muted-foreground">v0.1.0</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Permissions: <span className="font-mono">none</span>
          </span>
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.button
                key="load"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                Load unpacked
              </motion.button>
            )}
            {phase === "loading" && (
              <motion.div
                key="spin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="inline-block size-3 rounded-full border-2 border-muted-foreground border-t-transparent"
                />
                Loading
              </motion.div>
            )}
            {phase === "ready" && (
              <motion.span
                key="ok"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-md border border-brand bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand"
              >
                Enabled
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-[10px] font-mono text-muted-foreground">
          <span className="text-foreground">match:</span>
          ui.shadcn.com/create*
        </div>
      </motion.div>
    </div>
  );
};

/* ============================================================================
 * 2. Open any preset URL.
 *    Address bar types a preset URL, then a DESIGN.md button slots into the
 *    sidebar between Shuffle and Create Project.
 * ========================================================================== */

const PRESET_URL = "ui.shadcn.com/create?preset=b4toiItxg0";

export const ConnectYourTooklsSkeleton = () => {
  const [typed, setTyped] = useState("");
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      if (i <= PRESET_URL.length) {
        setTyped(PRESET_URL.slice(0, i));
        setTimeout(tick, 30 + Math.random() * 20);
      } else {
        setTimeout(() => setShowButton(true), 400);
      }
    };
    tick();
    return () => {};
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 px-6 py-8">
      {/* Browser address bar */}
      <div className="shadow-card flex w-[320px] items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
        <div className="flex gap-1">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-yellow-400" />
          <span className="size-2 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 truncate font-mono text-[11px] text-foreground">
          {typed}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            className="ml-px inline-block w-px"
          >
            |
          </motion.span>
        </div>
      </div>

      {/* Sidebar mock with injected button */}
      <div className="shadow-card flex w-[320px] flex-col gap-2 rounded-xl border border-border bg-card p-3">
        <span className="text-[10px] font-mono uppercase text-muted-foreground">
          sidebar
        </span>
        <button className="rounded-md border border-border bg-muted px-3 py-2 text-left text-xs font-medium">
          Shuffle
        </button>
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 280 }}
              className="relative rounded-md border border-brand bg-brand/10 px-3 py-2 text-left text-xs font-semibold text-brand"
            >
              DESIGN.md
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -right-2 -top-2 size-4 rounded-full border-2 border-card bg-brand"
              />
            </motion.button>
          )}
        </AnimatePresence>
        <button className="rounded-md bg-primary px-3 py-2 text-left text-xs font-medium text-primary-foreground">
          Create Project
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. Pick a format.
 *    Three tabs cycle. Active tab shows a tiny code preview + Copy / Download.
 * ========================================================================== */

const FORMATS: {
  label: string;
  filename: string;
  preview: string[];
}[] = [
  {
    label: "DESIGN.md",
    filename: "DESIGN-b4toiItxg0.md",
    preview: [
      "# Preset b4toiItxg0",
      "",
      "## Visual identity",
      "Apply: pnpm dlx shadcn",
      "  apply b4toiItxg0",
    ],
  },
  {
    label: "Raw JSON",
    filename: "preset-b4toiItxg0.json",
    preview: [
      `{`,
      `  "decoded": {`,
      `    "style": "sera",`,
      `    "baseColor": "taupe"`,
      `  }`,
    ],
  },
  {
    label: "Export CSS",
    filename: "globals-b4toiItxg0.css",
    preview: [
      `:root {`,
      `  --background:`,
      `    oklch(1 0 0);`,
      `  --primary:`,
      `    oklch(0.555 ...);`,
    ],
  },
];

export const DeployAndScaleSkeleton = () => {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % FORMATS.length);
      setCopied(false);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setCopied(true), 900);
    return () => clearTimeout(id);
  }, [active]);

  const fmt = FORMATS[active]!;

  return (
    <div className="relative flex h-full w-full items-center justify-center px-6 py-8">
      <div className="shadow-card flex w-[330px] flex-col rounded-xl border border-border bg-card">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {FORMATS.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setActive(i)}
              className={cn(
                "relative flex-1 px-3 py-2 text-[11px] font-medium transition",
                i === active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              {i === active && (
                <motion.span
                  layoutId="fmt-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 bg-foreground"
                />
              )}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="relative h-32 overflow-hidden bg-muted/40 p-3 font-mono text-[10px] leading-snug text-foreground">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
            >
              {fmt.preview.map((line, i) => (
                <div key={i} className="whitespace-pre">
                  {line || " "}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="truncate font-mono text-[10px] text-muted-foreground">
            {fmt.filename}
          </span>
          <div className="flex gap-1.5">
            <motion.button
              whileTap={{ scale: 0.94 }}
              className={cn(
                "rounded-md border px-2 py-1 text-[10px] font-medium transition",
                copied
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card text-foreground",
              )}
            >
              {copied ? "Copied" : "Copy"}
            </motion.button>
            <button className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
