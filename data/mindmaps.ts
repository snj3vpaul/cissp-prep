/** Domain mindmaps rendered as radial SVG diagrams. Branches follow the 2024 outline sub-objectives. */
export interface MindmapBranch {
  code: string;
  label: string;
  leaves: string[];
}

export const MINDMAPS: Record<number, MindmapBranch[]> = {
  1: [
    { code: "1.1", label: "Ethics", leaves: ["ISC2 canons", "Org code of ethics"] },
    { code: "1.2", label: "Security concepts", leaves: ["CIA", "Authenticity", "Non-repudiation"] },
    { code: "1.3", label: "Governance", leaves: ["Alignment", "Roles", "Frameworks", "Due care/diligence"] },
    { code: "1.4", label: "Legal & compliance", leaves: ["Privacy", "IP", "Transborder flow", "Contracts"] },
    { code: "1.5", label: "Investigations", leaves: ["Admin", "Civil", "Criminal", "Regulatory"] },
    { code: "1.6", label: "Policy docs", leaves: ["Policy", "Standards", "Procedures", "Guidelines"] },
    { code: "1.7", label: "BC requirements", leaves: ["BIA", "MTD/RTO/RPO"] },
    { code: "1.8", label: "Personnel", leaves: ["Screening", "SoD", "Offboarding"] },
    { code: "1.9", label: "Risk mgmt", leaves: ["Assess", "Respond", "Controls", "Monitor"] },
    { code: "1.10", label: "Threat modeling", leaves: ["STRIDE", "PASTA"] },
    { code: "1.11", label: "Supply chain", leaves: ["Due diligence", "SLAs", "Provenance"] },
    { code: "1.12", label: "Awareness", leaves: ["Training", "Phish sims", "Metrics"] },
  ],
  2: [
    { code: "2.1", label: "Classify", leaves: ["Inventory", "Owners", "Labels"] },
    { code: "2.2", label: "Handling", leaves: ["Marking", "Transport", "Storage"] },
    { code: "2.3", label: "Provisioning", leaves: ["Baselines", "Shadow IT"] },
    { code: "2.4", label: "Data lifecycle", leaves: ["Roles", "Remanence", "Collection", "Destruction"] },
    { code: "2.5", label: "Retention", leaves: ["EOL/EOS", "Legal hold"] },
    { code: "2.6", label: "Controls", leaves: ["Data states", "Scoping", "DLP/CASB", "DRM"] },
  ],
  3: [
    { code: "3.1", label: "Secure design", leaves: ["Least privilege", "Zero trust", "Defense in depth"] },
    { code: "3.2", label: "Models", leaves: ["BLP", "Biba", "Clark–Wilson", "Brewer–Nash"] },
    { code: "3.3", label: "Control selection", leaves: ["Common Criteria", "Requirements"] },
    { code: "3.4", label: "System capabilities", leaves: ["TPM/HSM", "Memory protection"] },
    { code: "3.5", label: "Vulnerabilities", leaves: ["Cloud", "ICS/IoT", "Virtualization"] },
    { code: "3.6", label: "Cryptography", leaves: ["Symmetric", "Asymmetric", "PKI", "Hashing"] },
    { code: "3.7", label: "Crypto attacks", leaves: ["Side-channel", "Birthday", "Brute force"] },
    { code: "3.8", label: "Site design", leaves: ["CPTED", "Location"] },
    { code: "3.9", label: "Facility controls", leaves: ["Fire", "Power", "HVAC", "Access"] },
    { code: "3.10", label: "System lifecycle", leaves: ["Requirements", "Decommission"] },
  ],
  4: [
    { code: "4.1", label: "Secure architecture", leaves: ["OSI/TCP-IP", "Segmentation", "IPsec", "Wireless", "SDN"] },
    { code: "4.2", label: "Components", leaves: ["Firewalls", "IDS/IPS", "NAC", "Transmission media"] },
    { code: "4.3", label: "Secure channels", leaves: ["VPN", "Email", "VoIP", "Remote access"] },
  ],
  5: [
    { code: "5.1", label: "Access to assets", leaves: ["Physical", "Logical", "Applications"] },
    { code: "5.2", label: "I&A strategy", leaves: ["Factors", "MFA", "Proofing", "Biometrics"] },
    { code: "5.3", label: "Federation", leaves: ["SAML", "OIDC", "Trust"] },
    { code: "5.4", label: "Authorization", leaves: ["DAC/MAC", "RBAC", "ABAC"] },
    { code: "5.5", label: "Lifecycle", leaves: ["Joiner/Mover/Leaver", "Reviews", "PAM"] },
    { code: "5.6", label: "Auth systems", leaves: ["Kerberos", "RADIUS", "OAuth"] },
  ],
  6: [
    { code: "6.1", label: "Strategy", leaves: ["Internal", "External", "Third-party"] },
    { code: "6.2", label: "Control testing", leaves: ["Vuln scans", "Pen tests", "Code review", "Fuzzing"] },
    { code: "6.3", label: "Process data", leaves: ["KPIs/KRIs", "Backups", "Training"] },
    { code: "6.4", label: "Reporting", leaves: ["Remediation", "Exceptions"] },
    { code: "6.5", label: "Audits", leaves: ["SOC 1/2/3", "Independence"] },
  ],
  7: [
    { code: "7.1", label: "Investigations", leaves: ["Evidence", "Forensics", "Chain of custody"] },
    { code: "7.2", label: "Logging", leaves: ["SIEM", "UEBA", "Threat intel"] },
    { code: "7.3", label: "Config mgmt", leaves: ["Baselines", "Automation"] },
    { code: "7.4", label: "Foundations", leaves: ["Need to know", "SoD", "Rotation"] },
    { code: "7.6", label: "Incident mgmt", leaves: ["Detect", "Contain", "Recover", "Lessons"] },
    { code: "7.8", label: "Patch & vuln", leaves: ["Test", "Deploy", "Verify"] },
    { code: "7.9", label: "Change mgmt", leaves: ["CAB", "Emergency changes"] },
    { code: "7.10", label: "Recovery", leaves: ["Backups", "Sites", "Resilience"] },
    { code: "7.12", label: "DR testing", leaves: ["Tabletop", "Parallel", "Full interruption"] },
    { code: "7.14", label: "Physical & people", leaves: ["Perimeter", "Travel", "Duress"] },
  ],
  8: [
    { code: "8.1", label: "SDLC", leaves: ["Agile", "DevSecOps", "Maturity models"] },
    { code: "8.2", label: "Dev ecosystem", leaves: ["CI/CD", "SBOM", "Secrets", "IaC"] },
    { code: "8.3", label: "Effectiveness", leaves: ["Audit logs", "Risk analysis"] },
    { code: "8.4", label: "Acquired software", leaves: ["COTS", "Open source", "SaaS"] },
    { code: "8.5", label: "Secure coding", leaves: ["Injection", "XSS/CSRF", "APIs", "Input validation"] },
  ],
};
