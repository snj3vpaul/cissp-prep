"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useAppState, useHydrated } from "@/lib/store";
import { DOMAINS } from "@/lib/domains";
import { QUESTIONS } from "@/data/questions";
import { CCSK_OBJECTIVES, CCSK_SOURCES } from "@/data/ccsk/outline";
import { Skeleton } from "@/components/ui/card";

const FACTS: [string, string][] = [
  ["Questions", "60 multiple choice, from a larger pool"],
  ["Time", "120 minutes, can’t be paused"],
  ["Passing score", "80%"],
  ["Format", "Online, open book"],
  ["Results", "Per-domain counts right after the exam"],
];

const V4_CHANGES = [
  "12 domains instead of v4’s 14",
  "More on cloud workloads, application security, CI/CD, DevSecOps and automation",
  "Extended GRC, auditing, IAM and incident response",
  "AI and Zero Trust replace the IoT and mobile content; new domains for organization management and security monitoring",
  "Resilience and data lakes added; less detail on laws and regulations; Security-as-a-Service removed",
];

/** CCSK v5 body of knowledge: domains, CSA's topic list, coverage and official sources. */
export function CcskOutline() {
  const { attempts } = useAppState();
  const hydrated = useHydrated();
  const rows = useMemo(() => {
    const mine = new Map<string, { c: number; t: number }>();
    for (const a of attempts) {
      const e = mine.get(a.sub) ?? { c: 0, t: 0 };
      e.t++;
      if (a.correct) e.c++;
      mine.set(a.sub, e);
    }
    return Object.entries(CCSK_OBJECTIVES).map(([sub, title]) => {
      const m = mine.get(sub);
      return { sub, title, domain: Number(sub.split(".")[0]), bank: QUESTIONS.filter((q) => q.subObjective === sub).length, answered: m?.t ?? 0, accuracy: m?.t ? Math.round((m.c / m.t) * 100) : null };
    });
  }, [attempts]);
  if (!hydrated) return <Skeleton className="m-6 h-96" />;

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 lg:px-10 lg:pt-10">
      <h1 className="text-2xl font-semibold sm:text-[28px]">CCSK v5 body of knowledge</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
        The 12 domains of CSA Security Guidance v5, with the key topics CSA lists for each. The official CCSK v5 Study Guide is the primary exam material; Security Guidance v5 is the fuller reference behind it.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-5">
        {FACTS.map(([k, v]) => (
          <div key={k} className="bg-card p-3.5">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        {[CCSK_SOURCES.studyGuide, CCSK_SOURCES.guidance].map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-border bg-card p-4 hover:bg-muted/50">
            <span className="flex items-start justify-between gap-2">
              <span className="font-medium group-hover:underline">{s.title}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{s.publisher} · free download</span>
          </a>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">All 12 domains</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Topic numbers are this app’s labels. Bank = questions here on that topic; mine = what you’ve answered.</p>
        <div className="mt-4 space-y-3">
          {DOMAINS.map((d, i) => {
            const list = rows.filter((r) => r.domain === d.id);
            return (
              <details key={d.id} open={i === 0} className="group rounded-2xl border border-border bg-card">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: d.color }}>
                    {d.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{d.name}</span>
                  <span className="text-xs text-muted-foreground">{list.length} topics</span>
                  <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
                </summary>
                <ul className="border-t border-border">
                  {list.map((r) => (
                    <li key={r.sub} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-3 last:border-0">
                      <span className="text-sm tabular-nums" style={{ color: d.color }}>
                        {r.sub}
                      </span>
                      <span className="text-sm">{r.title}</span>
                      <span className="text-right text-xs tabular-nums text-muted-foreground">
                        Bank {r.bank} · {r.answered ? `mine ${r.answered}, ${r.accuracy}%` : "mine —"}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end px-4 py-3">
                  <Link href={`/quiz/${d.slug}`} className="text-sm font-medium hover:underline">
                    Drill domain {d.id} →
                  </Link>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">What changed from CCSK v4</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {V4_CHANGES.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Source: Cloud Security Alliance, “New Cloud Security Guidance from CSA”, 17 July 2024.</p>
      </section>
    </div>
  );
}
