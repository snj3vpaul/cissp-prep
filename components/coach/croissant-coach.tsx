"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { KIND_LABEL, QUALIFIER_TIPS, STRATEGY_SOURCE, STRATEGY_TIPS, type StrategyTip } from "@/data/cissp-strategies";
import { useAppState } from "@/lib/store";

const IDX_KEY = "cissp-command-center:croissant-idx";
const SNOOZE_KEY = "cissp-command-center:croissant-snooze";
const INTERVAL_MS = 120_000;

/** Pages where you're studying, so the coach may speak up on its own. */
const STUDY = ["/", "/quiz", "/flashcards", "/mnemonics", "/mastery", "/outline", "/exam", "/progress"];

type Bubble = { title: string; text: string; page: number; kind: "tip" | "qualifier" };

/** Original croissant drawing: five laminated lobes, golden bake, little face. */
export function CroissantArt({ size = 64, blink = false }: { size?: number; blink?: boolean }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 120 86" aria-hidden>
      <defs>
        <linearGradient id="crust" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7C46C" />
          <stop offset="0.55" stopColor="#E39B3B" />
          <stop offset="1" stopColor="#B86A22" />
        </linearGradient>
        <linearGradient id="crust-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8A64E" />
          <stop offset="1" stopColor="#9E5719" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="80" rx="40" ry="4" fill="#000" opacity="0.18" />
      {/* horns */}
      <path d="M8 58 C 4 44, 14 34, 26 36 C 24 46, 22 54, 18 62 C 14 64, 10 63, 8 58 Z" fill="url(#crust-dark)" />
      <path d="M112 58 C 116 44, 106 34, 94 36 C 96 46, 98 54, 102 62 C 106 64, 110 63, 112 58 Z" fill="url(#crust-dark)" />
      {/* side lobes */}
      <path d="M20 62 C 16 42, 26 26, 42 26 C 44 42, 44 56, 40 70 C 32 72, 24 70, 20 62 Z" fill="url(#crust)" />
      <path d="M100 62 C 104 42, 94 26, 78 26 C 76 42, 76 56, 80 70 C 88 72, 96 70, 100 62 Z" fill="url(#crust)" />
      {/* centre lobe */}
      <path d="M38 70 C 34 44, 42 16, 60 14 C 78 16, 86 44, 82 70 C 70 76, 50 76, 38 70 Z" fill="url(#crust)" />
      {/* lamination lines */}
      <path d="M44 30 C 52 26, 68 26, 76 30" stroke="#B86A22" strokeWidth="1.6" fill="none" opacity="0.55" />
      <path d="M41 64 C 52 69, 68 69, 79 64" stroke="#9E5719" strokeWidth="1.6" fill="none" opacity="0.5" />
      <path d="M28 40 C 32 38, 36 38, 40 40" stroke="#B86A22" strokeWidth="1.4" fill="none" opacity="0.5" />
      <path d="M80 40 C 84 38, 88 38, 92 40" stroke="#B86A22" strokeWidth="1.4" fill="none" opacity="0.5" />
      <path d="M50 22 C 56 18, 64 18, 70 22" stroke="#FFF1CF" strokeWidth="2.2" fill="none" opacity="0.7" strokeLinecap="round" />
      {/* face */}
      {blink ? (
        <>
          <path d="M50 46 q3 2 6 0" stroke="#3B1E08" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M64 46 q3 2 6 0" stroke="#3B1E08" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="53" cy="46" r="3" fill="#3B1E08" />
          <circle cx="67" cy="46" r="3" fill="#3B1E08" />
          <circle cx="54" cy="45" r="1" fill="#fff" />
          <circle cx="68" cy="45" r="1" fill="#fff" />
        </>
      )}
      <path d="M55 54 Q60 58 65 54" stroke="#3B1E08" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="46" cy="52" r="3" fill="#FF8A65" opacity="0.45" />
      <circle cx="74" cy="52" r="3" fill="#FF8A65" opacity="0.45" />
    </svg>
  );
}

