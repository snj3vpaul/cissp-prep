import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE = {
  name: "CISSP Command Center",
  description:
    "A free, local-first CISSP exam prep command center: 240 original practice questions with full rationales, 480 SM-2 flashcards, CAT-style 125-question simulation, mnemonics and progress analytics across all 8 ISC2 domains.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cissp-command-center.vercel.app",
};
