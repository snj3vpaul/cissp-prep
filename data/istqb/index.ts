/** ISTQB CTFL v4.0.1 and AT*SQA Performance Testing micro-credential tracks: banks, cards, memory aids, resources. */
import type { Question } from "@/lib/types";
import type { Mnemonic } from "@/data/mnemonics";
import type { MindmapBranch } from "@/data/mindmaps";
import type { Resource } from "@/data/resources";
import { buildBank, buildCards, type ICard } from "./_build";
import { CTFL_LO_MAP, CTFL_SECTIONS } from "./ctfl-outline";
import { CTFL_ROWS_A } from "./ctfl-questions-a";
import { CTFL_ROWS_B } from "./ctfl-questions-b";
import { PTMC_LO_MAP, PTMC_ROWS, PTMC_SECTIONS } from "./ptmc";
import { pageRef } from "./sources";

// ───────────────────────── CTFL ─────────────────────────
export const CTFL_QUESTIONS_BY_DOMAIN: Record<number, Question[]> = buildBank(
  {
    prefix: "t",
    domainOf: (lo) => Number(lo.slice(3).split(".")[0]),
    kOf: (lo) => CTFL_LO_MAP.get(lo)?.k ?? 2,
    cite: (lo, page) => {
      const o = CTFL_LO_MAP.get(lo);
      const sec = o?.section ?? "";
      const [title] = CTFL_SECTIONS[sec] ?? [""];
      return [pageRef("ctfl", `§${sec} ${title}`, page, `${lo} (K${o?.k ?? "?"}): ${o?.text ?? ""}`)];
    },
  },
  [...CTFL_ROWS_A, ...CTFL_ROWS_B]
);

