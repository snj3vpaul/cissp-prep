import { Hero } from "@/components/landing/hero";
import { DomainStrip } from "@/components/landing/domain-strip";
import { Features } from "@/components/landing/features";
import { ScreenshotCarousel } from "@/components/landing/screenshot-carousel";
import { ExamFormat } from "@/components/landing/exam-format";
import { FinalCta } from "@/components/landing/final-cta";
import { QUESTIONS } from "@/data/questions";
import { FLASHCARDS } from "@/data/flashcards";

export default function LandingPage() {
  return (
    <>
      <Hero questionCount={QUESTIONS.length} cardCount={FLASHCARDS.length} />
      <Features />
      <ScreenshotCarousel />
      <DomainStrip />
      <ExamFormat />
      <FinalCta />
    </>
  );
}
