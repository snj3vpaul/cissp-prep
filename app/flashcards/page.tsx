import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { MemoryGym } from "@/components/flashcards/memory-gym";
import { FLASHCARDS } from "@/data/flashcards";

export const metadata: Metadata = {
  title: "Memory Gym — CISSP flashcards",
  description: "480+ CISSP flashcards with SM-2 spaced repetition, 3D flip cards, swipe gestures, cram mode and Anki-compatible export.",
};

export default function FlashcardsPage() {
  return (
    <div className="container">
      <PageHeader eyebrow="Memory Gym" title="Flashcards that schedule themselves" sub={`${FLASHCARDS.length} cards across 8 domains. SM-2 spaced repetition shows each card right before you'd forget it.`} />
      <MemoryGym />
    </div>
  );
}
