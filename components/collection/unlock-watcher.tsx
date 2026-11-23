"use client";

import Link from "next/link";
import { useEffect } from "react";
import { actions, useAppState, useHydrated } from "@/lib/store";
import { CREATURE, processCores } from "@/lib/collection";
import { CoreStage } from "@/components/collection/core-stage";

/**
 * Turns qualifying sessions (700/1000+) into permanent core grants and plays the reveal.
 * Runs app-wide, so a grant earned on a quiz's results screen pops up right there.
 */
export function UnlockWatcher() {
  const state = useAppState();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const { grants, processed } = processCores(state);
    if (!grants.length && !processed.length) return;
    actions.grantCores(grants, processed);
  }, [state, hydrated]);

  const all = state.cores?.grants ?? [];
  const seen = state.cores?.seen ?? 0;
  const left = all.length - seen;
  const g = hydrated && left > 0 ? all[seen] : undefined;
  if (!g) return null;
  const c = CREATURE[g.creature];
  const cw = c.colorways[g.colorway];
  const close = () => actions.seeCores(1);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="unlock-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-[#111114] p-6 text-center text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Core unlocked</p>
        <div className="mx-auto mt-2 aspect-square w-64">
          <CoreStage key={`${g.creature}-${g.colorway}-${g.ts}`} creature={g.creature} colorway={g.colorway} mode="reveal" />
        </div>
        <h2 id="unlock-title" className="text-2xl font-semibold">
          {c.name}
        </h2>
        <p className="mt-1 text-sm" style={{ color: cw.accent === "#1b1b22" ? cw.body : cw.accent }}>
          {cw.name} colourway{g.colorway === 1 ? " · alternate" : ""}
        </p>
        <p className="mt-3 text-sm text-white/60">{g.source}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href="/collection" onClick={() => actions.seeCores()} className="flex h-11 items-center justify-center rounded-full bg-white/10 text-sm font-medium hover:bg-white/15">
            Collection
          </Link>
          <button type="button" autoFocus onClick={close} className="h-11 rounded-full bg-white text-sm font-semibold text-black">
            {left > 1 ? `Next (${left - 1})` : "Nice"}
          </button>
        </div>
        {left > 2 && (
          <button type="button" onClick={() => actions.seeCores()} className="mt-3 text-xs text-white/50 underline-offset-4 hover:text-white hover:underline">
            Skip the other {left - 1} reveals
          </button>
        )}
      </div>
    </div>
  );
}
