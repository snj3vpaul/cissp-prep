import type { AppState, SessionSummary } from "@/lib/types";
import type { DomainId } from "@/lib/domains";

/**
 * Cipher cores: original collectible creatures sealed in security-themed shells.
 * Every session that scores 700/1000 or better (70%+) unlocks one; 850+ can unlock an
 * alternate colourway; passing a full simulation unlocks the legendary.
 */
export interface Colorway {
  name: string;
  body: string;
  shade: string;
  belly: string;
  accent: string;
  eye: string;
}

export interface Creature {
  id: string;
  name: string;
  domain: DomainId | null; // null = legendary
  blurb: string;
  colorways: [Colorway, Colorway];
}

const cw = (name: string, body: string, shade: string, belly: string, accent: string, eye = "#1b1b22"): Colorway => ({ name, body, shade, belly, accent, eye });

export const CREATURES: Creature[] = [
  { id: "aegiscale", name: "Aegiscale", domain: 1, blurb: "Rolls into a shield when risk appears. Its crest grows a point for every policy it enforces.", colorways: [cw("Charter", "#4C8BF5", "#2F63C4", "#DCE8FF", "#FFC23D"), cw("Board", "#1F2A44", "#121a2e", "#8FA3C8", "#F2D16B", "#F2D16B")] },
  { id: "vaultmole", name: "Vaultmole", domain: 2, blurb: "Digs a labelled tunnel for every asset and never forgets where it buried the keys.", colorways: [cw("Ledger", "#E07B4B", "#B85A2E", "#FBE1CF", "#3D3A3A"), cw("Archive", "#5B6B73", "#3E4B52", "#D7DEE2", "#F08A4B")] },
  { id: "pylonyx", name: "Pylonyx", domain: 3, blurb: "Grows crystal pylons along its spine, one for each layer of its defence in depth.", colorways: [cw("Quartz", "#2DB38A", "#1E8766", "#D3F5E8", "#9EE7FF"), cw("Obsidian", "#2B3138", "#1A1F24", "#7D8A96", "#5EF2C4", "#5EF2C4")] },
  { id: "relaybat", name: "Relaybat", domain: 4, blurb: "Hears every packet in the building. Sleeps upside down on the core switch.", colorways: [cw("Signal", "#E3A81F", "#B9840E", "#FFF1C7", "#3B3A6B"), cw("Static", "#3B3F5C", "#262940", "#A9AECF", "#FFD34D", "#FFD34D")] },
  { id: "keyfox", name: "Keyfox", domain: 5, blurb: "Its tail is a key it only lends out just in time, and always takes back.", colorways: [cw("Token", "#E2557F", "#B83A62", "#FFE0EA", "#FFD166"), cw("Passkey", "#F4F1EA", "#CFC9BC", "#FFFFFF", "#E2557F")] },
  { id: "probeetle", name: "Probeetle", domain: 6, blurb: "Taps every wall with its antennae and writes a finding for anything that sounds hollow.", colorways: [cw("Audit", "#2FA84F", "#1F7D38", "#D8F5DF", "#FF8A3D"), cw("Pentest", "#C6352F", "#922420", "#F7D6D4", "#1E1E24")] },
  { id: "sentrowl", name: "Sentrowl", domain: 7, blurb: "Never blinks during a night shift. Its eyes sweep the SIEM in slow circles.", colorways: [cw("Watch", "#8F86EA", "#6A60CC", "#ECEAFF", "#FFB547"), cw("Night", "#22243A", "#151626", "#6E7199", "#7CF0FF", "#7CF0FF")] },
  { id: "bytenewt", name: "Bytenewt", domain: 8, blurb: "Regrows any limb, as long as the change goes through code review first.", colorways: [cw("Build", "#F08080", "#CF5D5D", "#FFE6E6", "#5C4CE0"), cw("Release", "#FFF6E8", "#E8D9C0", "#FFFFFF", "#F08080")] },
  { id: "cipherion", name: "Cipherion", domain: null, blurb: "Wakes only for someone who passes a full simulation. Its chest holds the master key.", colorways: [cw("Sovereign", "#F2B33D", "#C98A12", "#FFF0C9", "#6B3FD1"), cw("Eclipse", "#14131A", "#09090d", "#4A475C", "#F2B33D", "#F2B33D")] },
];

