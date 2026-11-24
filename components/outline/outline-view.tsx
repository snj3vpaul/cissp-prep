"use client";

import { TRACK_ID } from "@/lib/track";
import { CcskOutline } from "@/components/outline/ccsk-outline";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useAppState, useHydrated } from "@/lib/store";
import { DOMAINS, OUTLINES, OUTLINE_LINKS, activeOutline } from "@/lib/domains";
import { objectiveRows, spotlightCoverage } from "@/lib/outline-coverage";
import { OutlinePicker } from "@/components/outline/outline-picker";
import { Skeleton } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FORMAT: [string, string][] = [
  ["Length", "3 hours"],
  ["Items", "100–150, adaptive (CAT)"],
  ["Item format", "Multiple choice and advanced item types"],
  ["Passing grade", "700 / 1000"],
  ["Where", "ISC2-authorized Pearson test centres (PPC, PVTC Select)"],
];

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function OutlineView() {
  return TRACK_ID === "ccsk" ? <CcskOutline /> : <CisspOutline />;
}

function CisspOutline() {
  const state = useAppState();
  const hydrated = useHydrated();
  const rows = useMemo(() => objectiveRows(state.attempts), [state.attempts]);
  const spot = useMemo(() => spotlightCoverage(state.customCards), [state.customCards]);
  if (!hydrated) return <Skeleton className="m-6 h-96" />;

  const active = activeOutline().id;
  const reworded = rows.filter((r) => r.oldTitle).length;

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 lg:px-10 lg:pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-[28px]">Exam outline</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            The ISC2 CISSP outline effective 15 April 2027 (revised Oct 2026). Objective numbers are unchanged from the 2024 outline, so all questions and progress carry over. Weights, domain 1’s name and {reworded} objective titles change.
          </p>
        </div>
        <a href={OUTLINE_LINKS.hubUrl} className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          ISC2 outlines <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <p className="text-sm font-semibold">Study against</p>
        <OutlinePicker className="mt-2" />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-5">
        {FORMAT.map(([k, v]) => (
          <div key={k} className="bg-card p-3.5">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <Section title="Domain weights" sub="Average share of the CAT exam. Domain 1 drops the most; Asset Security gains the most.">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[minmax(0,1fr)_56px_56px_64px] gap-3 border-b border-border px-4 py-2.5 text-xs text-muted-foreground sm:grid-cols-[minmax(0,1fr)_minmax(0,180px)_64px_64px_72px]">
            <span>Domain</span>
            <span className="hidden sm:block" aria-hidden />
            <span className={cn("text-right", active === "2024" && "font-semibold text-foreground")}>2024</span>
            <span className={cn("text-right", active === "2027" && "font-semibold text-foreground")}>2027</span>
            <span className="text-right">Change</span>
          </div>
          <ul>
            {DOMAINS.map((d) => {
              const a = OUTLINES["2024"].weights[d.id];
              const b = OUTLINES["2027"].weights[d.id];
              const delta = Math.round((b - a) * 10) / 10;
              return (
                <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_56px_56px_64px] items-center gap-3 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,180px)_64px_64px_72px]">
                  <span className="flex min-w-0 items-center gap-2.5 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: d.color }}>
                      {d.id}
                    </span>
                    <span className="truncate">{OUTLINES["2027"].names[d.id] ?? d.name}</span>
                  </span>
                  <span className="relative hidden h-2 rounded-full bg-muted sm:block" aria-hidden>
                    <span className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/30" style={{ width: `${(a / 16) * 100}%` }} />
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(b / 16) * 100}%`, background: d.color, opacity: 0.85, height: "50%", top: "25%" }} />
                  </span>
                  <span className={cn("text-right text-sm tabular-nums", active === "2024" ? "font-semibold" : "text-muted-foreground")}>{a}%</span>
                  <span className={cn("text-right text-sm tabular-nums", active === "2027" ? "font-semibold" : "text-muted-foreground")}>{b}%</span>
                  <span className={cn("text-right text-sm font-medium tabular-nums", delta > 0 ? "text-emerald-600 dark:text-emerald-400" : delta < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                    {delta > 0 ? "+" : delta < 0 ? "−" : "±"}
                    {Math.abs(delta)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      <Section title="Named in the 2027 outline" sub="Topics the outline calls out by name, and how many questions and flashcards in this app cover each.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {spot.map((s) => {
            const d = DOMAINS[Number(s.sub.split(".")[0]) - 1];
            const thin = s.questions === 0;
            return (
              <li key={s.topic}>
                <Link href={`/quiz/${d.slug}`} className={cn("flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3 hover:bg-muted/60", thin ? "border-amber-500/50" : "border-border")}>
                  <span className="w-9 shrink-0 text-xs tabular-nums" style={{ color: d.color }}>
                    {s.sub}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">{s.topic}</span>
                  <span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {s.questions} q · {s.cards} cards
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="All 62 objectives" sub="2027 wording. Bank = questions in this app tagged to the objective; mine = what I’ve answered.">
        <div className="space-y-3">
          {DOMAINS.map((d, i) => {
            const list = rows.filter((r) => r.domain === d.id);
            return (
              <details key={d.id} open={i === 0} className="group rounded-2xl border border-border bg-card">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: d.color }}>
                    {d.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{OUTLINES["2027"].names[d.id] ?? d.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {list.length} objectives · {OUTLINES["2027"].weights[d.id]}%
                  </span>
                  <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
                </summary>
                <ul className="border-t border-border">
                  {list.map((r) => (
                    <li key={r.sub} className="grid gap-x-4 gap-y-2 border-b border-border px-4 py-3.5 last:border-0 sm:grid-cols-[44px_minmax(0,1fr)_120px]">
                      <span className="text-sm font-medium tabular-nums" style={{ color: d.color }}>
                        {r.sub}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {r.title}
                          {r.oldTitle && <span className="ml-2 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 align-middle text-[10px] font-semibold text-amber-700 dark:text-amber-300">Reworded</span>}
                        </p>
                        {r.oldTitle && <p className="mt-0.5 text-xs text-muted-foreground line-through decoration-muted-foreground/50">{r.oldTitle}</p>}
                        {r.topics.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {r.topics.map((t) => (
                              <li key={t} className="rounded-md bg-muted px-2 py-0.5 text-[12px] text-muted-foreground">
                                {t}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="text-xs tabular-nums text-muted-foreground sm:text-right">
                        <p>
                          Bank <span className={cn("font-semibold", r.bank ? "text-foreground" : "text-amber-600")}>{r.bank}</span>
                        </p>
                        <p>{r.answered ? `Mine ${r.answered} · ${r.accuracy}%` : "Mine —"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