const ctflCards: Record<number, ICard[]> = {
  1: [
    ["Typical test objectives (§1.1.1, p. 15)", "Evaluate work products; trigger failures and find defects; ensure required coverage; reduce risk of inadequate quality; verify requirements are fulfilled; verify compliance; give stakeholders information for decisions; build confidence; validate completeness and that it works as stakeholders expect."],
    ["Testing vs debugging (§1.1.2, p. 16)", "Testing triggers failures (dynamic) or finds defects directly (static). Debugging finds the cause (defect), analyzes and removes it: reproduce → diagnose → fix. Then confirmation testing (and regression testing)."],
    ["Error → defect → failure (§1.2.3, p. 17)", "A human error (mistake) creates a defect (fault, bug) which, if executed, may cause a failure. Root cause = the fundamental reason the problem occurred. Failures can also come from environmental conditions (radiation, EM fields).", "Error makes Defect makes Failure"],
    ["Testing vs QA (§1.2.2, p. 17)", "Testing is QC: product-oriented, corrective. QA: process-oriented, preventive — implementation and improvement of processes. Test results feed both."],
    ["7 testing principles (§1.3, pp. 17–18)", "1 Testing shows presence, not absence, of defects · 2 Exhaustive testing is impossible · 3 Early testing saves time and money · 4 Defects cluster together · 5 Tests wear out · 6 Testing is context dependent · 7 Absence-of-defects fallacy.", "Please Explain Every Defect To Customers Always"],
    ["Test activities (§1.4.1, pp. 18–19)", "Planning · Monitoring & control · Analysis (what to test: test conditions) · Design (how to test: test cases, coverage items) · Implementation (testware, procedures, suites, environment) · Execution · Completion (archive testware, lessons learned)."],
    ["Testware by activity (§1.4.3, p. 20)", "Planning: test plan, schedule, risk register, entry/exit criteria · Analysis: prioritized test conditions, defect reports on test basis · Design: test cases, charters, coverage items, data & environment requirements · Implementation: procedures, scripts, suites, data, schedule · Execution: logs, defect reports · Completion: completion report, action items, lessons learned."],
    ["Two testing roles (§1.4.5, p. 21)", "Test management role: test process, team, leadership (planning, monitoring & control, completion). Testing role: engineering — analysis, design, implementation, execution."],
    ["Independence levels (§1.5.3, pp. 22–23)", "None (author) → some (peers in same team) → high (testers outside the author's team, inside the org) → very high (outside the org). Benefit: different failures and biases. Drawbacks: isolation, slower feedback, adversarial relations, developers may lose ownership of quality."],
  ],
  2: [
    ["Good practices in every SDLC (§2.1.2, pp. 25–26)", "Every dev activity has a matching test activity · each test level has specific objectives · test analysis & design for a level starts during the matching dev phase · testers review drafts as soon as available."],
    ["Test-first approaches (§2.1.3, p. 26)", "TDD (unit tests drive code) · ATDD (tests from acceptance criteria during system design) · BDD (Given/When/Then in natural language)."],
    ["Shift left examples (§2.1.5, p. 27)", "Review specs from a testing perspective · write test cases before code · CI/CD with fast automated component tests · static analysis before dynamic testing · start non-functional testing at component level."],
    ["5 test levels (§2.2.1, pp. 28–29)", "Component (unit) · Component integration · System · System integration · Acceptance (UAT, operational, contractual & regulatory, alpha, beta)."],
    ["4 test types (§2.2.2, pp. 29–30)", "Functional (what) · Non-functional (how well — ISO 25010: performance efficiency, compatibility, usability, reliability, security, maintainability, portability, safety) · Black-box · White-box. All types at all levels."],
    ["Confirmation vs regression (§2.2.3, pp. 30–31)", "Confirmation: re-run failed tests to confirm the fix. Regression: check the change caused no adverse effects elsewhere (incl. connected systems). Impact analysis scopes regression; regression suites are prime automation candidates."],
    ["Maintenance testing triggers (§2.3, p. 31)", "Modifications (enhancements, corrective changes, hot fixes) · upgrades or migrations of the operational environment · retirement (data archiving & restore). Scope depends on risk, size of the system and size of the change.", "Modify, Migrate, Retire"],
  ],
  3: [
    ["Static vs dynamic (§3.1.3, p. 34)", "Static finds defects directly without executing; dynamic causes failures, then defects are found by analysis. Static applies to non-executable work products; easier for requirement/design defects, unreachable code, standards deviations, interface spec issues, security vulnerabilities."],
    ["Review process (§3.2.2, pp. 35–36)", "Planning → Review initiation → Individual review → Communication & analysis → Fixing & reporting (ISO/IEC 20246).", "Please Initiate Individual Communication, Fix"],
    ["Review roles (§3.2.3, p. 36)", "Manager (decides what, gives resources) · Author · Moderator/facilitator (runs meetings, safe environment) · Scribe/recorder · Reviewer · Review leader (overall responsibility, who/where/when)."],
    ["4 review types (§3.2.4, pp. 36–37)", "Informal (no process) · Walkthrough (led by author; educate, consensus, ideas) · Technical review (technically qualified reviewers, led by moderator; consensus, technical decisions) · Inspection (most formal, full process, max anomalies, metrics; author cannot lead or scribe)."],
    ["Review success factors (§3.2.5, p. 37)", "Clear objectives & measurable exit criteria · right review type · small chunks · feedback to stakeholders and authors · enough preparation time · management support · part of culture · training. Never evaluate participants."],
  ],
  4: [
    ["Technique categories (§4.1, p. 39)", "Black-box: specification-based, independent of implementation. White-box: structure-based, designed after design/implementation. Experience-based: tester knowledge; complements the others."],
    ["EP coverage (§4.2.1, pp. 39–40)", "Coverage = partitions exercised ÷ all identified partitions (valid AND invalid). One value per partition. Each Choice: every partition of every set at least once, no combinations — minimum = size of largest set."],
    ["BVA (§4.2.2, p. 40)", "Ordered partitions only. 2-value: each boundary + nearest neighbor in the adjacent partition. 3-value: each boundary + both neighbors. 3-value is more rigorous (catches 'x ≤ 10' coded as 'x = 10' via x = 9).", "2 = edge + outside · 3 = inside, edge, outside"],
    ["Decision tables (§4.2.3, p. 41)", "Rows = conditions and actions; columns = rules. T/F, '–' irrelevant, N/A infeasible, X action occurs. Coverage items = feasible columns. n Boolean conditions → 2ⁿ columns before minimizing."],
    ["State transition coverage (§4.2.4, p. 42)", "All states < valid transitions (0-switch, most common) < all transitions (valid + invalid, one invalid per test). All transitions = minimum for mission- and safety-critical software. Only the state table shows invalid transitions explicitly."],
    ["Statement vs branch (§4.3.1–4.3.2, pp. 42–43)", "Statement coverage = executed statements ÷ executable statements. Branch coverage = exercised branches ÷ all branches. 100% branch ⇒ 100% statement, not vice versa. Weakness of white-box: misses defects of omission (p. 43)."],
    ["Experience-based (§4.4, pp. 43–45)", "Error guessing (fault attacks from error/defect/failure lists) · Exploratory (simultaneous design/execution; session-based with test charter and debrief) · Checklist-based (questions, no automatable or too-general items; keep updated)."],
    ["User stories & AC (§4.5.1–4.5.2, pp. 45–46)", "3 C's: Card, Conversation, Confirmation. INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable. AC formats: scenario-oriented (Given/When/Then) or rule-oriented (bullet list, input-output table)."],
    ["ATDD order (§4.5.3, p. 46)", "Specification workshop → write tests from AC before implementation. Positive tests first, then negative, then non-functional. Natural language with preconditions, inputs, postconditions; cover all characteristics, don't go beyond the story, no duplicates."],
  ],
  5: [
    ["Test plan content (§5.1.1, p. 48)", "Context (scope, objectives, test basis) · assumptions & constraints · stakeholders · communication · risk register · test approach (levels, types, techniques, deliverables, entry/exit criteria, independence, metrics, data, environment, deviations) · budget & schedule."],
    ["Entry vs exit criteria (§5.1.3, p. 49)", "Entry: resources available, testware available, initial quality (smoke test passed). Exit: thoroughness (coverage, unresolved defects, defect density, failed tests) + completion (tests run, defects reported, regression automated). Agile: DoR and DoD. Out of time/budget can be valid if stakeholders accept the risk."],
    ["Estimation (§5.1.4, pp. 49–50)", "Ratio-based (historic dev:test ratio) · Extrapolation (measure early, extrapolate) · Wideband Delphi (expert rounds to consensus; Planning Poker) · Three-point: E = (a + 4m + b) / 6, SD = (b − a) / 6.", "a + 4m + b over 6"],
    ["Prioritization (§5.1.5, p. 50)", "Risk-based · coverage-based (incl. additional coverage) · requirements-based. Dependencies can force a lower-priority test to run first; resource availability matters too."],
    ["Testing quadrants (§5.1.7, p. 51)", "Q1 tech/support: component & integration tests (automated, CI) · Q2 business/support: functional, examples, story tests, UX prototypes, API, simulations · Q3 business/critique: exploratory, usability, UAT · Q4 tech/critique: smoke, non-functional (except usability)."],
    ["Risk (§5.2.1–5.2.3, pp. 52–53)", "Risk level from likelihood (0 < p < 1) and impact; quantitative = likelihood × impact, qualitative = risk matrix. Project risks: organizational, people, technical, supplier. Product risks: quality characteristics (ISO 25010)."],
    ["Product risk responses (§5.2.4, p. 53)", "Mitigation by testing · acceptance · transfer · contingency plan. Testing mitigations: right testers, right independence, reviews & static analysis, suitable techniques & coverage, test types for affected characteristics, dynamic + regression testing."],
    ["Progress vs completion report (§5.3.2, pp. 54–55)", "Progress: period, progress & deviations, impediments, metrics, new/changed risks, plan for next period. Completion: summary, evaluation vs plan & exit criteria, deviations, impediments, metrics, unmitigated risks, unfixed defects, lessons learned."],
    ["Defect report fields (§5.5, pp. 56–57)", "ID · title & summary · date, org, author · test object & environment · context · failure description & reproduction steps (logs, screenshots) · expected vs actual · severity · priority · status · references."],
  ],
  6: [
    ["Tool categories (§6.1, p. 59)", "Test management · static testing · test design & implementation · test execution & coverage · non-functional testing · DevOps · collaboration · scalability & deployment (VMs, containers) · any other tool that assists testing (even a spreadsheet)."],
    ["Automation benefits (§6.2, pp. 59–60)", "Saves time on repetitive work · prevents simple human errors · more objective assessment · easier access to information · shorter execution, earlier defect detection, faster feedback · more time for deeper tests."],
    ["Automation risks (§6.2, p. 60)", "Unrealistic expectations · inaccurate estimates · automating what should be manual · over-reliance on the tool · vendor dependency · abandoned open-source · platform incompatibility · tool unsuitable for regulatory/safety requirements."],
  ],
};
export const CTFL_FLASHCARDS = buildCards("t", ctflCards);

