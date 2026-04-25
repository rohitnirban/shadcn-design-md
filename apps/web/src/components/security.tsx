import React from "react";
import { Container } from "./container";
import { DivideX } from "./divide";
import { SectionHeading } from "./seciton-heading";
import { SubHeading } from "./subheading";
import { Button } from "./button";
import Link from "next/link";

export const Security = () => {
  return (
    <>
      <Container className="border-divide border-x">
        <h2 className="pt-10 pb-5 text-center font-mono text-sm tracking-tight text-neutral-500 uppercase md:pt-20 md:pb-10 dark:text-neutral-400">
          PRIVACY BY DEFAULT
        </h2>
      </Container>
      <DivideX />
      <Container className="border-divide grid grid-cols-1 border-x bg-gray-100 px-8 py-12 md:grid-cols-2 dark:bg-neutral-900">
        <div>
          <SectionHeading className="text-left">
            Nothing leaves your browser
          </SectionHeading>
          <SubHeading as="p" className="mt-4 text-left">
            The preset code decodes locally. The only network call is to
            ui.shadcn.com for the theme registry chunk. No telemetry, no
            analytics, no account, no cookies. MV3 manifest with one match
            pattern.
          </SubHeading>
          <Button
            className="mt-4 mb-8 inline-block w-full md:w-auto"
            as={Link}
            href="https://github.com/yourname/shadcn-design-md"
          >
            Audit the source
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 text-sm font-mono text-gray-600 dark:text-neutral-300">
          <div className="rounded-md border border-divide px-4 py-2">
            content_scripts.matches: ui.shadcn.com/create*
          </div>
          <div className="rounded-md border border-divide px-4 py-2">
            permissions: []
          </div>
          <div className="rounded-md border border-divide px-4 py-2">
            host_permissions: []
          </div>
          <div className="rounded-md border border-divide px-4 py-2">
            telemetry: never
          </div>
        </div>
      </Container>
    </>
  );
};
