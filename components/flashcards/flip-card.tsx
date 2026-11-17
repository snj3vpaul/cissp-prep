"use client";

import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import type { Flashcard } from "@/lib/types";
import { DOMAINS } from "@/lib/domains";
import { DomainDot } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
  onSwipe: (dir: "left" | "right") => void;
}

/** 3D-flip card with spring physics; swipe left (Again) / right (Good) once revealed. */
export function FlipCard({ card, flipped, onFlip, onSwipe }: Props) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const goodOpacity = useTransform(x, [30, 140], [0, 1]);
  const againOpacity = useTransform(x, [-140, -30], [1, 0]);
  const d = DOMAINS[card.domain - 1];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 120 || info.velocity.x > 600) onSwipe("right");
    else if (info.offset.x < -120 || info.velocity.x < -600) onSwipe("left");
  };

  const face = "absolute inset-0 flex flex-col rounded-[28px] border p-6 sm:p-8 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

  return (
    <motion.div
      style={{ x, rotate }}
      drag={flipped ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      className="relative mx-auto h-[min(62vh,440px)] w-full max-w-xl touch-pan-y [perspective:1400px]"
    >
      {/* swipe hints */}
      <motion.span style={{ opacity: goodOpacity }} className="pointer-events-none absolute right-5 top-5 z-10 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
        GOOD
      </motion.span>
      <motion.span style={{ opacity: againOpacity }} className="pointer-events-none absolute left-5 top-5 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
        AGAIN
      </motion.span>

      <motion.button
        type="button"
        onClick={onFlip}
        aria-label={flipped ? "Show front of card" : "Reveal answer"}
        aria-pressed={flipped}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 17, mass: 0.9 }}
        className="relative h-full w-full cursor-pointer text-left [transform-style:preserve-3d]"
      >
        {/* front */}
        <div className={cn(face, "glow-border border-violet-500/30 bg-gradient-to-br from-violet-600/25 via-card to-indigo-900/30 shadow-2xl shadow-violet-950/30")}>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <DomainDot color={d.color} /> Domain {d.id} · {d.short}
          </span>
          <div className="flex flex-1 items-center justify-center overflow-auto py-4">
            <p className={cn("text-center font-display font-semibold leading-snug", card.front.length > 120 ? "text-lg" : card.front.length > 50 ? "text-2xl" : "text-3xl sm:text-4xl")}>{card.front}</p>
          </div>
          <span className="text-center text-xs text-muted-foreground">Tap or press Space to flip</span>
        </div>

        {/* back */}
        <div className={cn(face, "border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-card to-sky-900/30 shadow-2xl shadow-cyan-950/30 [transform:rotateY(180deg)]")}>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{card.front.length > 60 ? "Answer" : card.front}</span>
          <div className="flex flex-1 flex-col justify-center gap-4 overflow-auto py-4">
            <p className={cn("whitespace-pre-line leading-relaxed", card.back.length > 300 ? "text-sm" : "text-base sm:text-lg")}>{card.back}</p>
            {card.mnemonic && (
              <p className="rounded-2xl border-l-2 border-violet-400 bg-violet-500/10 px-4 py-2.5 text-sm">
                <span className="font-semibold">🧠 Hook: </span>
                {card.mnemonic}
              </p>
            )}
          </div>
          <span className="text-center text-xs text-muted-foreground sm:hidden">Swipe → Good · ← Again</span>
        </div>
      </motion.button>
    </motion.div>
  );
}
