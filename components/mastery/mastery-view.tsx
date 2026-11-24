"use client";

import { DOMAINS } from "@/lib/domains";
import { TRACK } from "@/lib/track";

import { useMemo, useState } from "react";
import type { DomainId } from "@/lib/domains";
import { getDomain } from "@/lib/domains";
import { useAppState, useHydrated } from "@/lib/store";
import { levelFromXp } from "@/lib/level";
import { masteryModel, timeAgo } from "@/lib/mastery";
import { FlowerChart } from "@/components/mastery/flower-chart";
import { DomainRow } from "@/components/mastery/domain-row";
import { Skeleton } from "@/components/ui/card";

function BigStat({ value, unit, label }: { value: string | number; unit?: string; label: string }) {
  return (
    <div>
      <p className="font-display text-[clamp(44px,6vw,72px)] font-light leading-none tracking-tight tabular-nums">
        {value}
        {unit && <span className="ml-1 text-[0.4em] text-muted-foreground">{unit}</span>}
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    </div>
  );
}

export function MasteryView() {
  const state = useAppState();
  const hydrated = useHydrated();
  const [active, setActive] = useState<DomainId | null>(null);
  const m = useMemo(() => masteryModel(state), [state]);
  const lv = levelFromXp(state.xp);

  if (!hydrated) return <Skeleton className="m-6 h-[560px]" />;

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-6 lg:px-10 lg:pt-10">
      <h1 className="text-2xl font-semibold sm:text-[28px]">Mastery model</h1>
      <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">
        A living model of how well I know each of the {DOMAINS.length} {TRACK.name} domains. Petal length is mastery: recent accuracy (newer answers count more) scaled by how much of the domain I’ve covered. Levels rise with every distinct question I get right.
      </p>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-center">
          <FlowerChart rows={m.domains} active={active} onActive={setActive} />
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
            <span className="rounded-full bg-[conic-gradient(from_0deg,#3987E5,#199E70,#C98500,#D55181,#9085E9,#3987E5)] p-px">
              <span className="block rounded-full bg-card px-2 text-xs font-semibold">LV {lv.level}</span>
            </span>
            <span className="tabular-nums">{state.xp.toLocaleString()} XP</span>
            <span className="text-muted-foreground">· {DOMAINS.length} domains</span>
          </p>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-4 border-b border-border pb-6">
            <BigStat value={lv.level} label={`Level · ${lv.rank}`} />
            <BigStat value={m.avg} unit="%" label="Avg. mastery" />
            <BigStat value={m.items} label="Knowledge items" />
          </div>
          <ul className="mt-4">
            {m.domains.map((r) => (
              <li key={r.domain.id}>
                <DomainRow row={r} active={active === r.domain.id} onActive={(on) => setActive(on ? r.domain.id : null)} />
              </li>
            ))}
          </ul>
          <p className="mt-2 px-2 text-xs text-muted-foreground">
            {m.learnedQuestions} questions answered right · {m.learnedCards} flashcards learned
          </p>

          <h2 className="mt-8 text-[11px] font-normal uppercase tracking-[0.16em] text-muted-foreground">Recently learned</h2>
          {m.recent.length ? (
            <ul className="mt-2 divide-y divide-border border-t border-border">
              {m.recent.map((r) => {
                const d = getDomain(r.domain);
                return (
                  <li key={r.qid + r.ts} className="grid grid-cols-[104px_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: d.color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} aria-hidden />
                      {d.short}
                    </span>
                    <span className="truncate text-[15px]" title={r.stem}>
                      {r.stem}
                    </span>
                    <span className="flex gap-3 whitespace-nowrap text-xs text-muted-foreground">
                      <span>{r.fixed ? "fixed a miss" : "+1 item"}</span>
                      <span className="hidden w-14 text-right sm:inline">{timeAgo(r.ts)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nothing yet. Answer a few questions and what you learn shows up here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
