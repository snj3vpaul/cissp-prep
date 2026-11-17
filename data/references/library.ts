/**
 * Study reference library. Every question cites entries from here (see objectives.ts / questions.ts).
 * Prefer free, authoritative, stable sources. NIST links use DOIs, which resolve to the current PDF.
 * Versions checked November 2026 (e.g. SP 800-61r3, 800-63-4, 800-88r2 supersede older revisions).
 */
export type RefKind = "outline" | "book" | "nist" | "rfc" | "law" | "owasp" | "industry";

export interface RefEntry {
  title: string;
  publisher: string;
  url?: string;
  kind: RefKind;
}

const nist = (id: string, title: string): RefEntry => ({ title: `NIST ${id.replace(".", " ")} — ${title}`, publisher: "NIST", url: `https://doi.org/10.6028/NIST.${id}`, kind: "nist" });
const rfc = (n: number, title: string): RefEntry => ({ title: `RFC ${n} — ${title}`, publisher: "IETF", url: `https://www.rfc-editor.org/rfc/rfc${n}`, kind: "rfc" });
const owaspCs = (slug: string, title: string): RefEntry => ({ title: `OWASP ${title} Cheat Sheet`, publisher: "OWASP", url: `https://cheatsheetseries.owasp.org/cheatsheets/${slug}_Cheat_Sheet.html`, kind: "owasp" });
const gdpr = (art: number, title: string): RefEntry => ({ title: `GDPR Article ${art} — ${title}`, publisher: "EU Regulation 2016/679", url: `https://gdpr-info.eu/art-${art}-gdpr/`, kind: "law" });