function readNum(key: string) {
  try {
    return Number(localStorage.getItem(key) ?? "0") || 0;
  } catch {
    return 0;
  }
}
function writeNum(key: string, v: number) {
  try {
    localStorage.setItem(key, String(v));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Floating croissant that keeps the CISSP exam strategies in front of you while you study. It
 * rotates through the playbook every couple of minutes on study pages, reacts to qualifiers
 * (FIRST, BEST, EXCEPT …) in the question on screen, and puts exam-day advice first when your
 * exam is two days away or less. Tap it for a tip any time; "Quiet today" snoozes it until tomorrow.
 */
export function CroissantCoach() {
  const reduce = useReducedMotion();
  const pathname = usePathname() ?? "/";
  const { settings } = useAppState();
  const [bubble, setBubbleRaw] = useState<Bubble | null>(null);
  const [pending, setPending] = useState<Bubble | null>(null);
  const answering = pathname.startsWith("/quiz") || pathname.startsWith("/exam");
  const answeringRef = useRef(answering);
  useEffect(() => {
    answeringRef.current = answering;
  }, [answering]);
  /**
   * On phones the bubble would cover the answer options, so while answering, automatic tips wait
   * as a badge on the croissant until tapped. Tips you ask for always open.
   */
  const setBubble = useCallback((next: Bubble | null | ((b: Bubble | null) => Bubble | null), auto = false) => {
    if (auto && typeof next !== "function" && next && answeringRef.current && window.matchMedia("(max-width: 1023px)").matches) {
      setPending(next);
      return;
    }
    setBubbleRaw(next);
  }, []);
  const [blink, setBlink] = useState(false);
  const inExam = useRef(false);
  const lastQualifier = useRef<string>("");
  const bubbleRef = useRef<Bubble | null>(null);
  useEffect(() => {
    bubbleRef.current = bubble;
  }, [bubble]);
  const studying = STUDY.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));

  const examDate = settings.examDate;
  const nextTip = useCallback((): StrategyTip => {
    const days = examDate ? Math.ceil((new Date(examDate + "T09:00:00").getTime() - Date.now()) / 86_400_000) : null;
    const examSoon = days !== null && days >= 0 && days <= 2;
    const pool = examSoon ? [...STRATEGY_TIPS.filter((t) => t.kind === "examday"), ...STRATEGY_TIPS.filter((t) => t.kind !== "examday")] : STRATEGY_TIPS;
    const i = readNum(IDX_KEY) % pool.length;
    writeNum(IDX_KEY, i + 1);
    return pool[i];
  }, [examDate]);

  const showTip = useCallback(
    (auto = false) => {
      const t = nextTip();
      setBubble({ title: KIND_LABEL[t.kind], text: t.text, page: t.page, kind: "tip" }, auto);
    },
    [nextTip, setBubble]
  );

  const snoozed = () => readNum(SNOOZE_KEY) > Date.now();

  // React to qualifiers in the question on screen.
  useEffect(() => {
    const on = (e: Event) => {
      const { stem, exam } = (e as CustomEvent<{ stem: string; exam?: boolean }>).detail ?? {};
      inExam.current = !!exam;
      const hit = stem ? QUALIFIER_TIPS.find((q) => q.re.test(stem)) : undefined;
      // A qualifier nudge belongs to its question: clear it when the question changes or the session ends.
      if (!hit) {
        lastQualifier.current = "";
        setBubble((b) => (b?.kind === "qualifier" ? null : b));
        setPending((b) => (b?.kind === "qualifier" ? null : b));
        return;
      }
      if (snoozed()) return;
      // Don't repeat the same qualifier on back-to-back questions.
      if (lastQualifier.current === hit.label) return;
      lastQualifier.current = hit.label;
      setBubble({ title: `Qualifier spotted: ${hit.label}`, text: hit.text, page: hit.page, kind: "qualifier" }, true);
    };
    window.addEventListener("coach:question", on);
    return () => window.removeEventListener("coach:question", on);
  }, [setBubble]);

  // Greeting on arriving at a study page, then a rotating tip every couple of minutes.
  useEffect(() => {
    lastQualifier.current = "";
    inExam.current = false;
    if (!studying || snoozed()) return;
    const hello = window.setTimeout(() => {
      if (!document.hidden && !bubbleRef.current) showTip(true);
    }, 2500);
    const every = window.setInterval(() => {
      if (!document.hidden && !snoozed()) showTip(true);
    }, INTERVAL_MS);
    return () => {
      window.clearTimeout(hello);
      window.clearInterval(every);
    };
  }, [pathname, studying, showTip]);

  // Auto-hide: qualifier nudges are brief, especially mid-exam.
  useEffect(() => {
    if (!bubble) return;
    const t = window.setTimeout(() => setBubble(null), bubble.kind === "qualifier" ? (inExam.current ? 7000 : 11000) : 14000);
    return () => window.clearTimeout(t);
  }, [bubble, setBubble]);

  // Blink now and then.
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 160);
    }, 4200);
    return () => window.clearInterval(t);
  }, [reduce]);

  return (
    <div className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-40 flex flex-col items-end gap-2 lg:bottom-6 lg:right-6">
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.text}
            role="status"
            aria-live="polite"
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="pointer-events-auto relative w-[min(19rem,calc(100vw-1.5rem))] rounded-2xl border border-amber-500/30 bg-card p-3.5 pr-8 text-sm shadow-xl"
          >
            <button type="button" onClick={() => setBubble(null)} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Close tip">
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">{bubble.title}</p>
            <p className="mt-1 leading-snug">{bubble.text}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {STRATEGY_SOURCE}, p. {bubble.page}
            </p>
            <div className="mt-2.5 flex gap-2">
              <button type="button" onClick={() => showTip()} className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-500/25 dark:text-amber-300">
                Another tip
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setHours(24, 0, 0, 0);
                  writeNum(SNOOZE_KEY, tomorrow.getTime());
                  setBubble(null);
                }}
                className="rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Quiet today
              </button>
            </div>
            <span className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-amber-500/30 bg-card" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={() => {
          if (bubble) return setBubble(null);
          if (pending) {
            setBubble(pending);
            setPending(null);
            return;
          }
          showTip();
        }}
        className="pointer-events-auto rounded-full p-1 drop-shadow-[0_8px_14px_rgba(184,106,34,.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        animate={reduce ? undefined : { y: [0, -6, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.9 }}
        aria-label={bubble ? "Hide CISSP strategy tip" : pending ? "A CISSP strategy tip is waiting: show it" : "Show a CISSP exam strategy tip"}
        title="CISSP strategy coach"
      >
        <span className="relative block">
          <span className="lg:hidden">
            <CroissantArt size={46} blink={blink} />
          </span>
          <span className="hidden lg:block">
            <CroissantArt size={60} blink={blink} />
          </span>
          {pending && !bubble && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-background" aria-hidden>
              !
            </span>
          )}
        </span>
      </motion.button>
    </div>
  );
}
