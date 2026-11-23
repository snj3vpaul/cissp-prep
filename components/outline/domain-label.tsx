"use client";

import { OUTLINES, activeOutline, type DomainId } from "@/lib/domains";
import { useAppState, useHydrated } from "@/lib/store";

/**
 * Weight / name that follow the active outline. Server HTML uses the newest outline; after
 * hydration the reader's own outline choice (or exam date) takes over, without a mismatch.
 */
export function DomainWeight({ id }: { id: DomainId }) {
  useAppState(); // re-render when the outline setting changes
  const hydrated = useHydrated();
  return <>{(hydrated ? activeOutline() : OUTLINES["2027"]).weights[id]}%</>;
}

export function DomainName({ id, fallback }: { id: DomainId; fallback: string }) {
  useAppState();
  const hydrated = useHydrated();
  return <>{(hydrated ? activeOutline() : OUTLINES["2027"]).names[id] ?? fallback}</>;
}
