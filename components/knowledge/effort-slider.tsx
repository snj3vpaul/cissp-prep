"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Brain, HelpCircle } from "lucide-react";
import { CHECK_LEVELS } from "@/lib/knowledge-check";
import { cn } from "@/lib/utils";

const STOPS = CHECK_LEVELS.length;
const pos = (i: number) => 8 + (i * 84) / (STOPS - 1); // % across the track
const SPAWN = [0.12, 0.35, 0.8, 1.7, 3.6]; // particles per frame by level
const PALETTE = [
  ["#a78bfa", "#ffffff"],
  ["#a78bfa", "#f0abfc", "#ffffff"],
  ["#8b5cf6", "#f472b6", "#ffffff"],
  ["#8b5cf6", "#ec4899", "#f9a8d4", "#ffffff"],
  ["#8b5cf6", "#ec4899", "#22d3ee", "#facc15", "#ffffff"],
];

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  life: number;
  max: number;
  c: string;
}

/** Glowing pixel particles that live inside the filled part of the track. */
function Particles({ level }: { level: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  const reduce = useReducedMotion();

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let W = 0;
    let H = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    const ps: P[] = [];
    const spawn = () => {
      const lv = levelRef.current;
      const fill = (pos(lv) / 100) * W;
      const cols = PALETTE[lv];
      const max = 50 + Math.random() * 70;
      ps.push({
        x: Math.random() * fill,
        y: 4 + Math.random() * (H - 8),
        vx: (Math.random() - 0.35) * (0.25 + lv * 0.18),
        vy: (Math.random() - 0.5) * 0.35,
        s: Math.random() < 0.25 + lv * 0.08 ? 3 : 2,
        life: 0,
        max,
        c: cols[Math.floor(Math.random() * cols.length)],
      });
    };

    const draw = () => {
      const lv = levelRef.current;
      const fill = (pos(lv) / 100) * W;
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        if (p.x > fill) continue;
        const a = Math.sin((p.life / p.max) * Math.PI);
        ctx.globalAlpha = Math.max(0, a) * (0.55 + lv * 0.1);
        ctx.shadowColor = p.c;
        ctx.shadowBlur = 4 + lv * 2;
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    if (reduce) {
      for (let i = 0; i < 12 + level * 14; i++) {
        spawn();
        ps[i].life = ps[i].max / 2;
      }
      draw();
      return () => ro.disconnect();
    }

    let raf = 0;
    let acc = 0;
    const tick = () => {
      acc += SPAWN[levelRef.current];
      while (acc >= 1) {
        spawn();
        acc--;
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.max || p.y < 0 || p.y > H) ps.splice(i, 1);
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // level is read through levelRef; restart only when motion preference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}

export function EffortSlider({ recommended, className, compact = false }: { recommended: number; className?: string; compact?: boolean }) {
  const [level, setLevel] = useState(recommended);
  const [help, setHelp] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();
  const L = CHECK_LEVELS[level];
  const hardPct = Math.round(L.mix.hard * 100);
  const brain = 24 + level * 3;

  return (
    <div className={cn("rounded-[22px] border border-white/[0.08] bg-[#141416] p-5 text-white shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)] sm:p-6", className)}>
      <div className="flex items-center justify-between">
        <p className="flex items-baseline gap-2.5 text-lg">
          <span className="text-white/50">Effort</span>
          <span className="relative inline-block min-w-[5.5rem] font-semibold" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={L.name}
                className="inline-block"
                initial={reduce ? false : { y: 12, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={reduce ? undefined : { y: -12, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.22 }}
              >
                {L.name}
              </motion.span>
            </AnimatePresence>
          </span>
        </p>
        <button
          type="button"
          onClick={() => setHelp((h) => !h)}
          aria-expanded={help}
          aria-controls={`${id}-help`}
          aria-label="What do the effort levels mean?"
          className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      {help && (
        <ul id={`${id}-help`} className="mt-3 space-y-1.5 rounded-xl bg-white/[0.04] p-3 text-[13px] text-white/70">
          {CHECK_LEVELS.map((l, i) => (
            <li key={l.name}>
              <span className="font-semibold text-white">{l.name}</span> · {l.n} questions{l.time ? `, ${Math.round(l.time / 60)} min clock` : ""}
              {i === recommended ? " · recommended for you" : ""}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex justify-between text-[15px] text-white/50">
        <span>Faster</span>
        <span>Smarter</span>
      </div>

      {/* Track */}
      <div className="relative mt-2.5 h-12">
        <div className="absolute inset-0 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04]">
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-300 ease-out"
            style={{
              width: `${pos(level)}%`,
              background: `linear-gradient(90deg, rgba(139,92,246,0.04), rgba(139,92,246,${0.25 + level * 0.08}) 65%, rgba(236,72,153,${0.35 + level * 0.1}))`,
            }}
          />
          <Particles level={level} />
          {CHECK_LEVELS.map((l, i) =>
            i === recommended ? (
              <span key={l.name} aria-hidden className="absolute top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" style={{ left: `${pos(i)}%` }} />
            ) : (
              <span key={l.name} aria-hidden className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" style={{ left: `${pos(i)}%` }} />
            )
          )}
        </div>
        {/* Brain thumb */}
        <span
          aria-hidden
          className={cn("pointer-events-none absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center transition-[left] duration-300 ease-out", level === 4 && !reduce && "animate-galaxy")}
          style={{ left: `${pos(level)}%` }}
        >
          <Brain
            className="text-pink-400 transition-all duration-300"
            style={{ width: brain, height: brain, filter: `drop-shadow(0 0 ${3 + level * 3}px rgba(244,114,182,${0.45 + level * 0.12}))` }}
            strokeWidth={2.4}
          />
        </span>
        <input
          type="range"
          min={0}
          max={STOPS - 1}
          step={1}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          aria-label="Effort"
          aria-valuetext={`${L.name}: ${L.n} questions`}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="relative mt-2 h-6 text-[15px] text-white/50">
        <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${Math.min(84, Math.max(16, pos(recommended)))}%` }}>
          Recommended
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Questions", String(L.n)],
          ["Hard items", `${hardPct}%`],
          ["Clock", L.time ? `${Math.round(L.time / 60)} min` : "Untimed"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white/[0.04] px-2 py-2.5">
            <dt className="text-[11px] text-white/45">{k}</dt>
            <dd className="mt-0.5 font-display text-lg font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      {!compact && <p className="mt-3 text-[13px] text-white/55">{L.blurb}</p>}

      <Link
        href={`/quiz/check?level=${level}`}
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-[#141416] transition-transform hover:scale-[1.01] active:scale-[0.98]"
      >
        Start {L.name.toLowerCase()} check <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