export const CTFL_MNEMONICS: Mnemonic[] = [
  { id: "t-principles", domain: 1, title: "Seven testing principles (§1.3, pp. 17–18)", hook: "Please Explain Every Defect To Customers Always", expansion: ["Presence, not absence, of defects", "Exhaustive testing is impossible", "Early testing saves time and money", "Defects cluster together", "Tests wear out", "Context dependent", "Absence-of-defects fallacy"], why: "Scenario questions describe one principle without naming it. 'Same tests, no new bugs' = tests wear out; 'bug-free but nobody wants it' = absence-of-defects fallacy." },
  { id: "t-activities", domain: 1, title: "Test activities (§1.4.1, pp. 18–19)", hook: "Plan, Monitor, Analyze, Design, Implement, Execute, Complete", expansion: ["Analysis = WHAT to test (test conditions)", "Design = HOW to test (test cases)", "Implementation = testware & environment ready", "Completion = archive, lessons learned"], why: "Many K2 questions hinge on analysis vs design vs implementation. Remember: conditions → cases → procedures." },
  { id: "t-chain", domain: 1, title: "Error, defect, failure (§1.2.3, p. 17)", hook: "People Err, Code Defects, Systems Fail", expansion: ["Error = human mistake", "Defect = fault in a work product", "Failure = observed deviation at runtime", "Root cause = why the error happened"], why: "Matching questions list a story and ask you to label each part." },
  { id: "t-levels", domain: 2, title: "Test levels (§2.2.1, pp. 28–29)", hook: "Can Cats Swim Silly Ahead?", expansion: ["Component", "Component integration", "System", "System integration", "Acceptance"], why: "Integration of components vs of systems is the most common confusion." },
  { id: "t-maint", domain: 2, title: "Maintenance triggers (§2.3, p. 31)", hook: "Modify, Migrate, Retire", expansion: ["Modifications: enhancements, fixes, hot fixes", "Upgrades or migrations of the environment", "Retirement: archive & restore data"], why: "A brand-new system is never a maintenance trigger." },
  { id: "t-review", domain: 3, title: "Review process (§3.2.2, pp. 35–36)", hook: "Please Initiate Individual Communication, Fix", expansion: ["Planning", "Review initiation", "Individual review", "Communication and analysis", "Fixing and reporting"], why: "Order questions and 'which activity does X happen in' both come from this list." },
  { id: "t-reviewtypes", domain: 3, title: "Review formality (§3.2.4, pp. 36–37)", hook: "I Walk To Inspect", expansion: ["Informal: no process", "Walkthrough: author leads", "Technical review: moderator leads, consensus", "Inspection: most formal, metrics, author can't lead"], why: "'Led by the author' = walkthrough. 'Maximum anomalies + metrics' = inspection." },
  { id: "t-bva", domain: 4, title: "2-value vs 3-value BVA (§4.2.2, p. 40)", hook: "Two = edge + outside · Three = in, edge, out", expansion: ["Range 1–100, 2-value: 0, 1, 100, 101", "Range 1–100, 3-value: 0, 1, 2, 99, 100, 101"], why: "K3 BVA questions are worth easy points if you list the values on scratch paper before reading the options." },
  { id: "t-st", domain: 4, title: "State transition coverage (§4.2.4, p. 42)", hook: "States < Valid < All", expansion: ["All states", "Valid transitions (0-switch)", "All transitions: valid + one invalid per test"], why: "Stronger criteria subsume weaker ones; all transitions is the minimum for safety-critical software." },
  { id: "t-invest", domain: 4, title: "Good user stories (§4.5.1, p. 45)", hook: "INVEST + 3 C's", expansion: ["Independent, Negotiable, Valuable, Estimable, Small, Testable", "Card, Conversation, Confirmation"], why: "Confirmation = acceptance criteria. Testable = can stakeholders say how to test it?" },
  { id: "t-3pt", domain: 5, title: "Three-point estimation (§5.1.4, p. 50)", hook: "a + 4m + b over 6; spread = (b − a) over 6", expansion: ["a = optimistic", "m = most likely", "b = pessimistic"], why: "Worked example in the syllabus: a=6, m=9, b=18 → E = 10, SD = 2." },
  { id: "t-quadrants", domain: 5, title: "Testing quadrants (§5.1.7, p. 51)", hook: "1 Code · 2 Story · 3 Explore · 4 Perform", expansion: ["Q1 component/integration (tech, supports team)", "Q2 functional & story tests (business, supports team)", "Q3 exploratory, usability, UAT (business, critiques)", "Q4 smoke & non-functional (tech, critiques)"], why: "Usability is Q3, not Q4 — the classic trap." },
  { id: "t-risk", domain: 5, title: "Risk responses (§5.2.4, p. 53)", hook: "MATC", expansion: ["Mitigate (by testing)", "Accept", "Transfer", "Contingency plan"], why: "Insurance = transfer. Rollback plan = contingency. Doing nothing on purpose = acceptance." },
];

