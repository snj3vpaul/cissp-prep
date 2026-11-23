"use client";

import { useSyncExternalStore } from "react";

/**
 * Personal layout tuning. Each spacing token has a few presets; the dashboard's
 * spacing toolbar cycles them and colour-codes the zone it changes.
 */
export type Zone = "sidebar" | "page" | "section" | "gap" | "card";

export const ZONES: { id: Zone; label: string; cssVar: string; presets: number[]; color: string }[] = [
  { id: "sidebar", label: "Sidebar width", cssVar: "--sb", presets: [208, 248, 288], color: "#E5487A" },
  { id: "page", label: "Page padding", cssVar: "--pp", presets: [24, 40, 56], color: "#3B82F6" },
  { id: "section", label: "Section gap", cssVar: "--sg", presets: [32, 48, 64], color: "#8B5CF6" },
  { id: "gap", label: "Grid gap", cssVar: "--gg", presets: [8, 12, 16, 20], color: "#16A34A" },
  { id: "card", label: "Card padding", cssVar: "--cp", presets: [16, 24, 32], color: "#F59E0B" },
];

export interface LayoutPrefs {
  values: Record<Zone, number>;
  toolbar: boolean;
}

const KEY = "cissp-command-center:layout";
const DEFAULTS: LayoutPrefs = { values: { sidebar: 248, page: 40, section: 48, gap: 12, card: 24 }, toolbar: true };

let prefs: LayoutPrefs = DEFAULTS;
let loaded = false;
let active: Zone | null = null;
let snapshot: { prefs: LayoutPrefs; active: Zone | null } = { prefs, active };
const SERVER_SNAPSHOT = snapshot;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<LayoutPrefs>;
      prefs = { ...DEFAULTS, ...p, values: { ...DEFAULTS.values, ...(p.values ?? {}) } };
      snapshot = { prefs, active };
    }
  } catch {
    /* keep defaults */
  }
}

function emit() {
  snapshot = { prefs, active };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

export const layoutActions = {
  setActive(z: Zone | null) {
    active = z;
    emit();
  },
  step(z: Zone, dir: 1 | -1) {
    load();
    const presets = ZONES.find((x) => x.id === z)!.presets;
    const i = presets.indexOf(prefs.values[z]);
    const next = presets[Math.max(0, Math.min(presets.length - 1, (i < 0 ? 1 : i) + dir))];
    prefs = { ...prefs, values: { ...prefs.values, [z]: next } };
    emit();
  },
  setToolbar(open: boolean) {
    load();
    prefs = { ...prefs, toolbar: open };
    if (!open) active = null;
    emit();
  },
  reset() {
    prefs = { ...DEFAULTS, toolbar: prefs.toolbar };
    emit();
  },
};

export function useLayoutPrefs() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return snapshot;
    },
    () => SERVER_SNAPSHOT
  );
}

export function layoutStyle(values: Record<Zone, number>): React.CSSProperties {
  return Object.fromEntries(ZONES.map((z) => [z.cssVar, `${values[z.id]}px`])) as React.CSSProperties;
}
