"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Eye } from "lucide-react";
import type { AppState } from "@/lib/types";
import type { DomainId } from "@/lib/domains";
import { DOMAINS } from "@/lib/domains";
import { EffortSlider } from "@/components/knowledge/effort-slider";
import { SessionHistory } from "@/components/dashboard/session-history";
import { CoreThumb } from "@/components/collection/core3d";
import { TOTAL_UNLOCKS } from "@/lib/collection";
import type { DashboardData } from "@/components/dashboard/data";

/** Line art for the dark "exam card", echoing a minimal payment card. */
function CardArt() {
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <g fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1">
        <path d="M150 -10 L250 210" />
        <path d="M185 -10 L265 210" />
        <path d="M222 -10 L170 140" />
        <circle cx="198" cy="88" r="14" />
        <path d="M40 210 C 90 120, 200 60, 340 50" strokeDasharray="6 7" />
      </g>
    </svg>
  );
}

function Pill({ children, dark = true }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={dark ? "rounded-full border border-white/40 px-2.5 py-0.5 text-[12px] text-white/90" : "rounded-full border border-black/20 px-2.5 py-0.5 text-[12px] text-black/70"}>
      {children}
    </span>
  );
}

/** Tiny "map" of the eight domains with the weakest one pinned. */
function DomainMap({ weakest }: { weakest: DomainId }) {
  // One pin per domain, scattered over a two-row "map".
  const pts: [number, number][] = DOMAINS.map((_, i) => {
    const cols = Math.ceil(DOMAINS.length / 2);
    const row = i < cols ? 0 : 1;
    const col = row ? i - cols : i;
    return [16 + (col * 128) / Math.max(1, cols - 1), (row ? 62 : 24) + (col % 2 ? 8 : -4)];
  });
  return (
    <svg viewBox="0 0 160 84" className="mt-2 h-14 w-full" aria-hidden>
      <g fill="none" stroke="currentColor" className="text-muted-foreground/25" strokeWidth="1.2">
        <path d="M0 40 C 30 30, 50 60, 80 46 S 130 20, 160 36" />
        <path d="M10 84 C 30 60, 60 70, 90 56 S 140 70, 160 60" />
        <path d="M40 0 C 50 20, 40 40, 60 84" />
        <path d="M120 0 C 110 30, 130 50, 115 84" />
      </g>
      {pts.map(([x, y], i) =>
        i + 1 === weakest ? (
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill="#0ea5e9" opacity="0.18" />
            <circle cx={x} cy={y} r="4.5" fill="#0ea5e9" stroke="white" strokeWidth="2" />
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r="2" className="fill-muted-foreground/40" />
        )
      )}
    </svg>
  );
}

