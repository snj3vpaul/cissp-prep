"use client";

import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Spring-animated gradient progress ring. */
export function ProgressRing({ value, size = 120, stroke = 10, label, className, children }: Props) {
  const id = useId();
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 16 });
  const offset = useTransform(spring, (v) => c - (v / 100) * c);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      mv.jump(value);
      spring.jump(value);
      return;
    }
    mv.set(value);
    const ctl = animate(0, value, { duration: 1.2, ease: "easeOut", onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => ctl.stop();
  }, [value, reduce, mv, spring]);

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={label ?? `${value}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-muted" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset, filter: "drop-shadow(0 0 6px rgba(139,92,246,.55))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children ?? <span className="font-display text-2xl font-bold tabular-nums">{reduce ? value : display}%</span>}
      </div>
    </div>
  );
}
