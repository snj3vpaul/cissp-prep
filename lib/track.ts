/**
 * Study tracks. The app runs one track at a time; switching reloads so every data module
 * (domains, questions, flashcards, mnemonics, mind maps, resources) picks up the new set,
 * and each track keeps its own saved progress.
 */
export type TrackId = "cissp" | "ccsk";

export interface TrackInfo {
  id: TrackId;
  name: string;
  full: string;
  org: string;
  /** Exam format used by the simulator and pace calculations. */
  exam: { items: number; minutes: number; passPct?: number; cat: boolean; fullLengthMin: number };
  storageKey: string;
}

export const TRACKS: Record<TrackId, TrackInfo> = {
  cissp: {
    id: "cissp",
    name: "CISSP",
    full: "Certified Information Systems Security Professional",
    org: "ISC2",
    exam: { items: 150, minutes: 180, cat: true, fullLengthMin: 100 },
    storageKey: "cissp-command-center:v1",
  },
  ccsk: {
    id: "ccsk",
    name: "CCSK v5",
    full: "Certificate of Cloud Security Knowledge v5",
    org: "Cloud Security Alliance",
    exam: { items: 60, minutes: 120, passPct: 80, cat: false, fullLengthMin: 60 },
    storageKey: "cissp-command-center:ccsk:v1",
  },
};

const KEY = "cissp-command-center:track";

function read(): TrackId {
  if (typeof window === "undefined") return "cissp";
  try {
    return window.localStorage.getItem(KEY) === "ccsk" ? "ccsk" : "cissp";
  } catch {
    return "cissp";
  }
}

/** The active track, fixed for the lifetime of the page (switching reloads). */
export const TRACK_ID: TrackId = read();
export const TRACK: TrackInfo = TRACKS[TRACK_ID];

export function switchTrack(id: TrackId) {
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    /* storage unavailable: stay on current track */
    return;
  }
  // Full reload on purpose: every data module reads the track once at load.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/");
}
