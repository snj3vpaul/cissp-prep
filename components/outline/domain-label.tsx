"use client";

import { DOMAINS, OUTLINES, activeOutline, type DomainId } from "@/lib/domains";
import { TRACK, TRACK_ID } from "@/lib/track";
import { useAppState, useHydrated } from "@/lib/store";

/**
 * Weight / name that follow the active outline. Server HTML uses the newest outline; after
 * hydration the reader's own outline choice (or exam date) takes over, without a mismatch.
 */
export function DomainWeight({ id }: { id: DomainId }) {
  useAppState(); // re-render when the outline setting changes
  const hydrated = useHydrated();
  if (TRACK_ID === "ccsk") return <>equal weight</>;
  if (TRACK_ID !== "cissp") {
    const n = TRACK.exam.blueprint?.filter((b) => b.domain === id).reduce((s, b) => s + b.n, 0) ?? 0;
    return <>{n} of {TRACK.exam.items} Qs</>;
  }
  return <>{(hydrated ? activeOutline() : OUTLINES["2027"]).weights[id]}%</>;
}

export function DomainName({ id, fallback }: { id: DomainId; fallback: string }) {
  useAppState();
  const hydrated = useHydrated();
  if (TRACK_ID !== "cissp") return <>{DOMAINS[id - 1]?.name ?? fallback}</>;
  return <>{(hydrated ? activeOutline() : OUTLINES["2027"]).names[id] ?? fallback}</>;
}
