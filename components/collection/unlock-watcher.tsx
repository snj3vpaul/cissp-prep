"use client";

import { useEffect, useState } from "react";
import { actions, useAppState, useHydrated } from "@/lib/store";
import { processCores } from "@/lib/collection";
import { PackReveal } from "@/components/collection/pack-reveal";

/**
 * Turns qualifying sessions (700/1000+) into permanent core grants and runs the pack
 * opening app-wide, so a core earned on a quiz's results screen opens right there.
 */
export function UnlockWatcher() {
  const state = useAppState();
  const hydrated = useHydrated();
  const [opened, setOpened] = useState(0); // pulls opened in this sitting, for "2 of 5"

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

  return (
    <PackReveal
      key={`${g.creature}-${g.colorway}-${g.ts}`}
      grant={g}
      pull={opened + 1}
      pulls={opened + left}
      name={state.settings.name}
      onNext={() => {
        setOpened((n) => n + 1);
        actions.seeCores(1);
      }}
      onDone={() => {
        setOpened(0);
        actions.seeCores();
      }}
    />
  );
}
