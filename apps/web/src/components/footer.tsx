import Link from "next/link";
import { Button } from "./button";
import { Container } from "./container";
import { Logo } from "./logo";
import { INSTALL_URL } from "@/lib/site-url";

const legalLinks = [
  { title: "Privacy", href: "/privacy" },
  { title: "Terms", href: "/terms" },
  { title: "Security", href: "/security" },
];

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <Container>
      <div className="flex flex-col items-center justify-between gap-6 border-t border-divide px-4 py-10 md:flex-row md:py-12">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo />
          <p className="text-footer-link text-center text-sm md:text-left">
            &copy; {year} shadcn DESIGN.md. Open source. MIT.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          {legalLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-footer-link transition-colors hover:text-foreground"
            >
              {l.title}
            </Link>
          ))}
          <Link
            href="https://github.com/rohitnirban/shadcn-design-md"
            className="text-footer-link transition-colors hover:text-foreground"
          >
            GitHub
          </Link>
        </nav>

        <Button
          as={Link}
          href={INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download extension
        </Button>
      </div>
    </Container>
  );
};
