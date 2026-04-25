import { Benefits } from "@/components/benefits";
import { CTA } from "@/components/cta";
import { DivideX } from "@/components/divide";
import { FAQs } from "@/components/faqs";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Security } from "@/components/security";
import { UseCases } from "@/components/use-cases";

export default function Home() {
  return (
    <main>
      <DivideX />
      <Hero />
      <DivideX />
      <section id="how-it-works" className="scroll-mt-24">
        <HowItWorks />
      </section>
      <DivideX />
      <section id="demo" className="scroll-mt-24">
        <UseCases />
      </section>
      <DivideX />
      <Benefits />
      <DivideX />
      <Security />
      <DivideX />
      <section id="faq" className="scroll-mt-24">
        <FAQs />
      </section>
      <DivideX />
      <section id="install" className="scroll-mt-24">
        <CTA />
      </section>
      <DivideX />
    </main>
  );
}