const SECTION_LABELS: Record<string, string> = { "2.1": "Testing in the Context of an SDLC", "2.2": "Test Levels and Test Types", "3.1": "Static Testing Basics", "3.2": "Feedback and Review Process", "4.2": "Black-Box Test Techniques", "4.3": "White-Box Test Techniques", "4.4": "Experience-based Test Techniques", "4.5": "Collaboration-based Test Approaches", "5.1": "Test Planning" };
/** One branch per syllabus section (x.y), leaves = its subsections with their start pages. */
function ctflMindmap(): Record<number, MindmapBranch[]> {
  const out: Record<number, MindmapBranch[]> = {};
  for (let d = 1; d <= 6; d++) {
    const groups = new Map<string, string[]>();
    for (const [sec, [title, page]] of Object.entries(CTFL_SECTIONS)) {
      const parts = sec.split(".");
      if (Number(parts[0]) !== d || parts.length < 2) continue;
      const parent = parts.slice(0, 2).join(".");
      if (!groups.has(parent)) groups.set(parent, []);
      if (sec !== parent) groups.get(parent)!.push(`${sec} ${title} (p. ${page})`);
    }
    out[d] = [...groups].map(([code, leaves]) => ({
      code,
      label: CTFL_SECTIONS[code]?.[0] ?? SECTION_LABELS[code] ?? `Section ${code}`,
      leaves: leaves.length ? leaves : [`p. ${CTFL_SECTIONS[code][1]}`],
    }));
  }
  return out;
}
export const CTFL_MINDMAPS: Record<number, MindmapBranch[]> = ctflMindmap();

