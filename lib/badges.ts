import type { AppState } from "@/lib/types";
import { DOMAINS } from "@/lib/domains";
import { computeStreak } from "@/lib/streak";

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  test: (s: AppState) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: "first-blood", name: "First Contact", description: "Answer your first question", emoji: "🎯", test: (s) => s.attempts.length >= 1 },
  { id: "century", name: "Centurion", description: "Answer 100 questions", emoji: "💯", test: (s) => s.attempts.length >= 100 },
  { id: "five-hundred", name: "Question Machine", description: "Answer 500 questions", emoji: "⚙️", test: (s) => s.attempts.length >= 500 },
  { id: "streak-3", name: "Warming Up", description: "3-day study streak", emoji: "🔥", test: (s) => computeStreak(s.studyDays).best >= 3 },
  { id: "streak-7", name: "7-Day Streak", description: "Study 7 days in a row", emoji: "📅", test: (s) => computeStreak(s.studyDays).best >= 7 },
  { id: "streak-30", name: "Iron Discipline", description: "30-day study streak", emoji: "🛡️", test: (s) => computeStreak(s.studyDays).best >= 30 },
  {
    id: "domain-conqueror",
    name: "Domain Conqueror",
    description: "Score 90%+ on a domain drill of 10+ questions",
    emoji: "🏆",
    test: (s) => s.sessions.some((x) => x.mode === "domain" && x.total >= 10 && x.correct / x.total >= 0.9),
  },
  {
    id: "all-domains",
    name: "Full Spectrum",
    description: "Answer at least 10 questions in every domain",
    emoji: "🌈",
    test: (s) => DOMAINS.every((d) => s.attempts.filter((a) => a.domain === d.id).length >= 10),
  },
  { id: "mock-finisher", name: "Marathoner", description: "Finish a full exam simulation", emoji: "🏃", test: (s) => s.sessions.some((x) => x.mode === "exam") },
  { id: "mock-slayer", name: "Mock Exam Slayer", description: "Pass a full 125-question simulation", emoji: "⚔️", test: (s) => s.sessions.some((x) => x.mode === "exam" && x.passed) },
  { id: "card-50", name: "Memory Athlete", description: "Review 50 flashcards", emoji: "🧠", test: (s) => Object.keys(s.cards).length >= 50 },
  { id: "perfect-10", name: "Flawless", description: "Score 10/10 on a Quick 10", emoji: "✨", test: (s) => s.sessions.some((x) => x.mode === "quick" && x.total === 10 && x.correct === 10) },
];

export function evaluateBadges(s: AppState): string[] {
  return BADGES.filter((b) => !s.badges[b.id] && b.test(s)).map((b) => b.id);
}

export const getBadge = (id: string) => BADGES.find((b) => b.id === id);
