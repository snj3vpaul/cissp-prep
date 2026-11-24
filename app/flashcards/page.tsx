import type { Metadata } from "next";
import { FlashcardsHome } from "@/components/flashcards/flashcards-home";

export const metadata: Metadata = { title: "Memory Gym" };

export default function FlashcardsPage() {
  return <FlashcardsHome />;
}