export const CTFL_RESOURCES: Resource[] = [
  { name: "CTFL Syllabus v4.0.1", org: "ISTQB · free PDF, 78 pages", url: "https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", description: "The only exam source. Every question here cites its section and exact page; links open the PDF on that page.", tag: "Official" },
  { name: "CTFL v4.0 Sample Exams A–D (questions & answers)", org: "ISTQB", url: "https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0", description: "Four official 40-question sample exams with justified answers. Take them last, under exam conditions, after this bank.", tag: "Practice" },
  { name: "Exam Structure and Rules Tables v1.18", org: "ISTQB", url: "https://istqb.org/wp-content/uploads/2026/05/ISTQB_Exam-Structure-and-Rules-Tables_v1.18.pdf", description: "Official question count per chapter and K-level (8/6/4/11/9/2; K1 8, K2 24, K3 8), pass mark 26/40, 60 (+25%) minutes. The exam simulator follows it.", tag: "Official" },
  { name: "ISTQB Glossary", org: "ISTQB", url: "https://glossary.istqb.org/", description: "Exam wording follows glossary definitions exactly; look up any term you'd paraphrase loosely.", tag: "Official" },
  { name: "ASTQB CTFL v4.0.1 sample exams", org: "ASTQB / AT*SQA", url: "https://atsqa.org/assets/documents/CTFL-4.0.1_Sample-Questions-4.pdf", description: "Extra full-length practice from the US member board, aligned to v4.0.1.", tag: "Practice" },
];

