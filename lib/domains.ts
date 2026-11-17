/**
 * ISC2 CISSP Exam Outline — effective 15 April 2024.
 * Domain weights are the official approximate percentages.
 */
export type DomainId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Domain {
  id: DomainId;
  slug: string;
  name: string;
  short: string;
  weight: number;
  color: string; // categorical identity hue — validated 8-slot palette (dataviz reference), always paired with a text label
  tagline: string;
}

export const DOMAINS: Domain[] = [
  { id: 1, slug: "security-risk-management", name: "Security and Risk Management", short: "Risk Mgmt", weight: 16, color: "#3987E5", tagline: "Governance, risk, law, ethics, BCP" },
  { id: 2, slug: "asset-security", name: "Asset Security", short: "Assets", weight: 10, color: "#D95926", tagline: "Classification, ownership, data lifecycle" },
  { id: 3, slug: "security-architecture-engineering", name: "Security Architecture and Engineering", short: "Architecture", weight: 13, color: "#199E70", tagline: "Secure design, models, crypto, physical" },
  { id: 4, slug: "communication-network-security", name: "Communication and Network Security", short: "Network", weight: 13, color: "#C98500", tagline: "Secure network architecture & channels" },
  { id: 5, slug: "identity-access-management", name: "Identity and Access Management (IAM)", short: "IAM", weight: 13, color: "#D55181", tagline: "Identification, authN, authZ, lifecycle" },
  { id: 6, slug: "security-assessment-testing", name: "Security Assessment and Testing", short: "Testing", weight: 12, color: "#0CA30C", tagline: "Audits, testing strategies, metrics" },
  { id: 7, slug: "security-operations", name: "Security Operations", short: "Sec Ops", weight: 13, color: "#9085E9", tagline: "Investigations, IR, DR, logging" },
  { id: 8, slug: "software-development-security", name: "Software Development Security", short: "AppSec", weight: 10, color: "#E66767", tagline: "SDLC, secure coding, software risk" },
];

export const EXAM_FORMAT = {
  minItems: 100,
  maxItems: 150,
  simulationItems: 125,
  minutes: 180,
  passingScore: 700,
  maxScore: 1000,
};

export const NEXT_OUTLINE = {
  effective: "April 15, 2027",
  url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline",
  hubUrl: "https://www.isc2.org/certifications/exam-outlines",
};

export const getDomain = (id: number) => DOMAINS.find((d) => d.id === id)!;
export const getDomainBySlug = (slug: string) => DOMAINS.find((d) => d.slug === slug);
