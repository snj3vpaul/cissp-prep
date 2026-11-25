/**
 * Study tracks. The app runs one track at a time; switching reloads so every data module
 * (domains, questions, flashcards, mnemonics, mind maps, resources) picks up the new set,
 * and each track keeps its own saved progress.
 */
export type TrackId = "cissp" | "ccsk" | "ctfl" | "ptmc";

/** Fixed exam blueprint: how many questions each domain/chapter gets at each K-level. */
export interface BlueprintRow {
  domain: number;
  k: 1 | 2 | 3 | 4;
  n: number;
}

export interface TrackInfo {
  id: TrackId;
  name: string;
  full: string;
  org: string;
  /** Exam format used by the simulator and pace calculations. */
  exam: {
    items: number;
    minutes: number;
    passPct?: number;
    cat: boolean;
    fullLengthMin: number;
    openBook?: boolean;
    /** Linear exams: page copy for the simulator. */
    title?: string;
    blurb?: string;
    tip?: string;
    spreadNote?: string;
    passNote?: string;
    /** Official question distribution; when absent, questions are spread by domain weight. */
    blueprint?: BlueprintRow[];
  };
  /** What a "domain" is called in this track's source (Domain, Chapter, Section). */
  unit: string;
  storageKey: string;
}

export const TRACKS: Record<TrackId, TrackInfo> = {
  cissp: {
    id: "cissp",
    name: "CISSP",
    full: "Certified Information Systems Security Professional",
    org: "ISC2",
    exam: { items: 150, minutes: 180, cat: true, fullLengthMin: 100 },
    unit: "Domain",
    storageKey: "cissp-command-center:v1",
  },
  ccsk: {
    id: "ccsk",
    name: "CCSK v5",
    full: "Certificate of Cloud Security Knowledge v5",
    org: "Cloud Security Alliance",
    exam: {
      items: 60,
      minutes: 120,
      passPct: 80,
      cat: false,
      fullLengthMin: 60,
      openBook: true,
      title: "CCSK v5 exam simulation",
      blurb: "Mirrors the real CCSK v5 exam from the Cloud Security Alliance: multiple choice, drawn across all 12 domains, open book, and it can’t be paused. Results show how many questions each domain had and how many you got right.",
      tip: "Keep the official CCSK v5 Study Guide open, as you will on exam day. About two minutes per question leaves little time for searching, so know where things are.",
      spreadNote: "CSA doesn’t publish domain weights, so questions are spread evenly (5 per domain).",
    },
    unit: "Domain",
    storageKey: "cissp-command-center:ccsk:v1",
  },
  ctfl: {
    id: "ctfl",
    name: "CTFL v4",
    full: "ISTQB Certified Tester Foundation Level v4.0.1",
    org: "ISTQB",
    exam: {
      items: 40,
      minutes: 60,
      passPct: 65,
      cat: false,
      fullLengthMin: 40,
      openBook: false,
      title: "ISTQB CTFL v4.0 exam simulation",
      blurb: "Built to the official ISTQB Exam Structure Tables: 40 single-answer questions, 1 point each, 60 minutes, closed book, 26 points (65%) to pass. Every chapter gets its exact question count at its exact K-level mix, and no two questions test the same learning objective where the bank allows.",
      tip: "Closed book. 60 minutes for 40 questions is 90 seconds each, but K3 questions (boundary values, decision tables, state transitions, estimation) take 2–3 minutes, so bank time on the K1s. Non-native English speakers get 75 minutes (+25%).",
      spreadNote: "Official CTFL v4.0 distribution: Ch1 8 · Ch2 6 · Ch3 4 · Ch4 11 · Ch5 9 · Ch6 2. K1 8 · K2 24 · K3 8.",
      passNote: "26 of 40",
      blueprint: [
        { domain: 1, k: 1, n: 2 }, { domain: 1, k: 2, n: 6 },
        { domain: 2, k: 1, n: 2 }, { domain: 2, k: 2, n: 4 },
        { domain: 3, k: 1, n: 2 }, { domain: 3, k: 2, n: 2 },
        { domain: 4, k: 2, n: 6 }, { domain: 4, k: 3, n: 5 },
        { domain: 5, k: 1, n: 1 }, { domain: 5, k: 2, n: 5 }, { domain: 5, k: 3, n: 3 },
        { domain: 6, k: 1, n: 1 }, { domain: 6, k: 2, n: 1 },
      ],
    },
    unit: "Chapter",
    storageKey: "cissp-command-center:ctfl:v1",
  },
  ptmc: {
    id: "ptmc",
    name: "Perf µ",
    full: "AT*SQA Performance Testing Micro-Credential",
    org: "AT*SQA",
    exam: {
      items: 10,
      minutes: 20,
      passPct: 70,
      cat: false,
      fullLengthMin: 10,
      openBook: true,
      title: "Performance Testing micro-credential simulation",
      blurb: "Mirrors the AT*SQA micro-credential format: 10 multiple-choice questions, 20 minutes, open book. AT*SQA says the format checks fundamental knowledge and how well you can find information, so every answer points to the exact page of the Body of Knowledge.",
      tip: "Open book: have the AT*SQA Performance Testing Body of Knowledge PDF open and learn where each section starts (pages 6–19). Two minutes a question is enough to look up one fact, not to read a chapter.",
      spreadNote: "AT*SQA doesn’t publish a per-section split, so this app spreads 10 questions by learning-objective count: Purpose 2 · Risks 2 · Approach 2 · Conducting 3 · Tools 1.",
      passNote: "AT*SQA doesn’t publish the cut score; 70% is this app’s target",
      blueprint: [
        { domain: 1, k: 1, n: 1 }, { domain: 1, k: 2, n: 1 },
        { domain: 2, k: 1, n: 2 },
        { domain: 3, k: 2, n: 2 },
        { domain: 4, k: 1, n: 3 },
        { domain: 5, k: 2, n: 1 },
      ],
    },
    unit: "Section",
    storageKey: "cissp-command-center:ptmc:v1",
  },
};

const KEY = "cissp-command-center:track";

function read(): TrackId {
  if (typeof window === "undefined") return "cissp";
  try {
    const v = window.localStorage.getItem(KEY);
    return v && v in TRACKS ? (v as TrackId) : "cissp";
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

/** Pick the active track's value from a per-track table (falls back to CISSP). */
export function byTrack<T>(table: Partial<Record<TrackId, T>> & { cissp: T }): T {
  return table[TRACK_ID] ?? table.cissp;
}
