"use client";
import React, { useEffect, useState } from "react";
import { Container } from "./container";
import { Badge } from "./badge";
import { SectionHeading } from "./seciton-heading";
import { SubHeading } from "./subheading";
import {
  RocketIcon,
  GraphIcon,
  ShieldIcon,
  ReuseBrainIcon,
  ScreenCogIcon,
  BellIcon,
} from "@/icons/card-icons";
import { Scale } from "./scale";
import { AnimatePresence, motion } from "motion/react";
import { RealtimeSyncIcon } from "@/icons/bento-icons";
import { DivideX } from "./divide";
import { LogoSVG } from "./logo";
import { OpenAILogo, SlackLogo } from "@/icons/general";
import { IconBlock } from "./common/icon-block";
import { HorizontalLine } from "./common/horizontal-line";
import { VerticalLine } from "./common/vertical-line";

export const Benefits = () => {
  const benefits = [
    {
      title: "Byte-equivalent decode",
      description:
        "Same base62 bitpack algorithm as the shadcn CLI. Output matches `apply` exactly.",
      icon: <RocketIcon className="text-brand size-6" />,
    },
    {
      title: "Live theme registry",
      description:
        "Fetches the current registry chunk so OKLCH values stay in sync with ui.shadcn.com.",
      icon: <RealtimeSyncIcon className="text-brand size-6" />,
    },
    {
      title: "Three export formats",
      description:
        "DESIGN.md narrative, raw JSON config, or resolved globals.css. Pick whichever fits.",
      icon: <GraphIcon className="text-brand size-6" />,
    },
    {
      title: "AI-agent ready",
      description:
        "DESIGN.md encodes shadcn Skill rules: semantic tokens, FieldGroup, no manual dark:.",
      icon: <ReuseBrainIcon className="text-brand size-6" />,
    },
    {
      title: "Zero permissions",
      description:
        "MV3 manifest with one match pattern. No activeTab, downloads, storage, or host perms.",
      icon: <ShieldIcon className="text-brand size-6" />,
    },
    {
      title: "Open source. MIT",
      description:
        "No telemetry, no analytics, no account. Build it yourself or grab the release zip.",
      icon: <ScreenCogIcon className="text-brand size-6" />,
    },
  ];
  return (
    <Container className="border-divide relative overflow-hidden border-x px-4 py-20 md:px-8">
      <div className="relative flex flex-col items-center">
        <Badge text="Why this exists" />
        <SectionHeading className="mt-4">
          A portable design spec for AI agents
        </SectionHeading>

        <SubHeading as="p" className="mx-auto mt-6 max-w-lg">
          shadcn presets are great for humans. AI coding agents need rules
          plus values plus a CSS file. This extension gives you all three.
        </SubHeading>
      </div>
      <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid grid-cols-1 gap-4">
          {benefits.slice(0, 3).map((benefit, index) => (
            <Card key={benefit.title} {...benefit} />
          ))}
        </div>
        <MiddleCard />
        <div className="grid grid-cols-1 gap-4">
          {benefits.slice(3, 6).map((benefit, index) => (
            <Card key={benefit.title} {...benefit} />
          ))}
        </div>
      </div>
    </Container>
  );
};

const MiddleCard = () => {
  const formats = [
    { label: "DESIGN.md", color: "var(--color-brand)" },
    { label: "raw.json", color: "oklch(0.6 0.15 230)" },
    { label: "globals.css", color: "oklch(0.65 0.15 320)" },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActive((p) => (p + 1) % formats.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative flex min-h-60 flex-col items-center justify-center overflow-hidden rounded-lg bg-muted/40 p-4 md:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dots)_1px,transparent_1px)] mask-radial-from-10% [background-size:10px_10px]" />

      {/* Top row: preset URL pill */}
      <div className="shadow-card relative z-10 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
        <span className="size-2 rounded-full bg-brand" />
        <span className="font-mono text-[10px] text-foreground">
          ?preset=b4toiItxg0
        </span>
      </div>

      {/* Vertical pipe with traveling dot */}
      <div className="relative z-10 my-3 h-12 w-px bg-border">
        <motion.span
          className="absolute left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-brand shadow-[0_0_8px_2px_var(--color-brand)]"
          animate={{ top: ["-4px", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      </div>

      {/* Center: extension logo with rotating ring */}
      <div className="relative z-10 mb-3 grid size-16 shrink-0 place-items-center overflow-hidden rounded-md bg-card p-px shadow-xl">
        <div className="absolute inset-0 scale-[1.4] animate-spin rounded-full bg-conic [background-image:conic-gradient(at_center,transparent,var(--color-brand)_25%,transparent_45%)] [animation-duration:3s]" />
        <div className="relative z-20 grid h-full w-full place-items-center rounded-[5px] bg-card">
          <LogoSVG width={28} height={28} />
        </div>
      </div>

      {/* Bottom row: rotating output format chip */}
      <div className="relative z-10 flex h-7 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={active}
            initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            transition={{ duration: 0.25 }}
            className="shadow-card flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-foreground"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: formats[active]!.color }}
            />
            {formats[active]!.label}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

const Card = (props: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  const { title, description, icon } = props;
  return (
    <div className="relative z-10 rounded-lg bg-gray-50 p-4 transition duration-200 hover:bg-transparent md:p-5 dark:bg-neutral-800">
      <div className="flex items-center gap-2">{icon}</div>
      <h3 className="mt-4 mb-2 text-lg font-medium">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
