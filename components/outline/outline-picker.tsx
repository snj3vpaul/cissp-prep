"use client";

import { actions, useAppState } from "@/lib/store";
import { OUTLINES, resolveOutline, type OutlinePref } from "@/lib/domains";
import { cn } from "@/lib/utils";

const OPTIONS: { id: OutlinePref; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "2024", label: "2024" },
  { id: "2027", label: "2027" },
];

/** Auto / 2024 / 2027 switch, with a line explaining which outline is in force and why. */
export function OutlinePicker({ className }: { className?: string }) {
  const { settings } = useAppState();
  const pref = settings.outline ?? "auto";
  const resolved = OUTLINES[resolveOutline(pref, settings.examDate)];
  const why =
    pref !== "auto"
      ? "Chosen manually."
      : settings.examDate
        ? `Your exam date (${settings.examDate}) is ${settings.examDate < OUTLINES["2027"].effective ? "before" : "on or after"} 15 April 2027.`
        : "No exam date set, so the newest outline is used.";

  return (
    <div className={className}>
      <div role="radiogroup" aria-label="Exam outline" className="inline-flex rounded-full bg-muted p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={pref === o.id}
            onClick={() => actions.updateSettings({ outline: o.id === "auto" ? undefined : o.id })}
            className={cn("h-9 rounded-full px-4 text-sm font-medium transition-colors", pref === o.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Studying to the <span className="font-semibold text-foreground">{resolved.label}</span> (effective {resolved.effectiveLabel}). {why}
      </p>
    </div>
  );
}
