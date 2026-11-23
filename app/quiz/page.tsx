import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, History, Timer, Zap, Swords } from "lucide-react";
import { DOMAINS } from "@/lib/domains";
import { QUESTIONS_BY_DOMAIN, QUESTIONS } from "@/data/questions";
import { PageHeader } from "@/components/page-header";
import { DomainDot } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Quiz modes",
  description: "Quick 10, domain drills, timed quizzes and missed-question review — original CISSP practice questions with full rationales.",
};

const MODES = [
  { href: "/quiz/check", icon: Brain, title: "Knowledge check", body: "Slide the effort from Low (5 quick facts) to Galaxy (60 hard items, exam pace).", meta: "5–60 items · adaptive effort" },
  { href: "/quiz/quick", icon: Zap, title: "Quick 10", body: "Ten questions weighted across all domains. Perfect for a coffee break.", meta: "~10 min · untimed" },
  { href: "/quiz/timed", icon: Timer, title: "Timed 25", body: "25 questions, 30-minute clock — trains exam-day pace (~72s each).", meta: "30 min · timed" },
  { href: "/quiz/missed", icon: History, title: "Missed review", body: "Re-attempt questions you most recently got wrong until they stick.", meta: "up to 20 · untimed" },
  { href: "/exam", icon: Swords, title: "Full exam simulation", body: "125 adaptive items, 3 hours, strictly in order, no going back.", meta: "3 h · CAT-style" },
];

export default function QuizPage() {
  return (
    <div className="container pb-20">
      <PageHeader eyebrow="Quiz engine" title="Choose your mission" sub={`${QUESTIONS.length} original questions with rationales for every option. Keyboard: 1–4 to answer, Enter to submit.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MODES.map((m) => (
          <Link key={m.href} href={m.href} className="glass group relative flex flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-cyan-400/20">
              <m.icon className="h-5 w-5 text-violet-500 dark:text-violet-300" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{m.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{m.body}</p>
            <p className="mt-4 flex items-center justify-between font-mono text-xs text-muted-foreground">
              {m.meta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold">Domain drills</h2>
      <p className="mt-1 text-sm text-muted-foreground">15 questions per drill, prioritising questions you haven’t seen or got wrong.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DOMAINS.map((d) => (
          <li key={d.id}>
            <Link href={`/quiz/${d.slug}`} className="glass group flex h-full flex-col rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/25">
              <span className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <DomainDot color={d.color} /> DOMAIN {d.id}
                </span>
                {d.weight}%
              </span>
              <span className="mt-2 font-display font-semibold leading-snug">{d.name}</span>
              <span className="mt-auto pt-3 text-xs text-muted-foreground">{QUESTIONS_BY_DOMAIN[d.id].length} questions</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
