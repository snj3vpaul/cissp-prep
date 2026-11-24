"use client";

import { PageHeader } from "@/components/page-header";
import { MemoryGym } from "@/components/flashcards/memory-gym";
import { FLASHCARDS } from "@/data/flashcards";
import { DOMAINS } from "@/lib/domains";
import { TRACK } from "@/lib/track";

export function FlashcardsHome() {
  return (
    <div className="container">
      <PageHeader eyebrow="Memory Gym" title="Flashcards that schedule themselves" sub={`${FLASHCARDS.length} ${TRACK.name} cards across ${DOMAINS.length} domains. SM-2 spaced repetition shows each card right before you'd forget it.`} />
      <MemoryGym />
    </div>
  );
}
