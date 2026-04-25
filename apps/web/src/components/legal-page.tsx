import React from "react";
import { Container } from "./container";
import { DivideX } from "./divide";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <DivideX />
      <Container className="border-divide border-x px-6 py-16 md:py-24">
        <article className="prose prose-neutral dark:prose-invert mx-auto max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Last updated: {updated}
          </p>
          <h1 className="mt-2 mb-8 text-4xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {children}
        </article>
      </Container>
      <DivideX />
    </main>
  );
}
