/**
 * ISC2 CISSP domains, with names and weights for both exam outlines:
 *  - 2024: effective 15 April 2024
 *  - 2027: effective 15 April 2027 (CISSP Certification Exam Outline, revised 16 Oct 2026)
 * `name` and `weight` follow the active outline (see setActiveOutline / resolveOutline).
 */
import { TRACK_ID } from "@/lib/track";

/** 1–8 CISSP, 1–12 CCSK v5, 1–6 CTFL, 1–5 Performance micro-credential. */
export type DomainId = number;
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

export const CISSP_DOMAINS: Domain[] = BASE.map(({ baseName, ...b }) => {
  const d = { ...b } as Domain;
  Object.defineProperties(d, {
    name: { enumerable: true, get: () => OUTLINES[active].names[b.id] ?? baseName },
    weight: { enumerable: true, get: () => OUTLINES[active].weights[b.id] },
  });
  return d;
});

/**
 * CCSK v5 domains (CSA Security Guidance v5 / CCSK v5 Study Guide). CSA does not publish
 * per-domain weights, so each domain is weighted equally (60 items ≈ 5 per domain).
 */
const CCSK_BASE: Omit<Domain, "weight">[] = [
  { id: 1, slug: "ccsk-cloud-concepts-architectures", name: "Cloud Computing Concepts & Architectures", short: "Concepts", color: "#3987E5", tagline: "Definitions, models, logical model, shared responsibility" },
  { id: 2, slug: "ccsk-cloud-governance", name: "Cloud Governance", short: "Governance", color: "#D95926", tagline: "Governance hierarchy, policies, CCM, cloud registry" },
  { id: 3, slug: "ccsk-risk-audit-compliance", name: "Risk, Audit & Compliance", short: "Risk & audit", color: "#199E70", tagline: "Cloud risk, compliance inheritance, attestations, GRC" },
  { id: 4, slug: "ccsk-organization-management", name: "Organization Management", short: "Org mgmt", color: "#C98500", tagline: "Org hierarchy, accounts, guardrails, landing zones" },
  { id: 5, slug: "ccsk-identity-access-management", name: "Identity & Access Management", short: "IAM", color: "#D55181", tagline: "Federation, strong authN, policy types, least privilege" },
  { id: 6, slug: "ccsk-security-monitoring", name: "Security Monitoring", short: "Monitoring", color: "#0CA30C", tagline: "Telemetry sources, collection, detection, GenAI" },
  { id: 7, slug: "ccsk-infrastructure-networking", name: "Infrastructure & Networking", short: "Networking", color: "#9085E9", tagline: "Virtual networks, connectivity, IaC, Zero Trust & SASE" },
  { id: 8, slug: "ccsk-cloud-workload-security", name: "Cloud Workload Security", short: "Workloads", color: "#E66767", tagline: "VMs, containers, PaaS, serverless, AI workloads" },
  { id: 9, slug: "ccsk-data-security", name: "Data Security", short: "Data", color: "#2CA6A4", tagline: "Classification, storage types, encryption & keys" },
  { id: 10, slug: "ccsk-application-security", name: "Application Security", short: "AppSec", color: "#B07AA1", tagline: "Secure SDLC, DevSecOps, CI/CD, app IAM" },
  { id: 11, slug: "ccsk-incident-response-resilience", name: "Incident Response & Resilience", short: "IR & resilience", color: "#7A8B99", tagline: "Cloud IR lifecycle, forensics, resilience" },
  { id: 12, slug: "ccsk-related-technologies-strategies", name: "Related Technologies & Strategies", short: "Zero Trust & AI", color: "#E09F3E", tagline: "Zero Trust, AI, threat & vulnerability management" },
];
export const CCSK_DOMAINS: Domain[] = CCSK_BASE.map((d) => ({ ...d, weight: Math.round((100 / 12) * 100) / 100 }));

/**
 * ISTQB CTFL v4.0.1 syllabus chapters. Weight = share of the 40 exam questions in the official
 * ISTQB Exam Structure Tables (8/6/4/11/9/2).
 */
export const CTFL_DOMAINS: Domain[] = [
  { id: 1, slug: "ctfl-fundamentals-of-testing", name: "Fundamentals of Testing", short: "Fundamentals", color: "#3987E5", tagline: "Objectives, principles, test process, testware, roles, independence", weight: 20 },
  { id: 2, slug: "ctfl-testing-throughout-sdlc", name: "Testing Throughout the SDLC", short: "SDLC", color: "#D95926", tagline: "SDLC impact, test-first, DevOps, shift left, levels & types, maintenance", weight: 15 },
  { id: 3, slug: "ctfl-static-testing", name: "Static Testing", short: "Static", color: "#199E70", tagline: "Value of static testing, review process, roles, review types", weight: 10 },
  { id: 4, slug: "ctfl-test-analysis-design", name: "Test Analysis and Design", short: "Techniques", color: "#C98500", tagline: "EP, BVA, decision tables, state transition, coverage, ATDD", weight: 27.5 },
  { id: 5, slug: "ctfl-managing-test-activities", name: "Managing the Test Activities", short: "Management", color: "#D55181", tagline: "Planning, estimation, prioritization, risk, reporting, defects", weight: 22.5 },
  { id: 6, slug: "ctfl-test-tools", name: "Test Tools", short: "Tools", color: "#9085E9", tagline: "Tool categories, benefits and risks of automation", weight: 5 },
];

/**
 * AT*SQA Performance Testing Micro-Credential body of knowledge sections. Weight = share of the
 * 14 learning objectives (AT*SQA publishes no per-section exam split).
 */
export const PTMC_DOMAINS: Domain[] = [
  { id: 1, slug: "ptmc-purpose-of-performance-testing", name: "The Purpose of Performance Testing", short: "Purpose", color: "#3987E5", tagline: "Goals, requirements & stakeholder agreement, SDLC alignment", weight: 21.43 },
  { id: 2, slug: "ptmc-risks-benefits-challenges", name: "Risks, Benefits and Challenges", short: "Risks", color: "#D95926", tagline: "Unique challenges, risks and benefits of performance testing", weight: 21.43 },
  { id: 3, slug: "ptmc-performance-testing-approach", name: "Performance Testing Approach", short: "Approach", color: "#199E70", tagline: "Test plan components, objectives, metrics, environments, profiles", weight: 14.29 },
  { id: 4, slug: "ptmc-conducting-performance-testing", name: "Conducting Performance Testing", short: "Conducting", color: "#C98500", tagline: "Preparation, execution, evaluation, risk- and objectives-based reports", weight: 28.57 },
  { id: 5, slug: "ptmc-performance-test-tools", name: "Performance Test and Analysis Tools", short: "Tools", color: "#9085E9", tagline: "Why tools are essential, tool challenges and selection", weight: 14.29 },
];

/** Domain number of an objective code: "4.2" (CISSP/CCSK), "FL-4.2.2" (CTFL), "PT-3.1" (micro-credential). */
export function domainOfSub(sub: string): number {
  return Number(sub.replace(/^[A-Z]+-/, "").split(".")[0]);
}

/** Domains of the active study track. */
export const DOMAINS: Domain[] = TRACK_ID === "ccsk" ? CCSK_DOMAINS : TRACK_ID === "ctfl" ? CTFL_DOMAINS : TRACK_ID === "ptmc" ? PTMC_DOMAINS : CISSP_DOMAINS;

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
