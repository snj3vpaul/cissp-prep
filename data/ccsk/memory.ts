/** CCSK v5 memory hooks, mind maps and study resources. */
import type { Mnemonic } from "@/data/mnemonics";
import type { MindmapBranch } from "@/data/mindmaps";
import type { Resource } from "@/data/resources";
import { CCSK_OBJECTIVES } from "@/data/ccsk/outline";

export const CCSK_MNEMONICS: Mnemonic[] = [
  { id: "k-nist5", domain: 1, title: "NIST essential characteristics", hook: "On Broad Resources, Rapidly Measured", expansion: ["On-demand self-service", "Broad network access", "Resource pooling", "Rapid elasticity", "Measured service"], why: "Five from NIST SP 800-145. Multi-tenancy is the ISO/IEC 17788 addition, a common trick question." },
  { id: "k-logical", domain: 1, title: "CSA logical model", hook: "I Must Always Inform", expansion: ["Infrastructure", "Metastructure (management plane)", "Applistructure", "Infostructure (data)"], why: "Metastructure is where cloud differs most. Protect the management plane first." },
  { id: "k-spi", domain: 1, title: "Who manages what", hook: "IaaS: OS up · PaaS: app up · SaaS: settings", expansion: ["IaaS: you manage OS, middleware, apps, data", "PaaS: you manage apps, data and service config", "SaaS: you manage users, permissions, data and settings"], why: "Data and access are always the customer's, whatever the model." },
  { id: "k-gov", domain: 2, title: "Governance hierarchy", hook: "Org → Cloud → Policy → Standard → Guardrail", expansion: ["Organizational governance", "Cloud governance", "Policies (what)", "Standards and baselines", "Controls and guardrails (how)"], why: "Questions asking what comes first point to the top of this chain." },
  { id: "k-guardrails", domain: 2, title: "Scale security safely", hook: "Guardrails, not gates", expansion: ["Baselines define safe settings", "Automation enforces them", "Teams move fast inside the rails"], why: "CSA favors automated preventive controls over manual approvals." },
  { id: "k-inherit", domain: 3, title: "Compliance inheritance", hook: "Inherit the floor, build the house", expansion: ["Provider certifications cover the provider's scope", "Your configuration and use are yours to make compliant"], why: "A certified provider never makes you automatically compliant." },
  { id: "k-accounts", domain: 4, title: "Account strategy", hook: "Many accounts, one org, central logs", expansion: ["Accounts as blast-radius boundaries", "Org-level guardrails", "Restricted log-archive account"], why: "Separation plus central control is the pattern behind most Domain 4 answers." },
  { id: "k-fed", domain: 5, title: "Federation protocols", hook: "SAML signs in, OAuth lets in, OIDC says who", expansion: ["SAML: web SSO assertions", "OAuth 2.0: delegated authorization", "OIDC: authentication on top of OAuth"], why: "Distinguish authentication from authorization when a question names a protocol." },
  { id: "k-deny", domain: 5, title: "Policy evaluation", hook: "Deny beats allow", expansion: ["Explicit deny overrides", "Org guardrails cap everything below", "No allow means implicit deny"], why: "If any applicable policy denies, the answer is denied." },
  { id: "k-telemetry", domain: 6, title: "Cloud telemetry sources", hook: "Plane, Service, Workload, Network", expansion: ["Management plane audit logs", "Service logs", "Workload/OS and app logs", "Network flow logs"], why: "Investigations start with management plane logs." },
  { id: "k-sg", domain: 7, title: "Security groups vs NACLs", hook: "SG = Stateful Guest · NACL = Not stateful, subnet", expansion: ["Security group: stateful, attached to resources", "NACL: stateless, applied to subnets"], why: "Stateless rules need explicit return traffic." },
  { id: "k-container", domain: 8, title: "Container security layers", hook: "Image, Registry, Orchestrator, Runtime", expansion: ["Scan and sign images", "Control and scan the registry", "Protect the orchestrator API", "Run non-root, read-only, monitored"], why: "Match the control to the layer the question describes." },
  { id: "k-keys", domain: 9, title: "Key control spectrum", hook: "Provider → Customer-managed → Customer-supplied", expansion: ["Provider-managed: easiest, least control", "Customer-managed (KMS/HSM): you control policy and lifecycle", "Customer-supplied/held: most control, most work"], why: "Regulatory 'customer must control keys' points to customer-managed or customer-held keys." },
  { id: "k-pipeline", domain: 10, title: "Pipeline tests", hook: "SAST reads, DAST runs, SCA counts parts", expansion: ["SAST: source code", "DAST: running app", "SCA: open-source dependencies", "IaC and image scanning: infrastructure"], why: "Pick the test that sees what the question describes." },
  { id: "k-ir", domain: 11, title: "Incident response lifecycle", hook: "Prepare, Detect, Contain, Learn", expansion: ["Preparation", "Detection and analysis", "Containment, eradication and recovery", "Post-incident activity"], why: "In the cloud, preparation means logging and access are ready before the incident." },
  { id: "k-zt", domain: 12, title: "Zero Trust", hook: "Never trust, always verify", expansion: ["No implicit trust from network location", "PDP decides, PEP enforces", "Per-request, least-privilege access"], why: "Anything granting broad access after one check isn't Zero Trust." },
];

