"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Flag, Gauge, RotateCcw, Timer, Trophy, Wrench } from "lucide-react";
import type { Question } from "@/lib/types";
import { DOMAINS, domainOfSub } from "@/lib/domains";
import { driverCode, position, raceReport, runRace } from "@/lib/race";
import { useAppState } from "@/lib/store";
import { TRACK } from "@/lib/track";
import { cn } from "@/lib/utils";

const PAPAYA = "#FF8000";
const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

/**
 * Chequered-flag summary shown at the end of every quiz and exam: where you finished, how many
 * questions topped your mind, which topics you've mastered and what to re-study (with the page
 * to read).
 */
export function RaceClassification({ results, totalPlanned }: { results: { question: Question; correct: boolean; ms: number }[]; totalPlanned: number }) {
  const { settings } = useAppState();
  const you = driverCode(settings.name);
  const laps = Math.max(results.length, Math.min(totalPlanned, 150));
  const report = useMemo(() => raceReport(results, laps, you), [results, laps, you]);
  const final = useMemo(() => runRace(results, laps, you), [results, laps, you]);
  if (!results.length) return null;
  const pos = position(final);
  const around = final.order.map((code, i) => ({ code, p: i + 1 })).filter((r) => r.p <= 3 || Math.abs(r.p - pos) <= 1);
  const podium = pos <= 3;
  const restudyQs = report.restudy.reduce((n, r) => n + r.missed, 0);

  return (
    <section className="overflow-hidden rounded-3xl bg-black text-white ring-1 ring-white/10" aria-labelledby="race-heading">
      <div className="h-3 w-full" style={{ backgroundImage: "repeating-conic-gradient(#fff 0 25%, #000 0 50%)", backgroundSize: "12px 12px" }} aria-hidden />
      <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/60">
            <Flag className="h-3.5 w-3.5" aria-hidden /> Chequered flag · {TRACK.name}
          </p>
          <h2 id="race-heading" className="mt-2 text-3xl font-bold sm:text-4xl">
            {pos === 1 ? "Race win! " : podium ? "Podium! " : ""}P{pos}
            <span className="text-lg font-normal text-white/50"> of {final.order.length}</span>
          </h2>
          <p className="mt-1 text-sm text-white/70">
            Started P{report.startPos} · {report.gained > 0 ? <span className="text-[#38d26b]">▲{report.gained} places</span> : report.gained < 0 ? <span className="text-[#ff5c5c]">▼{-report.gained} places</span> : "held position"} · {report.overtakes} overtakes
            {report.lostPlaces ? ` · passed ${report.lostPlaces}×` : ""}
          </p>

          <dl className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: Trophy, k: "Topped your mind", v: `${report.excellence}/${results.length}` },
              { icon: Gauge, k: "Instant recall", v: String(report.instant) },
              { icon: Timer, k: "Fastest lap", v: report.fastestLap ? `L${report.fastestLap.lap} · ${secs(report.fastestLap.ms)}` : "—" },
            ].map((x) => (
              <div key={x.k} className="rounded-2xl bg-white/[0.06] p-3">
                <dt className="flex items-center gap-1 text-[11px] text-white/60">
                  <x.icon className="h-3 w-3" aria-hidden /> {x.k}
                </dt>
                <dd className="mt-1 font-display text-lg font-bold tabular-nums">{x.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[11px] text-white/50">Topped your mind = answered correctly. Instant recall = correct and at or faster than your median time.</p>

          <ol className="mt-5 space-y-1" aria-label="Final classification">
            {around.map((r, i) => (
              <li key={r.code}>
                {i > 0 && around[i - 1].p !== r.p - 1 && <span className="block pl-3 text-xs text-white/30">⋮</span>}
                <span className={cn("flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm", r.code === you && "bg-white/10 font-semibold")}>
                  <span className="w-7 font-mono tabular-nums text-white/60">P{r.p}</span>
                  <span className="h-3 w-1 rounded-full" style={{ background: r.code === you ? PAPAYA : "#9a9aa2" }} aria-hidden />
                  {r.code}
                  {r.code === you && <span className="text-xs font-normal text-white/50">you</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Trophy className="h-4 w-4" style={{ color: PAPAYA }} aria-hidden /> Pole-position topics
              <span className="font-normal text-white/50">· {report.mastered.length} all correct</span>
            </h3>
            {report.mastered.length ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {report.mastered.slice(0, 18).map((m) => (
                  <li key={m.sub} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: DOMAINS[m.domain - 1]?.color }} aria-hidden />
                    {m.sub}
                    {m.n > 1 && <span className="text-white/50">×{m.n}</span>}
                  </li>
                ))}
                {report.mastered.length > 18 && <li className="px-1 py-1 text-xs text-white/50">+{report.mastered.length - 18} more</li>}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-white/50">None fully correct yet. Every topic below is a pit stop.</p>
            )}
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Wrench className="h-4 w-4 text-[#ffd166]" aria-hidden /> Box, box: re-study
              <span className="font-normal text-white/50">
                · {restudyQs} question{restudyQs === 1 ? "" : "s"}, {report.restudy.length} topic{report.restudy.length === 1 ? "" : "s"}
              </span>
            </h3>
            {report.restudy.length ? (
              <ul className="mt-2 space-y-2">
                {report.restudy.slice(0, 8).map((r) => {
                  const d = DOMAINS[(r.domain || domainOfSub(r.sub)) - 1];
                  return (
                    <li key={r.sub} className="rounded-2xl bg-white/[0.06] p-3 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d?.color }} aria-hidden />
                        <span className="font-semibold">{r.sub}</span>
                        <span className="truncate text-xs text-white/50">{d?.short}</span>
                        <span className="ml-auto shrink-0 rounded-md bg-[#3a1212] px-1.5 text-xs font-semibold tabular-nums text-[#ff8a8a]">
                          {r.missed}/{r.total} missed
                        </span>
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-white/60">{r.questions[0]?.stem}</p>
                      {r.ref && (
                        <p className="mt-1.5 text-xs">
                          {r.ref.url ? (
                            <a href={r.ref.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 text-[#ffb366] hover:underline">
                              <span>Read: {r.ref.title}</span>
                              <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                              <span className="sr-only">(opens in a new tab)</span>
                            </a>
                          ) : (
                            <span className="text-white/70">Read: {r.ref.title}</span>
                          )}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-white/50">Nothing to re-study. Clean race.</p>
            )}
            {report.restudy.length > 8 && <p className="mt-2 text-xs text-white/50">+{report.restudy.length - 8} more topics in the review below.</p>}
            {report.restudy.length > 0 && (
              <Link href="/quiz/missed" className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-black" style={{ background: PAPAYA }}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Practice session on missed questions
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
