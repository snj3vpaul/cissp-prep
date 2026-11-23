/**
 * ISC2 CISSP domains, with names and weights for both exam outlines:
 *  - 2024: effective 15 April 2024
 *  - 2027: effective 15 April 2027 (CISSP Certification Exam Outline, revised 16 Oct 2026)
 * `name` and `weight` follow the active outline (see setActiveOutline / resolveOutline).
 */
export type DomainId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type OutlineId = "2024" | "2027";
export type OutlinePref = "auto" | OutlineId;

export interface Domain {
  id: DomainId;
  slug: string;
  name: string;
  short: string;
  weight: number;
  color: string; // categorical identity hue — validated 8-slot palette (dataviz reference), always paired with a text label
  tagline: string;
}

export const OUTLINES = {
  "2024": {
    id: "2024" as OutlineId,
    label: "2024 outline",
    effective: "2024-04-15",
    effectiveLabel: "15 April 2024",
    weights: { 1: 16, 2: 10, 3: 13, 4: 13, 5: 13, 6: 12, 7: 13, 8: 10 } as Record<DomainId, number>,
    names: { 1: "Security and Risk Management" } as Partial<Record<DomainId, string>>,
  },
  "2027": {
    id: "2027" as OutlineId,
    label: "2027 outline",
    effective: "2027-04-15",
    effectiveLabel: "15 April 2027",
    weights: { 1: 13.6, 2: 12, 3: 12.8, 4: 12.8, 5: 13.6, 6: 11.2, 7: 12.8, 8: 11.2 } as Record<DomainId, number>,
    names: { 1: "Security Governance and Risk Management" } as Partial<Record<DomainId, string>>,
  },
} as const;

/**
 * Which outline applies: an explicit choice wins; otherwise the outline in force on the exam
 * date, and the newest outline when no date is set.
 */
export function resolveOutline(pref: OutlinePref | undefined, examDate?: string): OutlineId {
  if (pref === "2024" || pref === "2027") return pref;
  if (examDate) return examDate < OUTLINES["2027"].effective ? "2024" : "2027";
  return "2027";
}

let active: OutlineId = "2027";
export function setActiveOutline(id: OutlineId) {
  active = id;
}
export function activeOutline() {
  return OUTLINES[active];
}

const BASE: (Omit<Domain, "name" | "weight"> & { baseName: string })[] = [
  { id: 1, slug: "security-risk-management", baseName: "Security and Risk Management", short: "Governance", color: "#3987E5", tagline: "Governance, risk, law, ethics, BCP" },
  { id: 2, slug: "asset-security", baseName: "Asset Security", short: "Assets", color: "#D95926", tagline: "Classification, ownership, data lifecycle" },
  { id: 3, slug: "security-architecture-engineering", baseName: "Security Architecture and Engineering", short: "Architecture", color: "#199E70", tagline: "Secure design, models, crypto, physical" },
  { id: 4, slug: "communication-network-security", baseName: "Communication and Network Security", short: "Network", color: "#C98500", tagline: "Secure network architecture & channels" },
  { id: 5, slug: "identity-access-management", baseName: "Identity and Access Management (IAM)", short: "IAM", color: "#D55181", tagline: "Identification, authN, authZ, lifecycle" },
  { id: 6, slug: "security-assessment-testing", baseName: "Security Assessment and Testing", short: "Testing", color: "#0CA30C", tagline: "Audits, testing strategies, metrics" },
  { id: 7, slug: "security-operations", baseName: "Security Operations", short: "Sec Ops", color: "#9085E9", tagline: "Investigations, IR, DR, logging" },
  { id: 8, slug: "software-development-security", baseName: "Software Development Security", short: "AppSec", color: "#E66767", tagline: "SDLC, secure coding, software risk" },
];

export const DOMAINS: Domain[] = BASE.map(({ baseName, ...b }) => {
  const d = { ...b } as Domain;
  Object.defineProperties(d, {
    name: { enumerable: true, get: () => OUTLINES[active].names[b.id] ?? baseName },
    weight: { enumerable: true, get: () => OUTLINES[active].weights[b.id] },
  });
  return d;
});

export const EXAM_FORMAT = {
  minItems: 100,
  maxItems: 150,
  simulationItems: 125,
  minutes: 180,
  passingScore: 700,
  maxScore: 1000,
};

export const OUTLINE_LINKS = {
  url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline",
  hubUrl: "https://www.isc2.org/certifications/exam-outlines",
};

export const getDomain = (id: number) => DOMAINS.find((d) => d.id === id)!;
export const getDomainBySlug = (slug: string) => DOMAINS.find((d) => d.slug === slug);
