"use client";

import Link from "next/link";
import { CalendarClock, SlidersHorizontal } from "lucide-react";
import type { AppState } from "@/lib/types";
import { DOMAINS } from "@/lib/domains";
import { actions } from "@/lib/store";
import { todayISO } from "@/lib/sm2";
import { layoutActions, useLayoutPrefs } from "@/lib/layout-prefs";
import { EffortSlider } from "@/components/knowledge/effort-slider";
import { SpacingToolbar } from "@/components/dashboard/spacing-toolbar";
import { SessionHistory } from "@/components/dashboard/session-history";
import type { DashboardData } from "@/components/dashboard/data";
import { cn } from "@/lib/utils";

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("z-card z-anim rounded-2xl border border-border bg-card", className)} style={{ padding: "var(--cp)" }}>
      {children}
    </div>
  );
}

function SectionHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {right && <div className="text-xs text-muted-foreground">{right}</div>}
    </div>
  );
}

function MiniBars({ values, max, highlightLast = false }: { values: (number | null)[]; max?: number; highlightLast?: boolean }) {
  const m = max ?? Math.max(1, ...values.map((v) => v ?? 0));
  return (
    <div className="mt-4 flex h-8 items-end gap-[3px]" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn("w-2 rounded-[2px]", highlightLast && i === values.length - 1 ? "bg-foreground" : "bg-muted-foreground/30")}
          style={{ height: `${v === null ? 6 : Math.max(10, (v / m) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function Stat({ label, value, sub, bars }: { label: string; value: string; sub: string; bars: React.ReactNode }) {
  return (
    <Panel>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-[28px] font-semibold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      {bars}
    </Panel>
  );
}

function ActivityChart({ data }: { data: DashboardData["activity"] }) {
  const max = Math.max(5, ...data.map((d) => d.count));
  const nice = Math.ceil(max / 5) * 5;
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Panel className="flex flex-col">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm font-semibold">Items studied</p>
          <p className="text-xs text-muted-foreground">
            {total} in the last 14 days · {Math.round(total / 14)} a day on average
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">14 days</span>
      </div>
      <div className="relative mt-5 min-h-56 flex-1">
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${f * 100}%` }}>
            <span className="w-6 -translate-y-1/2 text-right text-[10px] tabular-nums text-muted-foreground">{Math.round(nice * f)}</span>
            <span className="h-px flex-1 -translate-y-1/2 bg-border" />
          </div>
        ))}
        <ol className="absolute inset-y-0 left-8 right-0 flex items-end gap-2">
          {data.map((d, i) => {
            const isToday = i === data.length - 1;
            return (
              <li key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {d.count} on {d.date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                </span>
                <span
                  className={cn("w-full rounded-t-md transition-colors", isToday ? "bg-foreground" : "bg-muted-foreground/25 group-hover:bg-muted-foreground/45")}
                  style={{ height: `${d.count ? Math.max(3, (d.count / nice) * 100) : 1.5}%` }}
                />
                <span className="sr-only">
                  {d.date.toDateString()}: {d.count} items
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="ml-8 mt-2 flex gap-2 text-[10px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={d.key} className="flex-1 text-center">
            {i % 2 === 1 ? d.date.toLocaleDateString(undefined, { day: "numeric" }) : ""}
          </span>
        ))}
      </div>
    </Panel>
  );
}

