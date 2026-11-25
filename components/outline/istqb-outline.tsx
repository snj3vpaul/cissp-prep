"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useAppState, useHydrated } from "@/lib/store";
import { DOMAINS } from "@/lib/domains";
import { QUESTIONS } from "@/data/questions";
import { TRACK, TRACK_ID } from "@/lib/track";
import { CTFL_LOS, CTFL_SECTIONS } from "@/data/istqb/ctfl-outline";
import { PTMC_LOS, PTMC_SECTIONS } from "@/data/istqb/ptmc";
import { ISTQB_DOCS } from "@/data/istqb/sources";
import { Skeleton } from "@/components/ui/card";

const CTFL_FACTS: [string, string][] = [
  ["Questions", "40 single-answer, 1 point each"],
  ["Time", "60 min (75 min, +25%, for non-native speakers)"],
  ["Passing score", "26 / 40 (65%)"],
  ["Format", "Closed book"],
  ["K-levels", "K1 8 · K2 24 · K3 8"],
];
const PTMC_FACTS: [string, string][] = [
  ["Questions", "10 multiple choice"],
  ["Time", "20 minutes"],
  ["Format", "Open book (find it fast)"],
  ["Attempts", "Two per purchase"],
  ["Price", "US$39–59; free with an AT*SQA ISTQB exam"],
];

/** CTFL v4.0 per-chapter, per-K distribution (ISTQB Exam Structure and Rules Tables v1.18). */
const CTFL_DIST: [number, number, number, number][] = [
  [8, 2, 6, 0],
  [6, 2, 4, 0],
  [4, 2, 2, 0],
  [11, 0, 6, 5],
  [9, 1, 5, 3],
  [2, 1, 1, 0],
];

/** Body of knowledge for the ISTQB CTFL and AT*SQA Performance Testing tracks. */
export function IstqbOutline() {
  const { attempts } = useAppState();
  const hydrated = useHydrated();
  const ctfl = TRACK_ID === "ctfl";
  const los = ctfl ? CTFL_LOS : PTMC_LOS;
  const sections = ctfl ? CTFL_SECTIONS : PTMC_SECTIONS;
  const doc = ctfl ? ISTQB_DOCS.ctfl : ISTQB_DOCS.ptmc;
  const rows = useMemo(() => {
    const mine = new Map<string, { c: number; t: number }>();
    for (const a of attempts) {
      const e = mine.get(a.sub) ?? { c: 0, t: 0 };
      e.t++;
      if (a.correct) e.c++;
      mine.set(a.sub, e);
    }
    return los.map((lo) => {
      const m = mine.get(lo.id);
      const [title, page] = sections[lo.section] ?? ["", 1];
      return { ...lo, title, page, domain: Number(lo.id.slice(3).split(".")[0]), bank: QUESTIONS.filter((q) => q.subObjective === lo.id).length, answered: m?.t ?? 0, accuracy: m?.t ? Math.round((m.c / m.t) * 100) : null };
    });
  }, [attempts, los, sections]);
  if (!hydrated) return <Skeleton className="m-6 h-96" />;
  const facts = ctfl ? CTFL_FACTS : PTMC_FACTS;
  const sources = ctfl ? [ISTQB_DOCS.ctfl, ISTQB_DOCS.examTables, ISTQB_DOCS.ctflPage, ISTQB_DOCS.glossary] : [ISTQB_DOCS.ptmc, ISTQB_DOCS.ptmcFormat, ISTQB_DOCS.ctpt, ISTQB_DOCS.ctptPage];

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 lg:px-10 lg:pt-10">
      <h1 className="text-2xl font-semibold sm:text-[28px]">{ctfl ? "ISTQB CTFL v4.0.1 body of knowledge" : "Performance Testing micro-credential body of knowledge"}</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
        {ctfl
          ? "All 64 learning objectives of the CTFL v4.0.1 syllabus, grouped by chapter, with their K-level and the page that teaches them. Every practice question cites the exact page that states its answer."
          : "The 14 learning objectives of AT*SQA’s Performance Testing Body of Knowledge, with the footer page of each section. It’s open book, so learn where each section starts. Questions also cite the ISTQB CT-PT syllabus where it goes deeper."}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-5">
        {facts.map(([k, v]) => (
          <div key={k} className="bg-card p-3.5">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {!ctfl && <p className="mt-2 text-xs text-muted-foreground">AT*SQA doesn’t publish the passing score; the simulator uses {TRACK.exam.passPct}% as a target. Sources: AT*SQA micro-credential FAQ and Performance Testing page.</p>}

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        {sources.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-border bg-card p-4 hover:bg-muted/50">
            <span className="flex items-start justify-between gap-2">
              <span className="font-medium group-hover:underline">{s.title}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{s.publisher}</span>
          </a>
        ))}
      </section>

      {ctfl && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Exam blueprint</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Questions per chapter and K-level on every CTFL v4.0 exam (ISTQB Exam Structure and Rules Tables v1.18). The simulator builds each mock to this table.</p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Chapter</th>
                  <th className="px-3 py-2.5 text-right font-medium">Questions</th>
                  <th className="px-3 py-2.5 text-right font-medium">K1</th>
                  <th className="px-3 py-2.5 text-right font-medium">K2</th>
                  <th className="px-4 py-2.5 text-right font-medium">K3</th>
                </tr>
              </thead>
              <tbody>
                {DOMAINS.map((d, i) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      {d.id}. {d.name}
                    </td>
                    {CTFL_DIST[i].map((n, j) => (
                      <td key={j} className={`px-3 py-2.5 text-right tabular-nums ${j === 0 ? "font-semibold" : "text-muted-foreground"}`}>
                        {n}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-border bg-muted/30 font-semibold">
                  <td className="px-4 py-2.5">Total</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">40</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">8</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">24</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">8</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">K1 remember · K2 understand · K3 apply. K3 questions are scenario calculations: plan about 2–3 minutes for each.</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">All {DOMAINS.length} {TRACK.unit.toLowerCase()}s</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {ctfl ? "LO IDs are ISTQB’s." : "PT-x.y are this app’s labels; AT*SQA lists the objectives without numbers (p. 5)."} Page links open {doc.title.split(" ").slice(0, 3).join(" ")} at that page. Bank = questions here; mine = what you’ve answered.
        </p>
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
                  <span className="text-xs text-muted-foreground">{list.length} LOs</span>
                  <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
                </summary>
                <ul className="border-t border-border">
                  {list.map((r) => (
                    <li key={r.id} className="grid grid-cols-[76px_minmax(0,1fr)] items-start gap-x-4 gap-y-1 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[76px_minmax(0,1fr)_auto]">
                      <span className="text-sm tabular-nums" style={{ color: d.color }}>
                        {r.id}
                        <span className="ml-1 rounded bg-muted px-1 text-[10px] font-semibold text-muted-foreground">K{r.k}</span>
                      </span>
                      <span className="text-sm">
                        {r.text}
                        <a href={`${doc.url}#page=${r.page}`} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-xs text-muted-foreground hover:underline">
                          {ctfl ? `§${r.section} ` : ""}
                          {r.title} · p. {r.page} ↗
                        </a>
                      </span>
                      <span className="col-start-2 text-xs tabular-nums text-muted-foreground sm:col-start-auto sm:text-right">
                        Bank {r.bank} · {r.answered ? `mine ${r.answered}, ${r.accuracy}%` : "mine —"}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end px-4 py-3">
                  <Link href={`/quiz/${d.slug}`} className="text-sm font-medium hover:underline">
                    Drill {TRACK.unit.toLowerCase()} {d.id} →
                  </Link>
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
