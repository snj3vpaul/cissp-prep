import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DOMAINS, getDomainBySlug } from "@/lib/domains";
import { QuizSession } from "@/components/quiz/quiz-session";
import { SPECIAL_MODES } from "@/lib/quiz-modes";

export function generateStaticParams() {
  return [...DOMAINS.map((d) => ({ domain: d.slug })), ...Object.keys(SPECIAL_MODES).map((k) => ({ domain: k }))];
}

type Params = Promise<{ domain: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { domain } = await params;
  const d = getDomainBySlug(domain);
  const special = SPECIAL_MODES[domain as keyof typeof SPECIAL_MODES];
  if (d) {
    return {
      title: `Domain ${d.id}: ${d.name} drill`,
      description: `Original CISSP practice questions for Domain ${d.id} — ${d.name} (${d.weight}% of the exam), with manager-mindset rationales.`,
    };
  }
  return { title: special?.title ?? "Quiz" };
}

export default async function QuizDomainPage({ params }: { params: Params }) {
  const { domain } = await params;
  if (!getDomainBySlug(domain) && !(domain in SPECIAL_MODES)) notFound();
  return (
    <div className="container pt-4">
      <Suspense>
        <QuizSession slug={domain} />
      </Suspense>
    </div>
  );
}
