"use client";
import React from "react";
import { Container } from "./container";
import { Heading } from "./heading";
import { SubHeading } from "./subheading";
import { Star } from "@/icons/general";
import { motion } from "motion/react";
import { Button } from "./button";
import { Badge } from "./badge";
import Link from "next/link";

export const Hero = () => {
  return (
    <Container className="border-divide flex flex-col items-center justify-center border-x px-4 pt-10 pb-10 md:pt-32 md:pb-20">
      <Badge text="Chrome extension. MV3. Zero telemetry." />
      <Heading className="mt-4">
        Export any shadcn preset as <br />
        a <span className="text-brand">DESIGN.md</span>
      </Heading>

      <SubHeading className="mx-auto mt-6 max-w-xl">
        One click on ui.shadcn.com/create. Get a portable design spec for
        AI coding agents: rules, decoded config, and resolved globals.css.
        Byte-equivalent to <code className="text-charcoal-700 dark:text-neutral-100">shadcn apply</code>.
      </SubHeading>

      <div className="mt-6 flex items-center gap-4">
        <Button as={Link} href="#install">
          Install extension
        </Button>
        <Button
          variant="secondary"
          as={Link}
          href="https://ui.shadcn.com/create?preset=b5JPhn173"
        >
          Try a preset
        </Button>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: index * 0.05 }}
            >
              <Star key={index} />
            </motion.div>
          ))}
        </div>
        <span className="border-l border-gray-500 pl-4 text-[10px] text-gray-600 sm:text-sm">
          Open source. MIT. No account required.
        </span>
      </div>
    </Container>
  );
};
