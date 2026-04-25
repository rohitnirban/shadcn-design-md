"use client";
import React, { useState } from "react";
import { Container } from "./container";
import { Badge } from "./badge";
import { SectionHeading } from "./seciton-heading";
import { SubHeading } from "./subheading";
import {
  DevopsIcon,
  PhoneIcon,
  TruckIcon,
  DatabaseIcon,
  WalletIcon,
  GraphIcon,
} from "@/icons/card-icons";
import { Scale } from "./scale";
import { motion } from "motion/react";

export const UseCases = () => {
  const useCases = [
    {
      title: "Claude Code / Cursor",
      description:
        "Drop the DESIGN.md into your repo. Agent picks up rules + tokens + commands.",
      icon: <DevopsIcon className="text-brand size-6" />,
    },
    {
      title: "v0 / Lovable / Stitch",
      description:
        "Paste DESIGN.md as a system prompt. Agent generates components in your brand.",
      icon: <GraphIcon className="text-brand size-6" />,
    },
    {
      title: "Quick prototyping",
      description:
        "Grab the resolved globals.css. Drop into any Tailwind v4 + shadcn project.",
      icon: <TruckIcon className="text-brand size-6" />,
    },
    {
      title: "Theme handoff",
      description:
        "Send a designer a single URL. They preview live; engineering installs via CLI.",
      icon: <PhoneIcon className="text-brand size-6" />,
    },
    {
      title: "Tooling integrations",
      description:
        "Raw decoded JSON for build scripts, design system audits, or registry tooling.",
      icon: <DatabaseIcon className="text-brand size-6" />,
    },
    {
      title: "Documentation",
      description:
        "Commit DESIGN.md alongside CONTRIBUTING.md. New contributors get the rules.",
      icon: <WalletIcon className="text-brand size-6" />,
    },
  ];
  const [activeUseCase, setActiveUseCase] = useState<number | null>(null);
  return (
    <Container className="border-divide relative overflow-hidden border-x px-4 md:px-8">
      <div className="relative flex flex-col items-center py-20">
        <Badge text="Use cases" />
        <SectionHeading className="mt-4">
          Whatever consumes your design tokens
        </SectionHeading>

        <SubHeading as="p" className="mx-auto mt-6 max-w-lg">
          DESIGN.md, raw JSON, or globals.css. One preset URL, three
          formats, every coding agent and framework.
        </SubHeading>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase, index) => (
            <div
              onMouseEnter={() => setActiveUseCase(index)}
              key={useCase.title}
              className="relative"
            >
              {activeUseCase === index && (
                <motion.div
                  layoutId="scale"
                  className="absolute inset-0 z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                >
                  <Scale />
                </motion.div>
              )}
              <div className="relative z-10 rounded-lg bg-gray-50 p-4 transition duration-200 hover:bg-transparent md:p-5 dark:bg-neutral-800">
                <div className="flex items-center gap-2">{useCase.icon}</div>
                <h3 className="mt-4 mb-2 text-lg font-medium">
                  {useCase.title}
                </h3>
                <p className="text-gray-600">{useCase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};