// ───────────────────── Performance micro-credential ─────────────────────
export const PTMC_QUESTIONS_BY_DOMAIN: Record<number, Question[]> = buildBank(
  {
    prefix: "p",
    domainOf: (lo) => Number(lo.slice(3).split(".")[0]),
    kOf: (lo) => PTMC_LO_MAP.get(lo)?.k ?? 1,
    cite: (lo, page) => {
      const o = PTMC_LO_MAP.get(lo);
      const [title] = PTMC_SECTIONS[o?.section ?? ""] ?? [""];
      return [pageRef("ptmc", title, page, `${lo} (K${o?.k ?? "?"}): ${o?.text ?? ""}`)];
    },
  },
  PTMC_ROWS
);

const ptCards: Record<number, ICard[]> = {
  1: [
    ["Goals of performance testing (BoK p. 7)", "Measure performance under defined conditions · find the max concurrent users / transaction volume before failure · support capacity planning."],
    ["Why agree on requirements? (BoK p. 8)", "Stakeholders disagree on 'acceptable'; the team must agree what is measured and what success is. Targets carry cost trade-offs (1 s might need 5× hardware; 2 s may be easy). In Agile: non-functional epics."],
    ["Performance across the SDLC (BoK p. 9)", "Requirements: define and agree requirements and load · Design/coding: build performance in · Integration/system: new integrations create bottlenecks · Acceptance: business/operational context, contract and operational acceptance."],
    ["NASDAQ / Facebook IPO (BoK p. 6)", "The trading system couldn't handle volume: three lines of code in an endless loop. Over $80 million in fines and restitution."],
  ],
  2: [
    ["Challenges (BoK p. 10)", "Stakeholder agreement · funding tools · choosing a tool that fits budget and schedule · accurately profiling load · hiring skilled engineers · building a representative environment."],
    ["Risks (BoK p. 10)", "Inadequate test design · incomplete protocol/function coverage · inadequate environment · incorrect tool use · insufficient user or data load · missing or disputed requirements or metrics."],
    ["Benefits (BoK p. 11)", "Right-size the system · plan mitigation for higher loads · define acceptable performance early · test future growth · fix weaknesses before production · order long-lead items in time."],
  ],
  3: [
    ["Performance test plan components (BoK pp. 12–13)", "Scope (functionality, architecture, transactions, users, data) · strategy & approach (e.g. outsourcing) · risk assessment · test objectives · responsibilities · reporting metrics."],
    ["Average vs 90th percentile (BoK p. 13)", "The 90th percentile response time can be more useful than the average because it reduces the effect of outliers. CT-PT p. 53: 90th percentile is a common goal; 100% compliance isn't recommended."],
    ["Environments (BoK p. 13)", "Full-scale dedicated environments are costly; scalable cloud environments are an alternative. Results from smaller environments cannot be reliably extrapolated to larger ones (CT-PT p. 49: performance is non-linear)."],
    ["Profiles and data (BoK p. 14)", "Load/throughput profiles come from user behavior and analytics. Operational profiles = functions + frequencies, run as scripts by virtual users ('transaction threads'). Test data: generated by tools or copied from production if no private data."],
  ],
  4: [
    ["Preparation checks (BoK p. 15)", "Preliminary environment tests · co-existing systems running (they add load) · CPU, database size, network configuration · databases and files populated to designed volumes · preliminary run of sample procedures to check testware works."],
    ["Execution & evaluation (BoK p. 16)", "Monitor during the run (some anomalies only appear in real time, e.g. ramp-up). Results aren't pass/fail: did performance meet stated goals? Testing is a snapshot: repeat during development and after release."],
    ["Load vs stress (BoK p. 16)", "Load testing: performance at given loads. Stress testing: maximum capacity for a configuration, which supports capacity planning."],
    ["Reporting types (BoK p. 17)", "Risk-based: areas of greatest relative risk. Objectives-based: traces results to performance objectives and shows whether each was met. Content varies by audience."],
  ],
  5: [
    ["Why tools are essential (BoK p. 18)", "Simulate concurrent users (concurrency testing) · sustain load over time · measure response time and resource use (CPU, memory) · repeat tests after changes."],
    ["Tool challenges (BoK p. 19)", "Tools don't decide what to test · representative environments are hard and costly (cloud helps) · high data volumes need generation · scarce expertise (consultants common early) · cost — even open source has learning and maintenance costs."],
    ["Tool selection (BoK p. 19)", "Long-term cost · training · vendor reliability · tool lifespan · ROI · future needs. CT-PT pp. 57–58 adds compatibility, scalability, understandability, monitoring."],
  ],
};
export const PTMC_FLASHCARDS = buildCards("p", ptCards);

