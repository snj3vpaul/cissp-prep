/**
 * CISSP exam strategies shown by the croissant coach. Paraphrased from "Proven CISSP Exam
 * Strategies" (Rob Witcher and John Berti, Destination Certification), with the page each comes
 * from. Not reproduced verbatim; read the guide itself for the full context.
 */
export type TipKind = "read" | "mindset" | "expect" | "pattern" | "examday";

export interface StrategyTip {
  id: string;
  kind: TipKind;
  text: string;
  page: number;
}

export const STRATEGY_SOURCE = "Proven CISSP Exam Strategies — Destination Certification";

export const KIND_LABEL: Record<TipKind, string> = {
  read: "Read the question",
  mindset: "CISSP mindset",
  expect: "What to expect",
  pattern: "Question pattern",
  examday: "Exam day",
};

export const STRATEGY_TIPS: StrategyTip[] = [
  { id: "r3", kind: "read", page: 4, text: "Slow down. Read every question at least three times; this isn't a speed-reading exam." },
  { id: "kw", kind: "read", page: 4, text: "Pick out the keywords first. They point at the best answer." },
  { id: "simplify", kind: "read", page: 4, text: "Strip the scenario down to what's actually being asked and drop the extra detail." },
  { id: "qual", kind: "read", page: 4, text: "Hunt for qualifiers: BEST, FIRST, MOST, LEAST, EXCEPT, NOT, ALL. One word can flip the question." },
  { id: "noassume", kind: "read", page: 4, text: "Don't add facts or assumptions. Everything you need is already in the question." },
  { id: "mustbe", kind: "read", page: 4, text: "Before looking at the options, ask yourself: what does the answer have to be?" },
  { id: "cover", kind: "read", page: 4, text: "Cover the options until you know what you're looking for. Three of the four are designed to tempt you." },
  { id: "confirm", kind: "read", page: 4, text: "After you pick, check it really BEST meets every condition in the question." },
  { id: "ceo", kind: "mindset", page: 4, text: "Think like a CEO or a risk advisor. How would senior management answer this?" },
  { id: "thinker", kind: "mindset", page: 4, text: "You're a thinker, not a fixer: think first, act second." },
  { id: "endgame", kind: "mindset", page: 4, text: "Think end game, not the quick fix in front of you." },
  { id: "encompass", kind: "mindset", page: 5, text: "If one answer covers the others, the broader one is usually right." },
  { id: "early", kind: "mindset", page: 5, text: "Security goes in as early as possible. Bolting it on later costs more and works worse." },
  { id: "policy", kind: "mindset", page: 5, text: "An option built on policy is very often the right one." },
  { id: "safety", kind: "mindset", page: 5, text: "Human safety always comes first. No exceptions." },
  { id: "apply", kind: "mindset", page: 5, text: "Learn concepts well enough to apply them to messy scenarios; definitions alone won't carry you." },
  { id: "tech", kind: "mindset", page: 5, text: "The exam isn't deeply technical, but understand the technology behind each concept." },
  { id: "confident", kind: "mindset", page: 5, text: "If you've prepared properly, go in confident and optimistic." },
  { id: "dnd", kind: "expect", page: 3, text: "Drag-and-drop items have no partial credit: every pairing must be right." },
  { id: "unknown", kind: "expect", page: 3, text: "You'll meet topics you never studied. Don't let it rattle you; the strategies still find the best answer." },
  { id: "cat", kind: "expect", page: 3, text: "CAT is good at finding weak areas. Several questions on one topic in a row is normal; stay calm." },
  { id: "ownexam", kind: "expect", page: 3, text: "Treat each question as its own exam. There's no marking for review and no going back." },
  { id: "gov", kind: "pattern", page: 6, text: "Governance beats technology: aligning security with business objectives and risk appetite outranks buying a tool." },
  { id: "except", kind: "pattern", page: 7, text: "EXCEPT questions: three options strengthen governance. Find the one that weakens independent assurance or accountability." },
  { id: "next", kind: "pattern", page: 8, text: "Risk acknowledged by management? The NEXT step is a risk treatment plan so leadership can decide." },
  { id: "most", kind: "pattern", page: 8, text: "MOST comprehensive usually means the program-level answer with governance and a feedback loop, not a single process or metric." },
  { id: "psp", kind: "pattern", page: 9, text: "Policy → standards → procedures. Inconsistent teams with a policy in place? The standard comes FIRST." },
  { id: "accepted", kind: "pattern", page: 10, text: "Accepted risk isn't done: monitor it, track compensating controls and re-evaluate before the acceptance expires." },
  { id: "breakglass", kind: "pattern", page: 10, text: "Urgent privileged access still needs a formal break-glass approval, least privilege, a time limit and full monitoring." },
  { id: "contain", kind: "pattern", page: 11, text: "Data actively leaving the building? Contain FIRST, then investigate, eradicate, recover and notify." },
  { id: "schedule", kind: "examday", page: 5, text: "Book your exam for the time of day you think best: mornings for morning people." },
  { id: "food", kind: "examday", page: 5, text: "Exam day: eat normally but light, and stay hydrated." },
  { id: "warmup", kind: "examday", page: 5, text: "Warm up with 10–15 practice questions before you start, like an athlete before a race." },
  { id: "sleep", kind: "examday", page: 5, text: "The sleep that matters most is two nights before the exam." },
  { id: "pep", kind: "examday", page: 5, text: "Give yourself a pep talk: remember the hours you've put in and the people backing you. You've got this." },
];

/** Qualifier-specific nudges, shown when the current question uses one. */
export const QUALIFIER_TIPS: { re: RegExp; label: string; text: string; page: number }[] = [
  { re: /\b(EXCEPT|NOT|LEAST)\b/, label: "EXCEPT / NOT / LEAST", text: "This flips the question: three options are true. Find the odd one out, and re-read the stem before you commit.", page: 7 },
  { re: /\b(FIRST|NEXT|INITIAL(?:LY)?)\b/, label: "FIRST / NEXT", text: "Order of operations: governance before technology, policy → standards → procedures, contain before you investigate.", page: 9 },
  { re: /\b(MOST|BEST|GREATEST|PRIMARY)\b/, label: "BEST / MOST", text: "Several answers are true. Pick the one that encompasses the others and that a CEO or risk advisor would choose.", page: 8 },
];
