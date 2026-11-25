# CISSP Command Center

A free, local-first CISSP exam-prep web app. It has original practice questions with rationales for every option, SM-2 spaced-repetition flashcards, a 125-item CAT-style exam simulation, a mnemonics and mindmap vault, and progress analytics. The structure follows the **ISC2 CISSP Exam Outline effective 15 April 2024**.

> Next outline: ISC2 moves the CISSP to a new exam outline on **April 15, 2027**. See [isc2.org/certifications/exam-outlines](https://www.isc2.org/certifications/exam-outlines).

**Stack:** Next.js 16 (App Router, Turbopack, TypeScript), React 19, Tailwind CSS with shadcn/ui conventions, Framer Motion, Recharts, Radix Dialog, next-themes and canvas-confetti. No backend and no environment variables. Progress is saved in `localStorage`.

---

## Deploy to Vercel in 3 steps

1. **Push to GitHub.**
   ```bash
   git init && git add . && git commit -m "CISSP Command Center"
   git branch -M main
   git remote add origin https://github.com/<you>/cissp-prep.git
   git push -u origin main
   ```
2. **Import into Vercel.** Go to [vercel.com/new](https://vercel.com/new) and choose your repository. Use these settings:
   - Framework preset: **Next.js**
   - Build command: `next build` (the default)
   - Environment variables: **none required**
3. **Click Deploy.**

## CISSP Pocket Trainer (`/pocket`)

A standalone, phone-first trainer served at `/pocket`. You don't need to log in or build anything: just open it on your phone and add it to your Home Screen.

- **160 original questions** (20 per domain) across 4 tiers: 🌱 Recruit, 🔎 Analyst, 🧭 Manager, 👑 CISO. Auto mode promotes you after 4 of 5 correct and eases you down when you're struggling.
- **Habit loop:** a small daily goal (5 by default), streaks with freezes, combos and critical-hit XP, a daily Boss question at 3× XP, and a confidence tap (Sure / Think so / Guess) that flags blind spots.
- **Spaced review** (Leitner boxes) brings misses and lucky guesses back.
- Progress is stored in `localStorage`. When the page is opened as a Claude artifact, progress also syncs to your Claude account and **Endless mode** generates fresh AI questions.

Edit `pocket/app.html` (UI) or `pocket/qbank.js` (questions, correct answer listed first), then run:

```bash
npm run build:pocket   # writes public/pocket/index.html
```

## ISTQB CTFL and Performance Testing micro-credential tracks

The track switch in the sidebar (and the phone "More" menu) now has four tracks: **CISSP · CCSK v5 · CTFL v4 · Perf µ**. Each keeps its own progress. Every page (dashboard, quiz, knowledge check, flashcards, mnemonics, mastery, progress, cores, outline, resources) runs on the active track.

**CTFL v4 — ISTQB Certified Tester Foundation Level, syllabus v4.0.1**
- 128 original questions covering all 64 learning objectives, tagged with LO ID and K-level (K1 25 · K2 79 · K3 24). K3 items are worked scenarios like the real exam: equivalence partitions, 2- and 3-value boundary values, decision tables, state transitions, statement/branch coverage, three-point / ratio / extrapolation estimates, prioritization with dependencies, defect reports.
- Every question cites the syllabus section **and the exact page that states the answer**, with a link that opens the PDF on that page (`…Syllabus_v4.0.1.pdf#page=N`). Terminology questions also cite the ISTQB Glossary; ISO/IEC 25010, 20246 and 29119 are cited where the syllabus refers to them.
- Exam simulation built to the official ISTQB Exam Structure and Rules Tables v1.18: 40 questions, 60 minutes, closed book, 26/40 to pass, exactly Ch1 8 · Ch2 6 · Ch3 4 · Ch4 11 · Ch5 9 · Ch6 2 at K1 8 · K2 24 · K3 8, and a different LO for every question wherever the bank allows (the ISTQB distribution rule).
- Outline page: exam facts, the blueprint table, every LO with K-level, section, page link and your accuracy.

**Perf µ — AT*SQA Performance Testing Micro-Credential**
- 45 original questions on the 14 learning objectives of the AT*SQA Performance Testing Body of Knowledge (labelled PT-1.1 … PT-5.2; AT*SQA doesn't number them).
- Every question cites the Body of Knowledge's **footer page** (its printed table of contents is one page lower), and where the ISTQB CT-PT syllabus (2018) goes deeper, its exact page too.
- Exam simulation in the micro-credential format: 10 questions, 20 minutes, open book. AT*SQA doesn't publish a cut score or section split, so the app uses 70% and spreads questions by LO count.

Content lives in `data/istqb/` (`ctfl-outline.ts`, `ctfl-questions-a.ts`, `ctfl-questions-b.ts`, `ptmc.ts`, `index.ts`, `sources.ts`). Rows are append-only; `npm run validate` checks every LO is covered, K-levels match, rationales name the right letter, each question cites a page inside the document, the link opens that page, and the blueprint can be filled.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # TypeScript only
npm run validate   # content checks (options, references, ids)
npm run lint       # ESLint 9 flat config (eslint-config-next 16, React 19 hook rules)
npm run audit:prod # audit only what ships to users
```

Requires **Node 20.9 or newer** (Next.js 16 requirement).

---

## Features

| Area | What you get |
|---|---|
| **Dashboard** (`/dashboard`) | Daily streak 🔥, readiness score (0–100, weighted by official domain weights, accuracy and coverage), domain radar chart, a "Study 10 minutes now" suggestion that targets your weakest domain, and an exam countdown with a recommended questions-per-day pace. |
| **Quiz engine** (`/quiz`, `/quiz/[domain]`) | Five modes: Quick 10 (weighted by domain), domain drills, Timed 25 (30 min), missed-question review, and the full simulation. Shows one question per screen with large tap targets. Keyboard shortcuts: `1`–`4` to choose an answer, `Enter` to submit or go to the next question. In practice mode, an explanation panel appears after each answer. |
| **Review screen** | Score, time per question, per-sub-objective breakdown, a full answer review, and a one-click option to send missed questions to your flashcard deck. |
| **Exam simulation** (`/exam`) | 125 items in a 3-hour countdown. Questions come strictly in order with no skipping and no going back. Difficulty adapts using a staircase method, and items follow the official domain blueprint. You get a scaled score estimate where 700/1000 is a pass. |
| **Memory Gym** (`/flashcards`) | 3D flip cards with swipe gestures (right = Good, left = Again). Again/Hard/Good/Easy buttons schedule reviews with SM-2. Includes domain filters, shuffle, and cram mode, which reviews everything without changing your schedule. Import and export decks as JSON or **Anki-compatible CSV**. |
| **Mnemonics & Mindmaps** (`/mnemonics`) | 35 animated memory-hook cards, plus radial SVG mindmaps for all 8 domains. Each mindmap opens fullscreen. |
| **Progress** (`/progress`) | XP and levels, 12 badges (Domain Conqueror, 7-Day Streak, Mock Exam Slayer…), an accuracy-over-time chart, a study heat calendar, a domain table, and a copyable stat card. |
| **Resources** (`/resources`) | Curated free study aids that open in new tabs. |
| **Settings** (`/settings`) | Exam date, display name, theme, sound, haptics, daily goal, export/import of all progress, and reset. |

Accessibility: designed toward WCAG 2.1 AA. Everything works from the keyboard, focus rings are visible, there's a skip link, the dialogs use ARIA, chart data has text alternatives, and animations respect `prefers-reduced-motion`.
Personal use only: every page is `noindex`, and `robots.txt` disallows all crawlers. `/` is the dashboard; `/dashboard` redirects there.

---

## Content

| | Per domain | Total |
|---|---|---|
| Practice questions | 30 | **240** |
| Flashcards | 60 | **480** |
| Mnemonics | — | 35 |

Every question has four options, a correct answer, and a rationale that explains why the correct option is right **and why each other option is wrong**. Each question also cites **study references**:

1. its ISC2 CISSP Exam Outline objective (e.g. *1.9 Understand and apply risk management concepts*),
2. the matching chapter of the *ISC2 CISSP Official Study Guide*, 10th ed. (Sybex, 2024),
3. one to four free, authoritative sources: NIST SPs/FIPS (current revisions, linked by DOI), IETF RFCs, OWASP cheat sheets, GDPR articles, CISA and industry frameworks.

The references appear under the explanation after you answer and on the review screen. Missed questions you send to flashcards keep them, and the Resources page lists the full reference library. Each one is also tagged with its domain, sub-objective (e.g. `1.9`) and difficulty, and many include a "think like a manager" hint. All questions are original. None come from commercial question banks.

### Extend the question bank — no component changes needed

All content is plain TypeScript data:

```
data/
  references/                         ← study-reference library + objective/question maps
  questions/domain-1.ts … domain-8.ts   ← practice questions
  questions/index.ts                    ← bump QUESTION_BANK_VERSION here
  flashcards/domain-1.ts … domain-8.ts  ← flashcards
  mnemonics.ts  mindmaps.ts  resources.ts
```

Add a question by **appending** a row to a domain file:

```ts
// [subObjective, difficulty, stem, [A, B, C, D], answerIndex, rationale, mindsetHint?]
["1.9", "medium",
  "Which risk response does buying cyber insurance represent?",
  ["Avoidance", "Mitigation", "Transference", "Acceptance"], 2,
  "C is correct: insurance shifts financial impact to a third party. A is wrong: … B is wrong: … D is wrong: …",
  "Accountability can't be transferred — only financial impact."],
```

Rules:

1. **Append only.** IDs are positional (`d1-q031`…), and saved progress refers to them.
2. In rationales, refer to options by their **standalone capital letter** (A, B, C, D). Don't use a standalone capital A–D for anything else.
3. Write the options in any order. The builder moves the correct answer to a deterministic, evenly distributed position and rewrites the letters in your rationale to match. That keeps the answer key from leaning toward "B".

**Study references:** these are attached automatically from `data/references/objectives.ts` (objective, then Study Guide chapter, then default sources). To cite a specific document for one question, add its id to `data/references/questions.ts`:

```ts
"d1-q031": ["nist-800-39"],   // keys come from data/references/library.ts
```

Then run `npm run validate`. It checks that every question cites its outline objective, a Study Guide chapter and at least one authoritative source, and that every reference key and URL is valid.

Add a flashcard by appending `[front, back, mnemonic?]` to `data/flashcards/domain-N.ts`.

Each file is a typed `QRow[]` or `CRow[]` array, so TypeScript catches malformed rows at build time.

The `Question` and `Flashcard` interfaces live in `lib/types.ts` and match the original schema. Per-user SM-2 state is stored separately in `localStorage`, so the seed files stay clean.

---

## Project structure

```
app/                    routes (page.tsx = server component + metadata)
components/
  dashboard/ knowledge/ quiz/ exam/ flashcards/ mnemonics/ progress/ settings/
  ui/                   button, card, dialog (shadcn-style primitives)
lib/
  store.ts              localStorage store (useSyncExternalStore)
  sm2.ts                SuperMemo-2 scheduler
  quiz.ts               weighted sets + adaptive exam engine + scaled score
  stats.ts badges.ts streak.ts level.ts
data/                   all content (see above)
```

To move to a backend later: every write goes through `actions` in `lib/store.ts`. Swap `persist()` and `load()` for Supabase or Vercel KV calls.

## Dependency audit

Don't run `npm audit fix --force`. It upgrades major versions one package at a time (for example Next.js without React and ESLint) and breaks the build. To upgrade, change versions in `package.json` together and run `npm install`.

As of 17 Nov 2026:

- **Production dependencies: 0 vulnerabilities** (`npm run audit:prod`).
- **Full tree: one advisory, [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)**, a ReDoS in `picomatch` that `npm audit` reports as ~20 "high" findings because many packages depend on it.
  - **Why it can't be fixed yet:** the advisory covers every published picomatch release, through 4.0.7, and there's no patched version yet. No `npm audit fix` can clear it.
  - **Why it's low risk here:** it's reached only through build and dev tooling (ESLint's TypeScript resolver, Tailwind 3's file watcher). Picomatch is not in the code that ships to browsers. The vulnerability needs an attacker to supply glob patterns, and this app never accepts them.
  - **What to do:** when a fixed picomatch is published, run `npm update` and re-check with `npm audit`.

**Why ESLint stays on v9:** `npm` reports ESLint 9 as deprecated. But three plugins bundled in `eslint-config-next` 16 (`eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-jsx-a11y`) don't support ESLint 10 yet, even in their latest releases. Upgrade ESLint when those plugins and `eslint-config-next` support it. ESLint is a dev-only tool and never ships to users.

## Disclaimer

This is an independent study tool. It is not affiliated with or endorsed by ISC2. CISSP® is a registered mark of ISC2, Inc. The scaled score is a practice estimate, not ISC2's psychometric model.
