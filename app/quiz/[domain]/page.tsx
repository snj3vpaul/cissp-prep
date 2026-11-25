import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CCSK_DOMAINS, CISSP_DOMAINS, CTFL_DOMAINS, PTMC_DOMAINS } from "@/lib/domains";
import { QuizSession } from "@/components/quiz/quiz-session";
import { SPECIAL_MODES } from "@/lib/quiz-modes";

const ALL = [...CISSP_DOMAINS, ...CCSK_DOMAINS, ...CTFL_DOMAINS, ...PTMC_DOMAINS];

export function generateStaticParams() {
  return [...ALL.map((d) => ({ domain: d.slug })), ...Object.keys(SPECIAL_MODES).map((k) => ({ domain: k }))];
}

type Params = Promise<{ domain: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { domain } = await params;
  const d = ALL.find((x) => x.slug === domain);
  const special = SPECIAL_MODES[domain as keyof typeof SPECIAL_MODES];
  return { title: d ? `Domain ${d.id}: ${d.name} drill` : (special?.title ?? "Quiz") };
}

export default async function QuizDomainPage({ params }: { params: Params }) {
  const { domain } = await params;
  if (!ALL.some((d) => d.slug === domain) && !(domain in SPECIAL_MODES)) notFound();
  return (
    <div className="container pt-4">
      <Suspense>
        <QuizSession slug={domain} />
      </Suspense>
    </div>
  );
}