export const CREATURE = Object.fromEntries(CREATURES.map((c) => [c.id, c])) as Record<string, Creature>;
export const TOTAL_UNLOCKS = CREATURES.length * 2;

export interface Grant {
  creature: string;
  colorway: 0 | 1;
  ts: number;
  source: string;
  score: number; // 0..1000
}

export interface CoreState {
  grants: Grant[];
  processed: string[];
}

interface Qualifier {
  key: string;
  ts: number;
  score: number;
  domain?: DomainId;
  legendary: boolean;
  source: string;
}

const PASS = 700;
const ALT = 850;
const MODE_LABEL: Record<SessionSummary["mode"], string> = { quick: "Quick 10", timed: "Timed 25", missed: "Missed review", domain: "Domain drill", exam: "Exam simulation", check: "Knowledge check" };

function sessionScore(s: SessionSummary) {
  if (s.mode === "exam" && s.scaled !== undefined) return s.scaled;
  return Math.round((s.correct / Math.max(1, s.total)) * 1000);
}

/** Sessions and flashcard days that clear 700/1000, oldest first. */
export function qualifiers(state: AppState): Qualifier[] {
  const out: Qualifier[] = [];
  for (const s of state.sessions) {
    const min = s.mode === "exam" ? 25 : 5;
    if (s.total < min) continue;
    const score = sessionScore(s);
    if (score < PASS) continue;
    out.push({
      key: `s:${s.id}`,
      ts: s.ts,
      score,
      domain: s.mode === "domain" ? s.domain : undefined,
      legendary: s.mode === "exam" && !!s.passed,
      source: `${MODE_LABEL[s.mode]} · ${s.mode === "exam" ? `${score}/1000` : `${s.correct}/${s.total}`}`,
    });
  }
  for (const [day, m] of Object.entries(state.memoryDays ?? {})) {
    if (m.n < 10) continue;
    const score = Math.round((m.recalled / m.n) * 1000);
    if (score < PASS) continue;
    const [y, mo, d] = day.split("-").map(Number);
    out.push({ key: `m:${day}`, ts: new Date(y, mo - 1, d, 23, 0).getTime(), score, legendary: false, source: `Memory check · ${m.recalled}/${m.n} recalled` });
  }
  return out.sort((a, b) => a.ts - b.ts);
}

/** Assign unlocks for qualifying events not yet processed. Grants are permanent once given. */
export function processCores(state: AppState): { grants: Grant[]; processed: string[] } {
  const prev = state.cores ?? { grants: [], processed: [] };
  const done = new Set(prev.processed);
  const owned = new Set(prev.grants.map((g) => `${g.creature}:${g.colorway}`));
  const grants: Grant[] = [];
  const processed: string[] = [];
  const has = (id: string, c: 0 | 1) => owned.has(`${id}:${c}`);
  const give = (q: Qualifier, creature: string, colorway: 0 | 1) => {
    owned.add(`${creature}:${colorway}`);
    grants.push({ creature, colorway, ts: q.ts, source: q.source, score: q.score });
  };
  const domainCreatures = CREATURES.filter((c) => c.domain !== null);

  for (const q of qualifiers(state)) {
    if (done.has(q.key)) continue;
    processed.push(q.key);
    if (q.legendary) {
      if (!has("cipherion", 0)) {
        give(q, "cipherion", 0);
        continue;
      }
      if (q.score >= ALT && !has("cipherion", 1)) {
        give(q, "cipherion", 1);
        continue;
      }
    }
    const preferred = q.domain ? domainCreatures.find((c) => c.domain === q.domain) : undefined;
    if (preferred && !has(preferred.id, 0)) {
      give(q, preferred.id, 0);
      continue;
    }
    if (q.score >= ALT) {
      const alt = (preferred && !has(preferred.id, 1) ? preferred : undefined) ?? domainCreatures.find((c) => has(c.id, 0) && !has(c.id, 1));
      if (alt) {
        give(q, alt.id, 1);
        continue;
      }
    }
    const next = domainCreatures.find((c) => !has(c.id, 0));
    if (next) give(q, next.id, 0);
  }
  return { grants, processed };
}

export function hintFor(c: Creature) {
  return c.domain === null ? "Pass a full exam simulation (700+ on 100+ items)." : `Score 700+ on a Domain ${c.domain} drill, or on any quiz, check or memory session once earlier cores are found.`;
}