export const PTMC_MNEMONICS: Mnemonic[] = [
  { id: "p-goals", domain: 1, title: "Goals (BoK p. 7)", hook: "Measure, Max, Plan", expansion: ["Measure under defined conditions", "Max load before failure", "Plan capacity"], why: "Any answer about 'finding functional defects' is not a performance testing goal." },
  { id: "p-sdlc", domain: 1, title: "SDLC alignment (BoK p. 9)", hook: "Define, Design, Integrate, Accept", expansion: ["Requirements: define & agree", "Design/coding: build it in", "Integration/system: bottlenecks", "Acceptance: operational context"], why: "Match the activity to the SDLC stage the question names." },
  { id: "p-rbc", domain: 2, title: "Risks vs benefits vs challenges (BoK pp. 10–11)", hook: "Challenges = getting started · Risks = bad tests · Benefits = right-sized system", expansion: ["Challenges: agreement, funding, tool, load profile, people, environment", "Risks: design, coverage, environment, tool use, load, requirements", "Benefits: right-size, mitigate, define early, growth, fix early, long-lead items"], why: "The three lists overlap in wording; decide which list the question is asking about first." },
  { id: "p-p90", domain: 3, title: "Percentiles (BoK p. 13)", hook: "Nine out of ten, not the mean", expansion: ["90th percentile resists outliers", "Average hides the slow tail"], why: "A favorite one-line lookup question." },
  { id: "p-reports", domain: 4, title: "Reporting types (BoK p. 17)", hook: "Risk shows where it hurts · Objectives show if we hit it", expansion: ["Risk-based: greatest relative risk", "Objectives-based: traced to objectives"], why: "Only two types are named; any other option is a distractor." },
  { id: "p-loadstress", domain: 4, title: "Load vs stress (BoK p. 16)", hook: "Load = how it behaves · Stress = where it breaks", expansion: ["Load: performance at given loads", "Stress: maximum capacity → capacity planning"], why: "CT-PT p. 12 adds spike, endurance, scalability, concurrency and capacity testing." },
];