export function MobileWallet({ state, d }: { state: AppState; d: DashboardData }) {
  const [focus, setFocus] = useState<DomainId>(d.weakest.id);
  const dom = DOMAINS[focus - 1];
  const grants = state.cores?.grants ?? [];
  const cores = grants.length;
  const latest = [...grants].sort((a, b) => b.ts - a.ts)[0];
  const examLine = d.days !== null && d.days >= 0 ? `D-${d.days}` : "No exam date";

  return (
    <div className="space-y-4 px-4 pb-6 pt-4 lg:hidden">
      {/* Card carousel */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label="Status cards">
        <div className="relative aspect-[1.62] w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#141414] text-white shadow-lg">
          <CardArt />
          <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            <Pill>Exam card</Pill>
            <span className="text-[12px] text-white/70">
              Today {d.todayCount}/{d.goal}
            </span>
          </div>
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <div>
              <p className="font-display text-3xl font-semibold tabular-nums leading-none">{d.readiness}%</p>
              <p className="mt-1 text-[13px] text-white/80">Readiness · {examLine}</p>
            </div>
            <Link href="/progress" className="flex items-center gap-1.5 rounded-full border border-white/40 bg-black/40 px-3 py-1.5 text-[13px]">
              <Eye className="h-3.5 w-3.5" /> View details
            </Link>
          </div>
        </div>
        <div className="relative aspect-[1.62] w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#e7e7ea] text-black shadow-lg dark:bg-[#d9d9de]">
          <div className="absolute inset-x-3 top-3">
            <Pill dark={false}>Streak card</Pill>
          </div>
          <div className="absolute inset-x-3 bottom-3">
            <p className="font-display text-3xl font-semibold leading-none">🔥 {d.streak.current} days</p>
            <p className="mt-1 text-[13px] text-black/60">
              Lv {d.level.level} {d.level.rank} · {state.xp.toLocaleString()} XP
            </p>
          </div>
        </div>
        <div className="relative aspect-[1.62] w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl bg-sky-600 text-white shadow-lg">
          <div className="absolute inset-x-3 top-3">
            <Pill>Memory card</Pill>
          </div>
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between">
            <div>
              <p className="font-display text-3xl font-semibold leading-none">{d.due} due</p>
              <p className="mt-1 text-[13px] text-white/80">Flashcards to review today</p>
            </div>
            <Link href="/flashcards" className="rounded-full border border-white/50 px-3 py-1.5 text-[13px]">
              Review
            </Link>
          </div>
        </div>
        <Link href="/collection" className="relative aspect-[1.62] w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#111114] text-white shadow-lg">
          <span className="absolute -right-6 -top-4 h-40 w-40 opacity-90">
            <CoreThumb creature={latest?.creature ?? "aegiscale"} colorway={latest?.colorway ?? 0} locked={!latest} />
          </span>
          <span className="absolute left-3 top-3">
            <Pill>Cipher cores</Pill>
          </span>
          <span className="absolute inset-x-3 bottom-3">
            <span className="block font-display text-3xl font-semibold leading-none">
              {cores} <span className="text-base text-white/60">/ {TOTAL_UNLOCKS}</span>
            </span>
            <span className="mt-1 block text-[13px] text-white/70">Score 70%+ on anything to open the next one</span>
          </span>
        </Link>
      </div>

      {/* Focus selector, attached under the card like an account row */}
      <label className="relative mx-auto flex h-11 w-[86%] items-center gap-2.5 rounded-xl border border-border bg-card px-3 text-sm">
        <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: dom.color }} aria-hidden />
        <span className="flex-1 truncate">
          D{dom.id} {dom.short}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
        <select
          aria-label="Focus domain"
          value={focus}
          onChange={(e) => setFocus(Number(e.target.value) as DomainId)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {DOMAINS.map((x) => (
            <option key={x.id} value={x.id}>
              D{x.id} {x.name}
            </option>
          ))}
        </select>
      </label>

      <Link href={`/quiz/${dom.slug}?n=10`} className="flex h-12 items-center justify-center rounded-full bg-muted text-[16px] font-semibold active:scale-[0.99]">
        Start 10-question drill
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-muted p-3.5">
          <p className="text-[16px] font-semibold">XP earned</p>
          <dl className="mt-2 space-y-1 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Lifetime</dt>
              <dd className="tabular-nums">{state.xp.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">This week</dt>
              <dd className="tabular-nums text-sky-600 dark:text-sky-400">+{d.xpWeek.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
        <Link href={`/quiz/${d.weakest.slug}?n=10`} className="rounded-2xl bg-muted p-3.5">
          <p className="text-[16px] font-semibold">Weakest area</p>
          <p className="text-[12px] text-muted-foreground">
            D{d.weakest.id} {d.weakest.short}
          </p>
          <DomainMap weakest={d.weakest.id} />
        </Link>
      </div>

      <EffortSlider recommended={d.recommended} compact />

      <section aria-label="History" className="pt-1">
        <SessionHistory state={state} sessions={d.sessions} limit={15} />
      </section>
    </div>
  );
}
