"use client";

import { useState } from "react";
import { AlertTriangle, ArrowUpRight, Clock, ListOrdered, Lock, Plus, Shuffle, Target, Trash2 } from "lucide-react";
import { DOMAINS, type DomainId } from "@/lib/domains";
import { actions, useAppState, useHydrated } from "@/lib/store";
import { CAT_CONFIGS, type CatConfig } from "@/lib/cat";
import { todayISO } from "@/lib/sm2";
import type { SessionSummary } from "@/lib/types";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { Button } from "@/components/ui/button";
import { Card, DomainDot } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const QE_URL = "https://quantumexams.com/cat.html";

function Spark({ traj }: { traj?: number[] }) {
  if (!traj || traj.length < 2) return null;
  const n = traj.length;
  const pts = traj.map((v, i) => `${(i / (n - 1)) * 100},${30 - (v / 1000) * 30}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-8 w-full" aria-hidden>
      <line x1="0" x2="100" y1={30 - 0.7 * 30} y2={30 - 0.7 * 30} className="stroke-muted-foreground/40" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
      <polyline points={pts} fill="none" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Log a CAT attempt taken on QuantumExams so it counts in history, the dashboard and core unlocks. */
function QuantumExamsLog({ sessions }: { sessions: SessionSummary[] }) {
  const logged = sessions.filter((s) => s.source === "quantumexams").sort((a, b) => b.ts - a.ts);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState("");
  const [result, setResult] = useState<"pass" | "fail" | "">("");
  const [ability, setAbility] = useState("");
  const [notes, setNotes] = useState("");
  const [doms, setDoms] = useState<Partial<Record<DomainId, string>>>({});
  const [error, setError] = useState("");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(items);
    if (!Number.isInteger(n) || n < 1 || n > 175) return setError("Enter how many items you answered (for example 100 to 150).");
    if (!result) return setError("Choose pass or fail.");
    const domains: Partial<Record<DomainId, number>> = {};
    for (const d of DOMAINS) {
      const raw = doms[d.id];
      if (raw === undefined || raw === "") continue;
      const v = Number(raw);
      if (!Number.isFinite(v) || v < 0 || v > 100) return setError(`Domain ${d.id} must be a percentage from 0 to 100.`);
      domains[d.id] = Math.round(v);
    }
    const [y, m, dd] = date.split("-").map(Number);
    const ts = new Date(y, m - 1, dd, 12).getTime();
    actions.recordExternal({
      id: `qe-${ts}-${Math.round(Math.random() * 1e6)}`,
      mode: "exam",
      total: n,
      correct: 0,
      ms: 0,
      ts,
      passed: result === "pass",
      source: "quantumexams",
      external: { ability: ability.trim() || undefined, domains: Object.keys(domains).length ? domains : undefined, notes: notes.trim() || undefined },
    });
    setOpen(false);
    setItems("");
    setResult("");
    setAbility("");
    setNotes("");
    setDoms({});
    setError("");
  };

  const input = "h-11 w-full rounded-xl border border-input bg-background px-3 text-base sm:text-sm";

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold">QuantumExams attempts</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Take QuantumExams’ CISSP CAT on their site, then log the result here. It shows in your history, and a pass opens a cipher core (100+ items wakes the legendary).
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={QE_URL} target="_blank" rel="noopener noreferrer">
              QuantumExams CAT <ArrowUpRight />
            </a>
          </Button>
          {!open && (
            <Button onClick={() => setOpen(true)}>
              <Plus /> Log attempt
            </Button>
          )}
        </div>
      </div>

      {open && (
        <form onSubmit={save} className="mt-5 space-y-4 rounded-2xl bg-muted/40 p-4" noValidate>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="text-xs font-medium text-muted-foreground">Date</span>
              <input type="date" required max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className={cn(input, "mt-1")} />
            </label>
            <label className="text-sm">
              <span className="text-xs font-medium text-muted-foreground">Items answered</span>
              <input inputMode="numeric" required placeholder="e.g. 112" value={items} onChange={(e) => setItems(e.target.value)} className={cn(input, "mt-1")} />
            </label>
            <label className="text-sm">
              <span className="text-xs font-medium text-muted-foreground">Ability score shown (optional)</span>
              <input placeholder="As QuantumExams displays it" value={ability} onChange={(e) => setAbility(e.target.value)} className={cn(input, "mt-1")} />
            </label>
          </div>
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground">Result</legend>
            <div className="mt-1 inline-flex rounded-full bg-background p-1">
              {(["pass", "fail"] as const).map((r) => (
                <label key={r} className={cn("cursor-pointer rounded-full px-5 py-2 text-sm font-medium", result === r ? "bg-foreground text-background" : "text-muted-foreground")}>
                  <input type="radio" name="qe-result" value={r} checked={result === r} onChange={() => setResult(r)} className="sr-only" />
                  {r === "pass" ? "Pass" : "Fail"}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground">Domain feedback, % correct (optional)</legend>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DOMAINS.map((d) => (
                <label key={d.id} className="flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-sm">
                  <DomainDot color={d.color} />
                  <span className="min-w-0 flex-1 truncate">D{d.id}</span>
                  <input
                    inputMode="numeric"
                    aria-label={`Domain ${d.id} ${d.name}, percent correct`}
                    value={doms[d.id] ?? ""}
                    onChange={(e) => setDoms((x) => ({ ...x, [d.id]: e.target.value }))}
                    className="h-9 w-14 rounded-lg border border-input bg-background px-2 text-right text-base tabular-nums sm:text-sm"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted-foreground">Notes (optional)</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What tripped you up?" className={cn(input, "mt-1")} />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit">Save attempt</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {logged.length > 0 && (
        <ul className="mt-5 divide-y divide-border border-t border-border">
          {logged.map((s) => (
            <li key={s.id} className="grid gap-3 py-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center">
              <div>
                <p className={cn("font-display text-lg font-semibold", s.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>{s.passed ? "Pass" : "Fail"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} · {s.total} items
                </p>
              </div>
              <div className="min-w-0">
                {s.external?.domains ? (
                  <div className="flex h-10 items-end gap-1" aria-label="Domain feedback">
                    {DOMAINS.map((d) => {
                      const v = s.external?.domains?.[d.id];
                      return (
                        <span key={d.id} className="flex flex-1 flex-col items-center gap-0.5" title={`D${d.id} ${d.short}: ${v ?? "—"}%`}>
                          <span className="w-full rounded-t-sm" style={{ height: `${v === undefined ? 2 : Math.max(3, (v / 100) * 32)}px`, background: v === undefined ? "hsl(var(--border))" : d.color }} />
                          <span className="text-[9px] text-muted-foreground">{d.id}</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No domain feedback logged.</p>
                )}
                {(s.external?.ability || s.external?.notes) && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {s.external?.ability && `Ability ${s.external.ability}`}
                    {s.external?.ability && s.external?.notes && " · "}
                    {s.external?.notes}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => actions.removeSession(s.id)} className="justify-self-start rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:justify-self-end" aria-label="Delete this logged attempt">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function ExamSim() {
  const [started, setStarted] = useState(false);
  const [run, setRun] = useState(0);
  const [ack, setAck] = useState(false);
  const [variant, setVariant] = useState<CatConfig["id"]>("full");
  const hydrated = useHydrated();
  const { sessions } = useAppState();
  const cfg = CAT_CONFIGS[variant];
  const past = sessions.filter((s) => s.mode === "exam" && !s.source).slice(-3).reverse();

  if (started) {
    return (
      <QuizRunner
        key={run}
        mode="exam"
        title={cfg.label}
        exam
        cat={cfg}
        timeLimitSec={cfg.minutes * 60}
        onRestart={() => setRun((r) => r + 1)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-20">
      <Card>
        <p className="text-xs font-medium text-muted-foreground">Computerized adaptive test</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          {cfg.min}–{cfg.max} items. {cfg.minutes === 180 ? "3 hours" : `${cfg.minutes} minutes`}. No going back.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Same format as the CISSP CAT and QuantumExams: the first item is well below the passing standard, your ability is re-estimated after every answer, and the test stops as soon as it’s 95% sure you’re above or below the line.
        </p>
        <div role="radiogroup" aria-label="Test length" className="mt-5 inline-flex rounded-full bg-muted p-1">
          {Object.values(CAT_CONFIGS).map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={variant === c.id}
              onClick={() => setVariant(c.id)}
              className={cn("h-10 rounded-full px-5 text-sm font-medium", variant === c.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {c.label} <span className="text-muted-foreground">· {c.min}–{c.max}</span>
            </button>
          ))}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: ListOrdered, k: "Items", v: `${cfg.min}–${cfg.max}` },
            { icon: Clock, k: "Time limit", v: cfg.minutes === 180 ? "3:00:00" : `${cfg.minutes} min` },
            { icon: Target, k: "Passing", v: "700 / 1000" },
            { icon: Shuffle, k: "Stops when", v: "95% sure" },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl bg-muted/50 p-4">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <x.icon className="h-3.5 w-3.5" aria-hidden /> {x.k}
              </dt>
              <dd className="mt-1 font-display text-xl font-bold">{x.v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display font-semibold">How it works</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Shuffle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> After each answer the ability estimate is recalculated from every item so far, and the next item is pitched where it tells the most.
            </li>
            <li className="flex gap-2">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Answers lock on submit. No skipping, flagging or going back, and no explanations until the end.
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> If time runs out before the minimum number of items, the attempt is incomplete; after it, the latest estimate decides.
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden /> Difficulty is calibrated in three bands, not ISC2’s per-item statistics, so the scaled score is a practice estimate.
            </li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-display font-semibold">Content balance</h2>
          <p className="mt-1 text-xs text-muted-foreground">Items are drawn to match the active exam outline’s domain weights.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {DOMAINS.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <DomainDot color={d.color} />
                <span className="flex-1 truncate text-muted-foreground">
                  D{d.id} {d.name}
                </span>
                <span className="font-mono text-xs tabular-nums">{d.weight}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {hydrated && past.length > 0 && (
        <Card>
          <h2 className="font-display font-semibold">Recent attempts here</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {past.map((s) => (
              <li key={s.id} className="rounded-2xl bg-muted/50 p-3 text-sm">
                <p className="font-display text-xl font-bold tabular-nums">{s.scaled}</p>
                <p className="text-xs text-muted-foreground">
                  {s.cat === "mini" ? "Mini CAT" : s.cat === "full" ? "Full CAT" : "Simulation"} · {new Date(s.ts).toLocaleDateString()} · {s.total} items · {s.passed ? "Pass" : "Fail"}
                </p>
                <Spark traj={s.traj} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {hydrated && <QuantumExamsLog sessions={sessions} />}

      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-5 w-5 accent-foreground" />
          <span>I’m ready for up to {cfg.minutes === 180 ? "3 hours" : `${cfg.minutes} minutes`} without interruptions. Leaving the page ends the attempt.</span>
        </label>
        <Button size="lg" disabled={!ack} onClick={() => setStarted(true)} className="w-full sm:w-auto">
          Begin {cfg.label}
        </Button>
      </Card>
    </div>
  );
}
