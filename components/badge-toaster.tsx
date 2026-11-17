"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getBadge } from "@/lib/badges";
import { celebrate } from "@/lib/feedback";

/** Listens for newly unlocked badges (dispatched by the store) and shows an accessible toast. */
export function BadgeToaster() {
  const [queue, setQueue] = useState<string[]>([]);

  useEffect(() => {
    const on = (e: Event) => {
      const ids = (e as CustomEvent<string[]>).detail;
      setQueue((q) => [...q, ...ids]);
      celebrate("small");
    };
    window.addEventListener("cc:badges", on);
    return () => window.removeEventListener("cc:badges", on);
  }, []);

  useEffect(() => {
    if (!queue.length) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 3800);
    return () => clearTimeout(t);
  }, [queue]);

  const badge = queue[0] ? getBadge(queue[0]) : undefined;

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {badge && (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="glass glow-border pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl"
          >
            <span className="text-2xl" aria-hidden>
              {badge.emoji}
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Badge unlocked · +50 XP</p>
              <p className="font-display font-semibold">{badge.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
