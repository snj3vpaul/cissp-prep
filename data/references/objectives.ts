/**
 * Sub-objective → study references.
 * - title: wording of the objective in the ISC2 CISSP Exam Outline (effective 15 April 2024)
 * - osg: chapter(s) of the ISC2 CISSP Official Study Guide, 10th ed. (Chapple, Stewart, Gibson; Sybex, 2024)
 * - refs: free authoritative sources from library.ts that every question on this objective cites
 */
import type { RefKey } from "./library";

export const OSG = {
  edition: "ISC2 CISSP Official Study Guide, 10th ed. (Sybex, 2024)",
  chapters: {
    1: "Security Governance Through Principles and Policies",
    2: "Personnel Security and Risk Management Concepts",
    3: "Business Continuity Planning",
    4: "Laws, Regulations, and Compliance",
    5: "Protecting Security of Assets",
    6: "Cryptography and Symmetric Key Algorithms",
    7: "PKI and Cryptographic Applications",
    8: "Principles of Security Models, Design, and Capabilities",
    9: "Security Vulnerabilities, Threats, and Countermeasures",
    10: "Physical Security Requirements",
    11: "Secure Network Architecture and Components",
    12: "Secure Communications and Network Attacks",
    13: "Managing Identity and Authentication",
    14: "Controlling and Monitoring Access",
    15: "Security Assessment and Testing",
    16: "Managing Security Operations",
    17: "Preventing and Responding to Incidents",
    18: "Disaster Recovery Planning",
    19: "Investigations and Ethics",
    20: "Software Development Security",
    21: "Malicious Code and Application Attacks",
  } as Record<number, string>,
};

export interface ObjectiveInfo {
  title: string;
  osg: number[];
  refs: RefKey[];
}