const ptMap: Record<number, MindmapBranch[]> = {
  1: [
    { code: "PT-1.1", label: "Goals (p. 7)", leaves: ["Measure under conditions", "Max load before failure", "Capacity planning", "NASDAQ example (p. 6)"] },
    { code: "PT-1.2", label: "Requirements (p. 8)", leaves: ["Conflicting views", "Agree measures & success", "Cost trade-offs", "Agile NFR epics"] },
    { code: "PT-1.3", label: "SDLC (p. 9)", leaves: ["Requirements", "Design & coding", "Integration & system", "Acceptance"] },
  ],
  2: [
    { code: "PT-2.1", label: "Challenges (p. 10)", leaves: ["Agreement", "Tool funding & choice", "Load profiling", "Skilled people", "Representative environment"] },
    { code: "PT-2.2", label: "Risks (p. 10)", leaves: ["Test design", "Protocol/function coverage", "Environment", "Tool use", "User/data load", "Requirements & metrics"] },
    { code: "PT-2.3", label: "Benefits (p. 11)", leaves: ["Right-size", "Mitigation plans", "Define early", "Future growth", "Fix before prod", "Long-lead items"] },
  ],
  3: [
    { code: "PT-3.1", label: "Test plan (pp. 12–13)", leaves: ["Scope", "Strategy & approach", "Risk assessment", "Objectives", "Responsibilities", "Metrics (90th pct)"] },
    { code: "PT-3.2", label: "Approach factors (pp. 13–14)", leaves: ["Environments & cloud", "No linear extrapolation", "Load & throughput profiles", "Operational profiles", "Test data"] },
  ],
  4: [
    { code: "PT-4.1", label: "Steps (pp. 15–17)", leaves: ["Prepare", "Execute & monitor", "Evaluate", "Report", "Repeat"] },
    { code: "PT-4.2", label: "Preparation (p. 15)", leaves: ["Environment checks", "Co-existing systems", "Data volumes", "Testware dry run"] },
    { code: "PT-4.3", label: "Results (p. 16)", leaves: ["Not pass/fail", "Meets goals?", "Load vs stress", "Snapshot"] },
    { code: "PT-4.4", label: "Reporting (p. 17)", leaves: ["Risk-based", "Objectives-based", "Audience-specific"] },
  ],
  5: [
    { code: "PT-5.1", label: "Why tools (p. 18)", leaves: ["Concurrency", "Sustained load", "Measure response & resources", "Repeatability"] },
    { code: "PT-5.2", label: "Challenges (p. 19)", leaves: ["Doesn't decide what to test", "Environment cost", "Data volume", "Expertise", "Cost & selection factors"] },
  ],
};
export const PTMC_MINDMAPS: Record<number, MindmapBranch[]> = ptMap;

export const PTMC_RESOURCES: Resource[] = [
  { name: "Performance Testing Body of Knowledge", org: "AT*SQA · free PDF, 21 pages", url: "https://atsqa.org/assets/documents/Performance-Testing-Micro-Credentials.pdf", description: "The micro-credential syllabus and your open-book reference on exam day. Questions here cite its footer page numbers.", tag: "Official" },
  { name: "Performance Testing Micro-Credential", org: "AT*SQA", url: "https://atsqa.org/micro-credentials/performance-testing", description: "Registration and the optional AT*Learn webinar. Free with an ISTQB Performance Testing exam bought through AT*SQA.", tag: "Official" },
  { name: "Micro-credential exam format FAQ", org: "AT*SQA", url: "https://atsqa.org/micro-credentials-first-step", description: "10 questions, 20 minutes, open book, two attempts, US$39–59. Stack 8 micro-credentials for the Testing Essentials certification.", tag: "Official" },
  { name: "ISTQB CT-PT Syllabus v1.0 (2018)", org: "ISTQB · free PDF, 59 pages", url: "https://www.istqb.org/wp-content/uploads/2024/11/ISTQB-CT-PT_Syllabus_v1.0_2018.pdf", description: "The full ISTQB Performance Testing syllabus. Cited for deeper coverage; it's the next step after the micro-credential.", tag: "Official" },
  { name: "ISTQB CT-PT Sample Exam A v1.3", org: "ISTQB", url: "https://www.istqb.org/certifications/performance-tester", description: "Official 40-question sample exam for the full CT-PT certification (40 questions, 26 to pass).", tag: "Practice" },
];

/** Every citation's base document, for the reference library counts. */
export const ISTQB_LIBRARY = {
  ctfl: [pageRef("ctfl", "whole syllabus", 1), { kind: "industry" as const, title: "ISTQB Exam Structure and Rules Tables v1.18", publisher: "ISTQB", url: "https://istqb.org/wp-content/uploads/2026/05/ISTQB_Exam-Structure-and-Rules-Tables_v1.18.pdf" }],
  ptmc: [pageRef("ptmc", "whole body of knowledge", 1), pageRef("ctpt", "whole syllabus", 1)],
};
