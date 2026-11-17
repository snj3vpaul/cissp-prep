"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, Flame, RotateCcw, Shuffle, Upload, Zap } from "lucide-react";
import type { Flashcard } from "@/lib/types";
import { DOMAINS } from "@/lib/domains";
import { FLASHCARDS } from "@/data/flashcards";
import { actions, useAppState, useHydrated } from "@/lib/store";
import { newCardState, previewIntervals, todayISO, type Grade } from "@/lib/sm2";
import { daysUntil } from "@/lib/stats";
import { shuffle } from "@/lib/quiz";
import { download, exportDeckJson, importDeck, toAnkiCsv } from "@/lib/deck";
import { celebrate, haptic, playSound } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { Card, Chip, Skeleton } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FlipCard } from "@/components/flashcards/flip-card";
import { cn } from "@/lib/utils";

type Mode = "due" | "shuffle" | "cram";
const NEW_PER_SESSION = 20;

const GRADES: { g: Grade; label: string; key: string; cls: string }[] = [
  { g: "again", label: "Again", key: "1", cls: "bg-red-500/15 text-red-600 hover:bg-red-500/25 dark:text-red-400" },
  { g: "hard", label: "Hard", key: "2", cls: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400" },
  { g: "good", label: "Good", key: "3", cls: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400" },
  { g: "easy", label: "Easy", key: "4", cls: "bg-cyan-500/15 text-cyan-700 hover:bg-cyan-500/25 dark:text-cyan-400" },
];

/** Builds a review queue from the latest saved state (client-only: uses localStorage + shuffle). */
function buildQueue(mode: Mode, domains: number[]): Flashcard[] {
  const { cards, customCards } = actions.exportState();
  const deck = [...FLASHCARDS, ...customCards];
  const filtered = domains.length ? deck.filter((c) => domains.includes(c.domain)) : deck;
  if (mode !== "due") return shuffle(filtered);
  const today = todayISO();
  const due = filtered.filter((c) => cards[c.id] && cards[c.id].dueDate <= today).sort((a, b) => cards[a.id].dueDate.localeCompare(cards[b.id].dueDate));
  const fresh = shuffle(filtered.filter((c) => !cards[c.id])).slice(0, NEW_PER_SESSION);
  return [...due, ...fresh];
}

export function MemoryGym() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mx-auto h-[420px] max-w-xl" />
      </div>
    );
  }
  return <Gym />;
}