export const OBJECTIVES: Record<string, ObjectiveInfo> = {
  "1.1": { title: "Understand, adhere to, and promote professional ethics", osg: [19], refs: ["isc2-ethics"] },
  "1.2": { title: "Understand and apply security concepts", osg: [1], refs: ["nist-fips-199", "nist-800-12"] },
  "1.3": { title: "Evaluate and apply security governance principles", osg: [1], refs: ["nist-csf", "nist-800-39"] },
  "1.4": { title: "Understand legal, regulatory, and compliance issues that pertain to information security in a holistic context", osg: [4], refs: ["gdpr", "wipo-ip"] },
  "1.5": { title: "Understand requirements for investigation types", osg: [19], refs: ["nist-800-86"] },
  "1.6": { title: "Develop, document, and implement security policy, standards, procedures, and guidelines", osg: [1], refs: ["nist-800-12"] },
  "1.7": { title: "Identify, analyze, assess, prioritize, and implement Business Continuity (BC) requirements", osg: [3], refs: ["nist-800-34"] },
  "1.8": { title: "Contribute to and enforce personnel security policies and procedures", osg: [2], refs: ["nist-800-53"] },
  "1.9": { title: "Understand and apply risk management concepts", osg: [2], refs: ["nist-800-30", "nist-800-37"] },
  "1.10": { title: "Understand and apply threat modeling concepts and methodologies", osg: [1], refs: ["owasp-threat-modeling", "ms-stride"] },
  "1.11": { title: "Apply Supply Chain Risk Management (SCRM) concepts", osg: [1, 2], refs: ["nist-800-161"] },
  "1.12": { title: "Establish and maintain a security awareness, education, and training program", osg: [2], refs: ["nist-800-50"] },

  "2.1": { title: "Identify and classify information and assets", osg: [5], refs: ["nist-fips-199", "nist-csf"] },
  "2.2": { title: "Establish information and asset handling requirements", osg: [5], refs: ["nist-800-53"] },
  "2.3": { title: "Provision information and assets securely", osg: [5], refs: ["nist-800-128", "nist-csf"] },
  "2.4": { title: "Manage data lifecycle", osg: [5], refs: ["nist-800-88", "gdpr"] },
  "2.5": { title: "Ensure appropriate asset retention (e.g., End of Life (EOL), End of Support (EOS))", osg: [5], refs: ["nist-800-88", "nist-800-40"] },
  "2.6": { title: "Determine data security controls and compliance requirements", osg: [5], refs: ["nist-800-53b", "nist-800-111"] },

  "3.1": { title: "Research, implement, and manage engineering processes using secure design principles", osg: [8], refs: ["nist-800-160", "nist-800-207"] },
  "3.2": { title: "Understand the fundamental concepts of security models", osg: [8], refs: ["nist-800-12"] },
  "3.3": { title: "Select controls based upon systems security requirements", osg: [8], refs: ["common-criteria", "nist-800-53"] },
  "3.4": { title: "Understand security capabilities of Information Systems (IS)", osg: [8], refs: ["nist-800-160"] },
  "3.5": { title: "Assess and mitigate the vulnerabilities of security architectures, designs, and solution elements", osg: [9], refs: ["nist-800-145", "nist-800-125"] },
  "3.6": { title: "Select and determine cryptographic solutions", osg: [6, 7], refs: ["nist-800-57", "nist-fips-197"] },
  "3.7": { title: "Understand methods of cryptanalytic attacks", osg: [7], refs: ["nist-800-57"] },
  "3.8": { title: "Apply security principles to site and facility design", osg: [10], refs: ["nist-800-53"] },
  "3.9": { title: "Design site and facility security controls", osg: [10], refs: ["nist-800-53"] },
  "3.10": { title: "Manage the information system lifecycle", osg: [8, 20], refs: ["nist-800-160", "nist-800-37"] },

  "4.1": { title: "Apply secure design principles in network architectures", osg: [11], refs: ["nist-800-207", "nist-800-41"] },
  "4.2": { title: "Secure network components", osg: [11], refs: ["nist-800-41", "nist-800-94"] },
  "4.3": { title: "Implement secure communication channels according to design", osg: [12], refs: ["nist-800-52", "nist-800-77"] },

  "5.1": { title: "Control physical and logical access to assets", osg: [13], refs: ["nist-800-53", "nist-800-162"] },
  "5.2": { title: "Design identification and authentication strategy (e.g., people, devices, and services)", osg: [13], refs: ["nist-800-63", "nist-800-63b"] },
  "5.3": { title: "Federated identity with a third-party service", osg: [14], refs: ["nist-800-63c", "saml-core"] },
  "5.4": { title: "Implement and manage authorization mechanisms", osg: [14], refs: ["nist-800-162", "nist-800-53"] },
  "5.5": { title: "Manage the identity and access provisioning lifecycle", osg: [13], refs: ["nist-800-53", "nist-800-63"] },
  "5.6": { title: "Implement authentication systems", osg: [14], refs: ["nist-800-63b", "rfc-4120"] },

  "6.1": { title: "Design and validate assessment, test, and audit strategies", osg: [15], refs: ["nist-800-115", "nist-800-137"] },
  "6.2": { title: "Conduct security control testing", osg: [15], refs: ["nist-800-115", "owasp-wstg"] },
  "6.3": { title: "Collect security process data (e.g., technical and administrative)", osg: [15], refs: ["nist-800-55", "nist-800-137"] },
  "6.4": { title: "Analyze test output and generate report", osg: [15], refs: ["nist-800-115"] },
  "6.5": { title: "Conduct or facilitate security audits", osg: [15], refs: ["aicpa-soc", "iso-27001"] },

  "7.1": { title: "Understand and comply with investigations", osg: [19], refs: ["nist-800-86", "rfc-3227"] },
  "7.2": { title: "Conduct logging and monitoring activities", osg: [17], refs: ["nist-800-92", "mitre-attack"] },
  "7.3": { title: "Perform Configuration Management (CM) (e.g., provisioning, baselining, automation)", osg: [16], refs: ["nist-800-128"] },
  "7.4": { title: "Apply foundational security operations concepts", osg: [16], refs: ["nist-800-53"] },
  "7.5": { title: "Apply resource protection", osg: [16], refs: ["nist-800-88", "nist-800-53"] },
  "7.6": { title: "Conduct incident management", osg: [17], refs: ["nist-800-61", "cisa-ransomware"] },
  "7.7": { title: "Operate and maintain detection and preventative measures", osg: [17], refs: ["nist-800-94", "mitre-attack"] },
  "7.8": { title: "Implement and support patch and vulnerability management", osg: [16], refs: ["nist-800-40", "cvss"] },
  "7.9": { title: "Understand and participate in change management processes", osg: [16], refs: ["nist-800-128"] },
  "7.10": { title: "Implement recovery strategies", osg: [18], refs: ["nist-800-34", "nist-800-184"] },
  "7.11": { title: "Implement Disaster Recovery (DR) processes", osg: [18], refs: ["nist-800-34"] },
  "7.12": { title: "Test Disaster Recovery Plans (DRP)", osg: [18], refs: ["nist-800-84", "nist-800-34"] },
  "7.13": { title: "Participate in Business Continuity (BC) planning and exercises", osg: [3, 18], refs: ["nist-800-34", "nist-800-84"] },
  "7.14": { title: "Implement and manage physical security", osg: [10], refs: ["nist-800-53"] },
  "7.15": { title: "Address personnel safety and security concerns", osg: [16], refs: ["nist-800-53", "nist-800-46"] },

  "8.1": { title: "Understand and integrate security in the Software Development Life Cycle (SDLC)", osg: [20], refs: ["nist-800-218", "owasp-samm"] },
  "8.2": { title: "Identify and apply security controls in software development ecosystems", osg: [20], refs: ["nist-800-218", "slsa"] },
  "8.3": { title: "Assess the effectiveness of software security", osg: [20], refs: ["owasp-samm", "owasp-wstg"] },
  "8.4": { title: "Assess security impact of acquired software", osg: [20], refs: ["nist-800-161", "cisa-sbom"] },
  "8.5": { title: "Define and apply secure coding guidelines and standards", osg: [20, 21], refs: ["owasp-top10", "nist-800-218"] },
};
