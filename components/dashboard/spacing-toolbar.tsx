"use client";

import { useEffect } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { ZONES, layoutActions, useLayoutPrefs, type Zone } from "@/lib/layout-prefs";
import { cn } from "@/lib/utils";

function ZoneIcon({ zone, color }: { zone: Zone; color: string }) {
  const c = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden>
      <rect x="1" y="1" width="18" height="18" rx="5" fill={color} opacity="0.12" />
      {zone === "sidebar" && <path d="M5 10h10M7.5 7.5 5 10l2.5 2.5M12.5 7.5 15 10l-2.5 2.5" {...c} />}
      {zone === "page" && <rect x="5" y="5" width="10" height="10" rx="2.5" {...c} />}
      {zone === "section" && <path d="M5 7.5h10M5 12.5h10" {...c} strokeWidth={2.6} />}
      {zone === "gap" && <path d="M7.5 5v10M12.5 5v10" {...c} strokeWidth={2.6} />}
      {zone === "card" && (
        <>
          <rect x="4.5" y="4.5" width="11" height="11" rx="3" {...c} />
          <rect x="7.5" y="7.5" width="5" height="5" rx="1" fill={color} opacity="0.35" />
        </>
      )}
    </svg>
  );
}

/** Floating pill bar: each pill colour-codes one spacing zone on the dashboard and steps its value. */
export function SpacingToolbar() {
  const { prefs, active } = useLayoutPrefs();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && layoutActions.setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => () => layoutActions.setActive(null), []);

  if (!prefs.toolbar) return null;

  return (
    <div
      role="toolbar"
      aria-label="Layout spacing"
      className="fixed bottom-5 z-30 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/90 p-1.5 shadow-lg backdrop-blur lg:flex"
      style={{ left: "calc(var(--sb) + (100vw - var(--sb)) / 2)" }}
    >
      {ZONES.map((z) => {
        const on = active === z.id;
        const v = prefs.values[z.id];
        const i = z.presets.indexOf(v);
        return (
          <div
            key={z.id}
            className={cn("flex h-11 items-center rounded-full border-2 bg-background transition-colors", on ? "" : "border-transparent hover:border-border")}
            style={on ? { borderColor: z.color } : undefined}
          >
            {on && (
              <button type="button" aria-label={`Decrease ${z.label}`} disabled={i <= 0} onClick={() => layoutActions.step(z.id, -1)} className="grid h-9 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30">
                <Minus className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              aria-pressed={on}
              title={z.label}
              aria-label={`${z.label}: ${v}px`}
              onClick={() => layoutActions.setActive(on ? null : z.id)}
              className={cn("flex h-9 items-center gap-2 rounded-full font-display text-[15px] font-semibold tabular-nums", on ? "px-1" : "px-3")}
            >
              <ZoneIcon zone={z.id} color={z.color} />
              {v}
            </button>
            {on && (
              <button type="button" aria-label={`Increase ${z.label}`} disabled={i >= z.presets.length - 1} onClick={() => layoutActions.step(z.id, 1)} className="grid h-9 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30">
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
      <span aria-hidden className="mx-0.5 h-6 w-px bg-border" />
      <button type="button" onClick={() => layoutActions.reset()} aria-label="Reset spacing" title="Reset spacing" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => layoutActions.setToolbar(false)} aria-label="Hide spacing toolbar" title="Hide" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