function Gym() {
  const state = useAppState();
  const reduce = useReducedMotion();
  const [domains, setDomains] = useState<number[]>([]);
  const [mode, setMode] = useState<Mode>("due");
  const [queue, setQueue] = useState<Flashcard[]>(() => buildQueue("due", []));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [exitDir, setExitDir] = useState<1 | -1>(1);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const deck = useMemo(() => [...FLASHCARDS, ...state.customCards], [state.customCards]);
  const filtered = useMemo(() => (domains.length ? deck.filter((c) => domains.includes(c.domain)) : deck), [deck, domains]);
  const today = todayISO();
  const dueCount = filtered.filter((c) => state.cards[c.id] && state.cards[c.id].dueDate <= today).length;
  const newCount = filtered.filter((c) => !state.cards[c.id]).length;
  const examDays = daysUntil(state.settings.examDate);

  const rebuild = (m: Mode = mode, ds: number[] = domains) => {
    setQueue(buildQueue(m, ds));
    setPos(0);
    setFlipped(false);
    setReviewed(0);
  };
  const build = () => rebuild();
  const changeMode = (m: Mode) => {
    setMode(m);
    rebuild(m, domains);
  };
  const changeDomains = (ds: number[]) => {
    setDomains(ds);
    rebuild(mode, ds);
  };

  const card = queue[pos];
  const intervals = card ? previewIntervals(state.cards[card.id] ?? newCardState()) : null;
  const done = pos >= queue.length;

  useEffect(() => {
    if (done && reviewed > 0) celebrate("small");
  }, [done, reviewed]);

  const flip = useCallback(() => {
    setFlipped((f) => !f);
    playSound(state.settings.sound, "flip");
    haptic(state.settings.haptics, 8);
  }, [state.settings.sound, state.settings.haptics]);

  const grade = useCallback(
    (g: Grade) => {
      if (!card || !queue) return;
      setExitDir(g === "again" ? -1 : 1);
      haptic(state.settings.haptics, g === "again" ? [15, 30, 15] : 10);
      if (mode === "cram") {
        // Cram mode never touches the SM-2 schedule; misses come back at the end of the session.
        if (g === "again" || g === "hard") setQueue([...queue, card]);
      } else {
        actions.reviewCard(card.id, g);
        if (g === "again") setQueue([...queue, card]); // relearn in-session
      }
      setReviewed((r) => r + 1);
      setFlipped(false);
      setPos((p) => p + 1);
    },
    [card, queue, mode, state.settings.haptics]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
      if (!card) return;
      if (e.key === " " || e.key === "Enter") {
        if ((e.target as HTMLElement)?.tagName === "BUTTON" && e.key === "Enter") return;
        e.preventDefault();
        flip();
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        grade(GRADES[Number(e.key) - 1].g);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, flipped, flip, grade]);

  const toggleDomain = (id: number) => changeDomains(domains.includes(id) ? domains.filter((x) => x !== id) : [...domains, id]);

  const onImport = async (f: File) => {
    try {
      const text = await f.text();
      const cards = importDeck(text, f.name);
      actions.addCustomCards(cards);
      setImportMsg(`Imported ${cards.length} card${cards.length === 1 ? "" : "s"}.`);
    } catch {
      setImportMsg("Couldn’t read that file. Use a JSON export from this app or a CSV with front,back[,tags].");
    }
  };

  return (
    <div className="pb-20">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 self-start rounded-full bg-muted p-1 text-sm" role="tablist" aria-label="Review mode">
          {(
            [
              ["due", "Due", Flame],
              ["shuffle", "Shuffle all", Shuffle],
              ["cram", "Cram", Zap],
            ] as const
          ).map(([m, label, Icon]) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => changeMode(m)}
              className={cn("relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-medium sm:px-4 transition-colors", mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {mode === m && <motion.span layoutId="gym-mode" className="absolute inset-0 -z-0 rounded-full bg-background shadow" />}
              <Icon className="relative h-4 w-4" aria-hidden />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download /> <span className="hidden sm:inline">Import / export</span><span className="sr-only sm:hidden">Import / export</span>
              </Button>
            </DialogTrigger>
            <DialogContent title="Import & export" description="Back up your deck, move it to Anki, or add your own cards.">
              <div className="space-y-5 text-sm">
                <div>
                  <p className="font-semibold">Export</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" onClick={() => download(`cissp-deck-${today}.json`, exportDeckJson(deck, state.cards), "application/json")}>
                      <Download /> JSON (with progress)
                    </Button>
                    <Button variant="outline" onClick={() => download(`cissp-anki-${today}.csv`, toAnkiCsv(filtered), "text/csv")}>
                      <Download /> Anki CSV{domains.length ? " (filtered)" : ""}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">In Anki: File → Import, choose the CSV, map field 1 → Front, field 2 → Back, field 3 → Tags.</p>
                </div>
                <div>
                  <p className="font-semibold">Import</p>
                  <p className="mt-1 text-xs text-muted-foreground">JSON from this app, or CSV with columns front, back, tags (e.g. “domain3”).</p>
                  <input ref={fileRef} type="file" accept=".json,.csv,text/csv,application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
                  <Button className="mt-2" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload /> Choose file
                  </Button>
                  {importMsg && (
                    <p className="mt-2 text-xs" role="status">
                      {importMsg}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Deck: {FLASHCARDS.length} built-in + {state.customCards.length} custom cards.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by domain">
        <Chip active={!domains.length} onClick={() => changeDomains([])}>
          All domains
        </Chip>
        {DOMAINS.map((d) => (
          <Chip key={d.id} active={domains.includes(d.id)} onClick={() => toggleDomain(d.id)}>
            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} aria-hidden />
            D{d.id} {d.short}
          </Chip>
        ))}
      </div>

      {mode === "cram" && (
        <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <span className="font-semibold">Cram mode</span> runs through every card in your filter without changing your spaced-repetition schedule.
          {examDays !== null && examDays >= 0 && examDays <= 7 ? " Your exam is this week — perfect timing." : " Best used in the final week before the exam."}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {mode === "due" ? `${dueCount} due · ${Math.min(NEW_PER_SESSION, newCount)} new this session` : `${filtered.length} cards`}
        </span>
        <span className="font-mono tabular-nums">
          {Math.min(pos + (done ? 0 : 1), queue.length)} / {queue.length}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" animate={{ width: `${queue.length ? (pos / queue.length) * 100 : 0}%` }} />
      </div>

      {/* Stage */}
      <div className="relative mt-6 min-h-[440px] sm:mt-8">
        <AnimatePresence mode="popLayout" custom={exitDir}>
          {card && !done ? (
            <motion.div
              key={`${card.id}-${pos}`}
              custom={exitDir}
              initial={reduce ? false : { opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: exitDir * 260, rotate: exitDir * 8, transition: { duration: 0.28 } }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              <FlipCard card={card} flipped={flipped} onFlip={flip} onSwipe={(dir) => grade(dir === "right" ? "good" : "again")} />
            </motion.div>
          ) : (
            <motion.div key="done" initial={reduce ? false : { opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card glow className="mx-auto max-w-xl py-14 text-center">
                <p className="text-5xl">{reviewed ? "🏆" : "🌙"}</p>
                <h2 className="mt-4 text-2xl font-bold">{reviewed ? "Set complete!" : "Nothing due right now"}</h2>
                <p className="mt-2 text-muted-foreground">
                  {reviewed ? `${reviewed} reviews logged. Your memory thanks you.` : "Come back later, or switch to Shuffle or Cram to keep training."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button onClick={build}>
                    <RotateCcw /> Go again
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/quiz/quick">Quick 10 quiz</Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grade bar */}
      {card && !done && (
        <div className="mx-auto mt-6 max-w-xl">
          {flipped ? (
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((gr) => (
                <button
                  key={gr.g}
                  onClick={() => grade(gr.g)}
                  className={cn("flex min-h-[60px] flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-all active:scale-95", gr.cls)}
                >
                  {gr.label}
                  <span className="font-mono text-[11px] font-normal opacity-75">{mode === "cram" ? `key ${gr.key}` : intervals?.[gr.g]}</span>
                </button>
              ))}
            </div>
          ) : (
            <Button onClick={flip} size="lg" className="w-full">
              Reveal answer <span className="ml-1 hidden font-mono text-xs opacity-80 sm:inline">(Space)</span>
            </Button>
          )}
          <p className="mt-3 hidden text-center text-xs text-muted-foreground sm:block">Space to flip · 1 Again · 2 Hard · 3 Good · 4 Easy</p>
        </div>
      )}
    </div>
  );
}