export function DesktopDashboard({ state, d }: { state: AppState; d: DashboardData }) {
  const { prefs } = useLayoutPrefs();
  const h = new Date().getHours();
  const hello = h < 5 ? "Late night" : h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
  const accSeries = d.week.map((w) => w.accuracy);

  return (
    <div className="z-page z-anim hidden lg:block" style={{ padding: "var(--pp)" }}>
      <div className="z-stack z-anim mx-auto flex max-w-[1240px] flex-col" style={{ gap: "var(--sg)" }}>
        {/* Header */}
        <section className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {hello}
              {state.settings.name ? `, ${state.settings.name}` : ""}
            </p>
            <h1 className="mt-0.5 text-[28px] font-semibold leading-tight">Overview</h1>
          </div>
          <div className="flex items-center gap-2">
            {!prefs.toolbar && (
              <button type="button" onClick={() => layoutActions.setToolbar(true)} className="flex h-10 items-center gap-2 rounded-full px-4 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <SlidersHorizontal className="h-4 w-4" /> Layout
              </button>
            )}
            <Link href="/exam" className="flex h-10 items-center rounded-full bg-muted px-5 text-sm font-medium hover:bg-muted-foreground/15">
              Exam sim
            </Link>
            <Link href="/quiz/quick" className="flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90">
              Quick 10
            </Link>
          </div>
        </section>

        {/* This week */}
        <section>
          <SectionHead title="This week" right={<Link href="/progress" className="hover:text-foreground">Progress →</Link>} />
          <div className="z-grid z-anim grid grid-cols-4" style={{ gap: "var(--gg)" }}>
            <Stat label="Readiness" value={`${d.readiness}%`} sub={`Weakest: D${d.weakest.id} ${d.weakest.short}`} bars={<MiniBars values={d.stats.map((s) => s.readiness)} max={100} />} />
            <Stat
              label="Accuracy"
              value={d.accuracy === null ? "—" : `${d.accuracy}%`}
              sub={`${state.attempts.length.toLocaleString()} answered all-time`}
              bars={<MiniBars values={accSeries} max={100} highlightLast />}
            />
            <Stat
              label="Today"
              value={`${d.todayCount}/${d.goal}`}
              sub={`${d.streak.current}-day streak · Lv ${d.level.level}`}
              bars={<MiniBars values={d.activity.slice(-7).map((a) => a.count)} highlightLast />}
            />
            <Stat label="Cards due" value={String(d.due)} sub="Forecast for the next 7 days" bars={<MiniBars values={d.forecast} highlightLast={false} />} />
          </div>
        </section>

        {/* Activity */}
        <section>
          <SectionHead title="Activity" right={`${d.level.rank} · ${state.xp.toLocaleString()} XP`} />
          <div className="z-grid z-anim grid grid-cols-[minmax(0,1fr)_minmax(0,340px)]" style={{ gap: "var(--gg)" }}>
            <ActivityChart data={d.activity} />
            <Panel>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold">Domains</p>
                <p className="text-xs text-muted-foreground">readiness</p>
              </div>
              <ul className="mt-3">
                {d.stats.map((s) => {
                  const dom = DOMAINS[s.domain - 1];
                  return (
                    <li key={dom.id}>
                      <Link href={`/quiz/${dom.slug}`} className="flex h-10 items-center gap-3 rounded-lg px-1.5 text-sm hover:bg-muted">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: dom.color }}>
                          {dom.id}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{dom.short}</span>
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <span className="block h-full rounded-full" style={{ width: `${s.readiness}%`, background: dom.color }} />
                        </span>
                        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{s.attempted ? `${s.readiness}%` : "—"}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </div>
        </section>

        {/* Practice */}
        <section className="pb-20">
          <SectionHead title="Practice" />
          <div className="z-grid z-anim grid grid-cols-3 items-start" style={{ gap: "var(--gg)" }}>
            <EffortSlider recommended={d.recommended} compact className="z-card" />
            <Panel>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden />
                <p className="text-sm font-semibold">Exam countdown</p>
              </div>
              {d.days !== null && d.days >= 0 ? (
                <>
                  <p className="mt-3 font-display text-5xl font-semibold tabular-nums">{d.days}</p>
                  <p className="text-sm text-muted-foreground">{d.days === 1 ? "day" : "days"} to go</p>
                  {d.pace && <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm">Pace: <span className="font-semibold">{d.pace} questions a day</span></p>}
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{d.days !== null ? "That date has passed. Set the new one." : "Set the exam date to get a daily pace."}</p>
              )}
              <label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="exam-date">
                Exam date
              </label>
              <input
                id="exam-date"
                type="date"
                min={todayISO()}
                value={state.settings.examDate ?? ""}
                onChange={(e) => actions.updateSettings({ examDate: e.target.value || undefined })}
                className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm [color-scheme:light] dark:[color-scheme:dark]"
              />
            </Panel>
            <Panel>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold">Recent sessions</p>
                <Link href="/progress" className="text-xs text-muted-foreground hover:text-foreground">
                  All →
                </Link>
              </div>
              <div className="mt-3">
                <SessionHistory state={state} sessions={d.sessions} limit={5} />
              </div>
            </Panel>
          </div>
        </section>
      </div>
      <SpacingToolbar />
    </div>
  );
}
