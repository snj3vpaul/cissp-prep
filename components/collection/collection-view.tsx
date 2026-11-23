"use client";

import { useEffect, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { useAppState, useHydrated } from "@/lib/store";
import { CREATURES, TOTAL_UNLOCKS, hintFor, type Creature } from "@/lib/collection";
import { getDomain } from "@/lib/domains";
import { Core3D, CoreThumb } from "@/components/collection/core3d";
import { Skeleton } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Grants = NonNullable<ReturnType<typeof useAppState>["cores"]>["grants"];

function Viewer({ c, grants, onClose }: { c: Creature; grants: Grants; onClose: () => void }) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const mine = grants.filter((g) => g.creature === c.id).sort((a, b) => a.colorway - b.colorway);
  const alt = mine.some((g) => g.colorway === 1);
  return (
    <div role="dialog" aria-modal="true" aria-label={c.name} className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-[#111114] p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">{c.domain ? `Domain ${c.domain} · ${getDomain(c.domain).short}` : "Legendary"}</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => setRun((r) => r + 1)} aria-label="Replay" className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose} aria-label="Close" autoFocus className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mx-auto aspect-square w-72">
          <Core3D key={run} creature={c.id} mode="showcase" altUnlocked={alt} />
        </div>
        <h2 className="text-center text-2xl font-semibold">{c.name}</h2>
        <p className="mt-2 text-center text-sm text-white/65">{c.blurb}</p>
        <ul className="mt-5 space-y-2">
          {c.colorways.map((cw, i) => {
            const g = mine.find((x) => x.colorway === i);
            return (
              <li key={cw.name} className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3 py-2.5 text-sm">
                <span className="h-5 w-5 shrink-0 rounded-full border-2" style={{ background: g ? cw.body : "transparent", borderColor: g ? cw.accent : "rgba(255,255,255,.25)" }} aria-hidden />
                <span className="flex-1">
                  {cw.name}
                  <span className="block text-xs text-white/50">
                    {g ? `${g.source} · ${new Date(g.ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })}` : i === 1 ? "Score 850+ once the first colourway is yours" : hintFor(c)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-center text-[11px] text-white/40">The showcase runs 11 seconds: unfold, first colourway, then the alternate.</p>
      </div>
    </div>
  );
}

export function CollectionView() {
  const state = useAppState();
  const hydrated = useHydrated();
  const [open, setOpen] = useState<Creature | null>(null);
  if (!hydrated) return <Skeleton className="m-6 h-96" />;

  const grants = state.cores?.grants ?? [];
  const has = (id: string, c: 0 | 1) => grants.some((g) => g.creature === id && g.colorway === c);
  const recent = [...grants].sort((a, b) => b.ts - a.ts).slice(0, 8);

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 lg:px-10 lg:pt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-[28px]">Cipher cores</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Sealed cores that unfold into creatures. Every quiz, knowledge check or exam simulation scoring 700/1000 or better (70%+, at least 5 items), and every day with 10+ flashcard reviews at 70%+ recall, opens one. Score 850+ to earn an alternate colourway. Passing a full simulation wakes the legendary.
          </p>
        </div>
        <p className="shrink-0 font-display text-3xl font-semibold tabular-nums">
          {grants.length}
          <span className="text-base text-muted-foreground"> / {TOTAL_UNLOCKS}</span>
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-foreground transition-[width] duration-700" style={{ width: `${(grants.length / TOTAL_UNLOCKS) * 100}%` }} />
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CREATURES.map((c) => {
          const base = has(c.id, 0);
          const alt = has(c.id, 1);
          return (
            <li key={c.id} className={cn(c.domain === null && "col-span-2 sm:col-span-1")}>
              <button
                type="button"
                onClick={() => base && setOpen(c)}
                disabled={!base}
                aria-label={base ? `${c.name}: open showcase` : `Sealed core. ${hintFor(c)}`}
                className={cn("group flex w-full flex-col items-center rounded-2xl border p-3 text-center transition-colors", base ? "border-border bg-card hover:bg-muted/60" : "cursor-default border-dashed border-border bg-muted/30", c.domain === null && base && "bg-[#141416] text-white hover:bg-[#1c1c20]")}
              >
                <span className="aspect-square w-full max-w-[150px] transition-transform group-hover:-translate-y-1">
                  <CoreThumb creature={c.id} colorway={alt ? 1 : 0} locked={!base} alt={base ? c.name : "Sealed core"} />
                </span>
                <span className="mt-1 text-sm font-semibold">{base ? c.name : "???"}</span>
                <span className="text-[11px] text-muted-foreground">{c.domain ? `D${c.domain} ${getDomain(c.domain).short}` : "Legendary"}</span>
                <span className="mt-2 flex gap-1.5" aria-label={`${(base ? 1 : 0) + (alt ? 1 : 0)} of 2 colourways`}>
                  {c.colorways.map((cw, i) => {
                    const got = i === 0 ? base : alt;
                    return <span key={cw.name} className="h-2.5 w-2.5 rounded-full border" style={{ background: got ? cw.body : "transparent", borderColor: got ? cw.accent : "hsl(var(--border))" }} />;
                  })}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-10 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Unlock log</h2>
      {recent.length ? (
        <ul className="mt-2 divide-y divide-border border-t border-border">
          {recent.map((g) => {
            const c = CREATURES.find((x) => x.id === g.creature)!;
            const cw = c.colorways[g.colorway];
            return (
              <li key={`${g.creature}-${g.colorway}`} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: cw.body, boxShadow: `0 0 0 2px ${cw.accent}` }} aria-hidden />
                <span className="flex-1">
                  <span className="font-medium">{c.name}</span> <span className="text-muted-foreground">· {cw.name}</span>
                </span>
                <span className="hidden text-muted-foreground sm:inline">{g.source}</span>
                <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">{new Date(g.ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">No cores yet. Score 70% or better on any quiz or check to open your first one.</p>
      )}

      {open && <Viewer c={open} grants={grants} onClose={() => setOpen(null)} />}
    </div>
  );
}