const leaves: Record<string, string[]> = {
  "1.1": ["NIST 5 characteristics", "Multi-tenancy (ISO)"],
  "1.2": ["IaaS / PaaS / SaaS", "Public, private, community, hybrid"],
  "1.3": ["Logical model", "Metastructure", "Reference architectures"],
  "1.4": ["Shared responsibility", "CCM", "CAIQ"],
  "2.1": ["Align with business", "Risk appetite"],
  "2.2": ["Contracts & SLAs", "Due diligence", "CCoE"],
  "2.3": ["Org → cloud governance", "Policies, standards"],
  "2.4": ["Cloud registry", "Guardrails", "STAR"],
  "3.1": ["Provider risk", "Multi-tenancy risk"],
  "3.2": ["Compliance inheritance", "Attestations", "Jurisdiction"],
  "3.3": ["GRC platforms", "Continuous compliance"],
  "4.1": ["Org root", "OUs / folders", "Accounts"],
  "4.2": ["Org policies", "Landing zones", "Central logging"],
  "4.3": ["Hybrid identity", "Multi-cloud CSPM"],
  "5.1": ["Identity = perimeter"],
  "5.2": ["IdP", "Relying party", "Entitlements"],
  "5.3": ["SAML", "OAuth", "OIDC"],
  "5.4": ["Phishing-resistant MFA", "ABAC / RBAC"],
  "5.5": ["Identity vs resource policies", "Explicit deny"],
  "5.6": ["Just-in-time", "Workload identity"],
  "6.1": ["Management plane focus"],
  "6.2": ["Audit logs", "Flow logs", "Workload logs"],
  "6.3": ["Central log account", "SIEM"],
  "6.4": ["CSPM", "Behavior analytics"],
  "6.5": ["GenAI triage", "Human validation"],
  "7.1": ["Immutable", "IaC"],
  "7.2": ["VPC / VNet", "Security groups", "NACLs"],
  "7.3": ["VPN", "Interconnect", "Peering"],
  "7.4": ["Zero Trust", "SASE", "SDP"],
  "8.1": ["VMs, containers, PaaS, FaaS, AI"],
  "8.2": ["Golden images"],
  "8.3": ["Image scanning", "Orchestrator", "Runtime"],
  "8.4": ["Config is yours"],
  "8.5": ["Per-function roles", "Event injection"],
  "8.6": ["Prompt injection", "Poisoning"],
  "9.1": ["Classification", "DSPM", "Keys"],
  "9.2": ["SaaS settings", "Tokenization"],
  "9.3": ["Object, block, file", "Public buckets", "Crypto-shred"],
  "10.1": ["Threat modeling", "SSDF"],
  "10.2": ["Microservices", "API gateway"],
  "10.3": ["Secrets manager", "Token validation"],
  "10.4": ["SAST, DAST, SCA", "Pipeline security"],
  "10.5": ["Base images", "Function config"],
  "11.1": ["NIST lifecycle"],
  "11.2": ["Logging ready", "Provider escalation"],
  "11.3": ["API anomalies"],
  "11.4": ["Isolate via SG", "Snapshots", "Revoke keys"],
  "11.5": ["Lessons learned"],
  "11.6": ["Multi-AZ / region", "Immutable backups"],
  "12.1": ["PDP / PEP", "SDP", "ZTNA"],
  "12.2": ["AI governance", "LLM risks"],
  "12.3": ["Agent/API scanning", "Risk-based priority", "Attack surface"],
};

export const CCSK_MINDMAPS: Record<number, MindmapBranch[]> = {};
for (const [code, label] of Object.entries(CCSK_OBJECTIVES)) {
  const d = Number(code.split(".")[0]);
  (CCSK_MINDMAPS[d] ??= []).push({ code, label, leaves: leaves[code] ?? [] });
}

export const CCSK_RESOURCES: Resource[] = [
  { name: "CCSK v5 Prep Kit (includes the official Study Guide)", org: "Cloud Security Alliance", url: "https://cloudsecurityalliance.org/artifacts/ccsk-v5-prep-kit", description: "Free kit with the official Study Guide, Knowledge Guide, Security Guidance v5, additional reading and acronyms. The Study Guide is the primary exam material.", tag: "Official" },
  { name: "Security Guidance for Critical Areas of Focus in Cloud Computing v5", org: "Cloud Security Alliance", url: "https://cloudsecurityalliance.org/artifacts/security-guidance-v5", description: "The full 12-domain body of knowledge behind CCSK v5. Broader than the exam; keep it open as a backup reference.", tag: "Official" },
  { name: "CCSK exam page and FAQ", org: "Cloud Security Alliance", url: "https://cloudsecurityalliance.org/education/ccsk/", description: "Exam format (60 questions, 120 minutes, 80% to pass, open book), pricing and registration.", tag: "Official" },
  { name: "CCSK v5 Curriculum", org: "Cloud Security Alliance", url: "https://cloudsecurityalliance.org/artifacts/ccsk-v5-curriculum", description: "Course outline for CCSK v5 and the hands-on CCSK Plus labs.", tag: "Official" },
  { name: "Cloud Controls Matrix (CCM) and CAIQ", org: "Cloud Security Alliance", url: "https://cloudsecurityalliance.org/research/cloud-controls-matrix", description: "CSA's cloud control framework and assessment questionnaire, referenced across governance and compliance domains.", tag: "Official" },
  { name: "STAR Registry", org: "Cloud Security Alliance", url: "https://cloudsecurityalliance.org/star", description: "Provider self-assessments and third-party audits, useful for understanding provider assurance.", tag: "Official" },
  { name: "Certificate of Cloud Security Knowledge (CCSK v5) Study Guide", org: "Graham Thompson · O'Reilly, 2025", url: "https://www.oreilly.com/library/view/certificate-of-cloud/9781098173401/", description: "Paid third-party book that follows the official study guide's structure and goes deeper on key topics.", tag: "Practice" },
  { name: "NIST SP 800-145", org: "NIST", url: "https://csrc.nist.gov/pubs/sp/800/145/final", description: "The NIST definition of cloud computing used throughout Domain 1.", tag: "Official" },
];
