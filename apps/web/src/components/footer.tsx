import Link from "next/link";
import { Button } from "./button";
import { Container } from "./container";
import { Logo } from "./logo";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <Container>
      <div className="flex flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:py-12">
        <Logo />
        <p className="text-footer-link text-center text-sm md:text-left">
          &copy; {year} shadcn DESIGN.md. Open source. MIT.
        </p>
        <Button
          as={Link}
          href="https://github.com/rohitnirban/shadcn-design-md/releases/latest"
        >
          Download extension
        </Button>
      </div>
    </Container>
  );
};
