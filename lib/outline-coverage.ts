import { QUESTIONS } from "@/data/questions";
import { FLASHCARDS } from "@/data/flashcards";
import { OBJECTIVES } from "@/data/references";
import { OBJECTIVES_2027 } from "@/data/outline-2027";
import type { Attempt, Flashcard } from "@/lib/types";

/** Topics the 2027 outline names explicitly, with search terms to check the bank covers them. */
export const SPOTLIGHT: { sub: string; topic: string; terms: RegExp }[] = [
  { sub: "1.1", topic: "Ethics in AI", terms: /\bAI\b.*ethic|ethic.*\bAI\b|artificial intelligence.*ethic/i },
  { sub: "1.11", topic: "SBOM, silicon root of trust, PUF", terms: /\bSBOM\b|bill of materials|root of trust|physically unclonable/i },
  { sub: "2.6", topic: "CASB and CNAPP", terms: /\bCASB\b|\bCNAPP\b|cloud access security broker|cloud-native application protection/i },
  { sub: "3.1", topic: "SASE, well-architected, two-person integrity", terms: /\bSASE\b|secure access service edge|well-architected|two-person/i },
  { sub: "3.1", topic: "Privacy-enhancing technologies", terms: /privacy-enhancing|\bPETs?\b|differential privacy|homomorphic/i },
  { sub: "3.5", topic: "Quantum computing and autonomous systems", terms: /quantum|autonomous/i },
  { sub: "3.6", topic: "Post-quantum cryptography", terms: /post-quantum|\bPQC\b|ML-KEM|kyber|lattice/i },
  { sub: "3.7", topic: "AI threats: adversarial AI, model poisoning, deepfakes", terms: /adversarial|poison|deepfake|prompt injection/i },
  { sub: "3.7", topic: "Zero-day attacks", terms: /zero-day|0-day/i },
  { sub: "4.1", topic: "Converged protocols (iSCSI, CXL, InfiniBand)", terms: /iSCSI|compute express|InfiniBand|FCoE/i },
  { sub: "5.2", topic: "Passwordless: FIDO, WebAuthn, passkeys", terms: /passwordless|FIDO|WebAuthn|passkey/i },
  { sub: "5.4", topic: "Risk-adaptive access control, PDP/PEP", terms: /RAdAC|risk-adapt|policy decision point|policy enforcement point|\bPDP\b|\bPEP\b/i },
  { sub: "7.2", topic: "SOAR, UEBA, threat hunting", terms: /\bSOAR\b|\bUEBA\b|threat hunt/i },
  { sub: "7.10", topic: "Immutable backups", terms: /immutable/i },
  { sub: "7.11", topic: "MTTR and MTBF", terms: /\bMTTR\b|\bMTBF\b|mean time (to|between)/i },
  { sub: "8.1", topic: "SSDF and shift left", terms: /\bSSDF\b|secure software development framework|shift[- ]left/i },
  { sub: "8.2", topic: "Memory-safe languages", terms: /memory[- ]safe/i },
];

export function spotlightCoverage(customCards: Flashcard[]) {
  const cards = [...FLASHCARDS, ...customCards];
  return SPOTLIGHT.map((s) => ({
    ...s,
    questions: QUESTIONS.filter((q) => s.terms.test(`${q.stem} ${q.options.join(" ")} ${q.rationale}`)).length,
    cards: cards.filter((c) => s.terms.test(`${c.front} ${c.back}`)).length,
  }));
}

/** Compare wording only: drop "(e.g., …)" examples, case and spacing. */
const norm = (t: string) => {
  let x = t;
  while (/\([^()]*\)/.test(x)) x = x.replace(/\([^()]*\)/g, ""); // nested "(e.g., … (DiD))"
  return x.replace(/\s+/g, " ").trim().toLowerCase();
};

export function objectiveRows(attempts: Attempt[]) {
  const bank = new Map<string, number>();
  for (const q of QUESTIONS) bank.set(q.subObjective, (bank.get(q.subObjective) ?? 0) + 1);
  const mine = new Map<string, { c: number; t: number }>();
  for (const a of attempts) {
    const e = mine.get(a.sub) ?? { c: 0, t: 0 };
    e.t++;
    if (a.correct) e.c++;
    mine.set(a.sub, e);
  }
  return Object.entries(OBJECTIVES_2027).map(([sub, o]) => {
    const old = OBJECTIVES[sub]?.title;
    const m = mine.get(sub);
    return {
      sub,
      domain: Number(sub.split(".")[0]) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
      title: o.title,
      oldTitle: old && norm(old) !== norm(o.title) ? old : undefined,
      topics: o.topics,
      bank: bank.get(sub) ?? 0,
      answered: m?.t ?? 0,
      accuracy: m && m.t ? Math.round((m.c / m.t) * 100) : null,
    };
  });
}