export const REFS = {
  /* ---------------- ISC2 ---------------- */
  "isc2-ethics": { title: "ISC2 Code of Ethics", publisher: "ISC2", url: "https://www.isc2.org/ethics", kind: "industry" },

  /* ---------------- NIST frameworks & risk ---------------- */
  "nist-csf": { title: "NIST Cybersecurity Framework (CSF) 2.0", publisher: "NIST", url: "https://doi.org/10.6028/NIST.CSWP.29", kind: "nist" },
  "nist-privacy-fw": { title: "NIST Privacy Framework", publisher: "NIST", url: "https://www.nist.gov/privacy-framework", kind: "nist" },
  "nist-800-12": nist("SP.800-12r1", "An Introduction to Information Security"),
  "nist-800-30": nist("SP.800-30r1", "Guide for Conducting Risk Assessments"),
  "nist-800-37": nist("SP.800-37r2", "Risk Management Framework for Information Systems and Organizations"),
  "nist-800-39": nist("SP.800-39", "Managing Information Security Risk"),
  "nist-800-53": nist("SP.800-53r5", "Security and Privacy Controls for Information Systems and Organizations"),
  "nist-800-53b": nist("SP.800-53B", "Control Baselines for Information Systems and Organizations"),
  "nist-fips-199": nist("FIPS.199", "Standards for Security Categorization of Federal Information and Information Systems"),
  "nist-800-34": nist("SP.800-34r1", "Contingency Planning Guide for Federal Information Systems"),
  "nist-800-84": nist("SP.800-84", "Guide to Test, Training, and Exercise Programs for IT Plans and Capabilities"),
  "nist-800-50": nist("SP.800-50r1", "Building a Cybersecurity and Privacy Learning Program"),
  "nist-800-161": nist("SP.800-161r1", "Cybersecurity Supply Chain Risk Management Practices"),
  "nist-800-122": nist("SP.800-122", "Guide to Protecting the Confidentiality of PII"),
  "nist-ai-rmf": nist("AI.100-1", "Artificial Intelligence Risk Management Framework (AI RMF 1.0)"),
  "nist-ai-600-1": nist("AI.600-1", "AI RMF: Generative Artificial Intelligence Profile"),

  /* ---------------- NIST architecture & crypto ---------------- */
  "nist-800-160": nist("SP.800-160v1r1", "Engineering Trustworthy Secure Systems"),
  "nist-800-207": nist("SP.800-207", "Zero Trust Architecture"),
  "nist-800-145": nist("SP.800-145", "The NIST Definition of Cloud Computing"),
  "nist-800-125": nist("SP.800-125", "Guide to Security for Full Virtualization Technologies"),
  "nist-800-82": nist("SP.800-82r3", "Guide to Operational Technology (OT) Security"),
  "nist-800-57": nist("SP.800-57pt1r5", "Recommendation for Key Management, Part 1"),
  "nist-800-38d": nist("SP.800-38D", "Recommendation for Block Cipher Modes: Galois/Counter Mode (GCM)"),
  "nist-800-111": nist("SP.800-111", "Guide to Storage Encryption Technologies for End User Devices"),
  "nist-fips-197": nist("FIPS.197-upd1", "Advanced Encryption Standard (AES)"),
  "nist-fips-186": nist("FIPS.186-5", "Digital Signature Standard (DSS)"),
  "nist-fips-203": nist("FIPS.203", "Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM)"),
  "nist-pqc": { title: "NIST Post-Quantum Cryptography project", publisher: "NIST", url: "https://csrc.nist.gov/projects/post-quantum-cryptography", kind: "nist" },

  /* ---------------- NIST network ---------------- */
  "nist-800-41": nist("SP.800-41r1", "Guidelines on Firewalls and Firewall Policy"),
  "nist-800-94": nist("SP.800-94", "Guide to Intrusion Detection and Prevention Systems (IDPS)"),
  "nist-800-77": nist("SP.800-77r1", "Guide to IPsec VPNs"),
  "nist-800-52": nist("SP.800-52r2", "Guidelines for the Selection, Configuration, and Use of TLS Implementations"),
  "nist-800-46": nist("SP.800-46r2", "Guide to Enterprise Telework, Remote Access, and BYOD Security"),
  "nist-800-119": nist("SP.800-119", "Guidelines for the Secure Deployment of IPv6"),

  /* ---------------- NIST identity ---------------- */
  "nist-800-63": nist("SP.800-63-4", "Digital Identity Guidelines"),
  "nist-800-63a": { title: "NIST SP 800-63A-4 — Identity Proofing and Enrollment", publisher: "NIST", url: "https://pages.nist.gov/800-63-4/sp800-63a.html", kind: "nist" },
  "nist-800-63b": { title: "NIST SP 800-63B-4 — Authentication and Authenticator Management", publisher: "NIST", url: "https://pages.nist.gov/800-63-4/sp800-63b.html", kind: "nist" },
  "nist-800-63c": { title: "NIST SP 800-63C-4 — Federation and Assertions", publisher: "NIST", url: "https://pages.nist.gov/800-63-4/sp800-63c.html", kind: "nist" },
  "nist-800-162": nist("SP.800-162", "Guide to Attribute Based Access Control (ABAC)"),

  /* ---------------- NIST assessment & operations ---------------- */
  "nist-800-115": nist("SP.800-115", "Technical Guide to Information Security Testing and Assessment"),
  "nist-800-137": nist("SP.800-137", "Information Security Continuous Monitoring (ISCM)"),
  "nist-800-55": nist("SP.800-55v1", "Measurement Guide for Information Security, Vol. 1"),
  "nist-800-61": nist("SP.800-61r3", "Incident Response Recommendations and Considerations for Cybersecurity Risk Management"),
  "nist-800-86": nist("SP.800-86", "Guide to Integrating Forensic Techniques into Incident Response"),
  "nist-800-92": nist("SP.800-92", "Guide to Computer Security Log Management"),
  "nist-800-40": nist("SP.800-40r4", "Guide to Enterprise Patch Management Planning"),
  "nist-800-128": nist("SP.800-128", "Guide for Security-Focused Configuration Management"),
  "nist-800-167": nist("SP.800-167", "Guide to Application Whitelisting"),
  "nist-800-184": nist("SP.800-184", "Guide for Cybersecurity Event Recovery"),
  "nist-800-88": nist("SP.800-88r2", "Guidelines for Media Sanitization"),

  /* ---------------- NIST software ---------------- */
  "nist-800-218": nist("SP.800-218", "Secure Software Development Framework (SSDF)"),

  /* ---------------- IETF RFCs ---------------- */
  "rfc-1918": rfc(1918, "Address Allocation for Private Internets"),
  "rfc-3227": rfc(3227, "Guidelines for Evidence Collection and Archiving"),
  "rfc-3580": rfc(3580, "IEEE 802.1X RADIUS Usage Guidelines"),
  "rfc-3711": rfc(3711, "The Secure Real-time Transport Protocol (SRTP)"),
  "rfc-4033": rfc(4033, "DNS Security Introduction and Requirements (DNSSEC)"),
  "rfc-4120": rfc(4120, "The Kerberos Network Authentication Service (V5)"),
  "rfc-4253": rfc(4253, "The Secure Shell (SSH) Transport Layer Protocol"),
  "rfc-4301": rfc(4301, "Security Architecture for the Internet Protocol (IPsec)"),
  "rfc-4302": rfc(4302, "IP Authentication Header (AH)"),
  "rfc-4303": rfc(4303, "IP Encapsulating Security Payload (ESP)"),
  "rfc-4862": rfc(4862, "IPv6 Stateless Address Autoconfiguration"),
  "rfc-4987": rfc(4987, "TCP SYN Flooding Attacks and Common Mitigations"),
  "rfc-5280": rfc(5280, "Internet X.509 PKI Certificate and CRL Profile"),
  "rfc-6749": rfc(6749, "The OAuth 2.0 Authorization Framework"),
  "rfc-6960": rfc(6960, "Online Certificate Status Protocol (OCSP)"),
  "rfc-7208": rfc(7208, "Sender Policy Framework (SPF)"),
  "rfc-6376": rfc(6376, "DomainKeys Identified Mail (DKIM) Signatures"),
  "rfc-7489": rfc(7489, "Domain-based Message Authentication, Reporting, and Conformance (DMARC)"),
  "rfc-8446": rfc(8446, "The Transport Layer Security (TLS) Protocol Version 1.3"),
  "rfc-8551": rfc(8551, "S/MIME Version 4.0 Message Specification"),
  "rfc-8907": rfc(8907, "The TACACS+ Protocol"),
  "rfc-9293": rfc(9293, "Transmission Control Protocol (TCP)"),
  "iana-ports": { title: "IANA Service Name and Transport Protocol Port Number Registry", publisher: "IANA", url: "https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml", kind: "rfc" },
  "oidc-core": { title: "OpenID Connect Core 1.0", publisher: "OpenID Foundation", url: "https://openid.net/specs/openid-connect-core-1_0.html", kind: "rfc" },
  "saml-core": { title: "SAML 2.0 Core Specification", publisher: "OASIS", url: "https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf", kind: "rfc" },

  /* ---------------- Law & regulation ---------------- */
  "gdpr": { title: "General Data Protection Regulation (EU) 2016/679 — official text", publisher: "EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj", kind: "law" },
  "gdpr-art3": gdpr(3, "Territorial scope"),
  "gdpr-art4": gdpr(4, "Definitions (controller, processor)"),
  "gdpr-art5": gdpr(5, "Principles relating to processing of personal data"),
  "gdpr-art17": gdpr(17, "Right to erasure"),
  "gdpr-art28": gdpr(28, "Processor"),
  "gdpr-art33": gdpr(33, "Notification of a personal data breach to the supervisory authority"),
  "gdpr-ch5": { title: "GDPR Chapter V — Transfers of personal data to third countries", publisher: "EU Regulation 2016/679", url: "https://gdpr-info.eu/chapter-5/", kind: "law" },
  "hipaa-security": { title: "HIPAA Security Rule", publisher: "U.S. HHS", url: "https://www.hhs.gov/hipaa/for-professionals/security/index.html", kind: "law" },
  "wipo-ip": { title: "What is Intellectual Property? (patents, copyright, trademarks, trade secrets)", publisher: "WIPO", url: "https://www.wipo.int/about-ip/en/", kind: "law" },
  "edrm": { title: "EDRM Model (electronic discovery reference model)", publisher: "EDRM", url: "https://edrm.net/resources/frameworks-and-standards/edrm-model/", kind: "law" },

  /* ---------------- OWASP ---------------- */
  "owasp-top10": { title: "OWASP Top 10 — Web Application Security Risks", publisher: "OWASP", url: "https://owasp.org/Top10/", kind: "owasp" },
  "owasp-llm": { title: "OWASP Top 10 for LLM Applications", publisher: "OWASP GenAI Security Project", url: "https://genai.owasp.org/llm-top-10/", kind: "owasp" },
  "owasp-samm": { title: "OWASP Software Assurance Maturity Model (SAMM)", publisher: "OWASP", url: "https://owaspsamm.org/", kind: "owasp" },
  "owasp-wstg": { title: "OWASP Web Security Testing Guide", publisher: "OWASP", url: "https://owasp.org/www-project-web-security-testing-guide/", kind: "owasp" },
  "owasp-code-review": { title: "OWASP Code Review Guide", publisher: "OWASP", url: "https://owasp.org/www-project-code-review-guide/", kind: "owasp" },
  "owasp-threat-modeling": { title: "OWASP Threat Modeling (community page)", publisher: "OWASP", url: "https://owasp.org/www-community/Threat_Modeling", kind: "owasp" },
  "owasp-fuzzing": { title: "OWASP Fuzzing (community page)", publisher: "OWASP", url: "https://owasp.org/www-community/Fuzzing", kind: "owasp" },
  "owasp-sast": { title: "OWASP Source Code Analysis Tools", publisher: "OWASP", url: "https://owasp.org/www-community/Source_Code_Analysis_Tools", kind: "owasp" },
  "owasp-sqli": owaspCs("SQL_Injection_Prevention", "SQL Injection Prevention"),
  "owasp-xss": owaspCs("Cross_Site_Scripting_Prevention", "Cross Site Scripting Prevention"),
  "owasp-csrf": owaspCs("Cross-Site_Request_Forgery_Prevention", "Cross-Site Request Forgery Prevention"),
  "owasp-session": owaspCs("Session_Management", "Session Management"),
  "owasp-input": owaspCs("Input_Validation", "Input Validation"),
  "owasp-error": owaspCs("Error_Handling", "Error Handling"),
  "owasp-idor": owaspCs("Insecure_Direct_Object_Reference_Prevention", "Insecure Direct Object Reference Prevention"),
  "owasp-secrets": owaspCs("Secrets_Management", "Secrets Management"),
  "owasp-passwords": owaspCs("Password_Storage", "Password Storage"),
  "owasp-cred-stuffing": owaspCs("Credential_Stuffing_Prevention", "Credential Stuffing Prevention"),
  "owasp-abuse-case": owaspCs("Abuse_Case", "Abuse Case"),

  /* ---------------- Industry ---------------- */
  "ms-stride": { title: "Microsoft Threat Modeling Tool — STRIDE threat categories", publisher: "Microsoft", url: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats", kind: "industry" },
  "common-criteria": { title: "Common Criteria Portal (ISO/IEC 15408)", publisher: "CCRA", url: "https://www.commoncriteriaportal.org/", kind: "industry" },
  "aicpa-soc": { title: "System and Organization Controls: SOC Suite of Services", publisher: "AICPA & CIMA", url: "https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services", kind: "industry" },
  "iso-27001": { title: "ISO/IEC 27001 — Information security management systems", publisher: "ISO", url: "https://www.iso.org/standard/27001", kind: "industry" },
  "iia-standards": { title: "Global Internal Audit Standards", publisher: "The IIA", url: "https://www.theiia.org/en/standards/", kind: "industry" },
  "mitre-attack": { title: "MITRE ATT&CK knowledge base", publisher: "MITRE", url: "https://attack.mitre.org/", kind: "industry" },
  "cvss": { title: "Common Vulnerability Scoring System (CVSS)", publisher: "FIRST", url: "https://www.first.org/cvss/", kind: "industry" },
  "cwe-89": { title: "CWE-89: SQL Injection", publisher: "MITRE", url: "https://cwe.mitre.org/data/definitions/89.html", kind: "industry" },
  "cwe-367": { title: "CWE-367: Time-of-check Time-of-use (TOCTOU) Race Condition", publisher: "MITRE", url: "https://cwe.mitre.org/data/definitions/367.html", kind: "industry" },
  "cwe-787": { title: "CWE-787: Out-of-bounds Write", publisher: "MITRE", url: "https://cwe.mitre.org/data/definitions/787.html", kind: "industry" },
  "cisa-ransomware": { title: "#StopRansomware Guide", publisher: "CISA", url: "https://www.cisa.gov/stopransomware/ransomware-guide", kind: "industry" },
  "cisa-kev": { title: "Known Exploited Vulnerabilities Catalog", publisher: "CISA", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", kind: "industry" },
  "cisa-sbom": { title: "Software Bill of Materials (SBOM)", publisher: "CISA", url: "https://www.cisa.gov/sbom", kind: "industry" },
  "cisa-sbd": { title: "Secure by Design", publisher: "CISA", url: "https://www.cisa.gov/securebydesign", kind: "industry" },
  "slsa": { title: "SLSA — Supply-chain Levels for Software Artifacts", publisher: "OpenSSF", url: "https://slsa.dev/", kind: "industry" },
  "ossf-scorecard": { title: "OpenSSF Scorecard (open-source project health)", publisher: "OpenSSF", url: "https://scorecard.dev/", kind: "industry" },
  "fido-passkeys": { title: "Passkeys (FIDO2 / WebAuthn)", publisher: "FIDO Alliance", url: "https://fidoalliance.org/passkeys/", kind: "industry" },
  "ccc": { title: "Confidential Computing Consortium", publisher: "Linux Foundation", url: "https://confidentialcomputing.io/", kind: "industry" },
} satisfies Record<string, RefEntry>;

export type RefKey = keyof typeof REFS;
