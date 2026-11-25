"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { eventText, position, type RaceState } from "@/lib/race";
import { cn } from "@/lib/utils";

const HIDE_KEY = "cissp-command-center:race-hidden";
const ROAD = "M372 214 C 372 150, 318 128, 360 84 S 452 22, 478 -26";
const PAPAYA = "#FF8000";

/** Top-down open-wheel car pointing up, centred on the origin. Original drawing. */
function Car({ color, you }: { color: string; you?: boolean }) {
  const dark = "#121214";
  return (
    <g>
      <ellipse cx="0" cy="2" rx="9" ry="19" fill="#000" opacity="0.35" />
      <rect x="-10" y="-17" width="20" height="4" rx="1.5" fill={color} />
      <rect x="-9" y="-11" width="5" height="8" rx="1.5" fill={dark} />
      <rect x="4" y="-11" width="5" height="8" rx="1.5" fill={dark} />
      <rect x="-9.5" y="6" width="5.5" height="9" rx="1.5" fill={dark} />
      <rect x="4" y="6" width="5.5" height="9" rx="1.5" fill={dark} />
      <path d="M-2 -16 L2 -16 L4.5 2 L6 12 L-6 12 L-4.5 2 Z" fill={color} />
      <path d="M-5 -1 L5 -1 L6.5 9 L-6.5 9 Z" fill={color} opacity="0.85" />
      <circle cx="0" cy="-2" r="2.6" fill={dark} />
      <path d="M-3.2 -3.5 Q0 -7 3.2 -3.5" stroke={you ? "#fff" : "#888"} strokeWidth="1" fill="none" />
      <rect x="-9" y="14" width="18" height="3.5" rx="1" fill={you ? "#1a1a1a" : "#444"} />
    </g>
  );
}

/** A car that rides the road path at fraction `t` with a lateral offset (for side-by-side passes). */
function PathCar({ path, t, lat, color, you }: { path: SVGPathElement | null; t: MotionValue<number>; lat: MotionValue<number>; color: string; you?: boolean }) {
  const place = (tv: number, lv: number) => {
    if (!path) return { x: -100, y: -100, a: 0 };
    const L = path.getTotalLength();
    const p = path.getPointAtLength(Math.max(0, Math.min(1, tv)) * L);
    const q = path.getPointAtLength(Math.max(0, Math.min(1, tv + 0.01)) * L);
    const a = Math.atan2(q.y - p.y, q.x - p.x);
    return { x: p.x - Math.sin(a) * lv, y: p.y + Math.cos(a) * lv, a: (a * 180) / Math.PI + 90 };
  };
  const transform = useTransform([t, lat], ([tv, lv]: number[]) => {
    const { x, y, a } = place(tv, lv);
    return `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})`;
  });
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    const set = (v: string) => ref.current?.setAttribute("transform", v);
    set(transform.get());
    return transform.on("change", set);
  }, [transform, path]);
  return (
    <g ref={ref} transform="translate(-100 -100)">
      <Car color={color} you={you} />
    </g>
  );
}

export function useRaceHidden() {
  // Pages render only after hydration, so reading storage in the initializer is safe.
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const toggle = () =>
    setHidden((h) => {
      try {
        localStorage.setItem(HIDE_KEY, h ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !h;
    });
  return [hidden, toggle] as const;
}

/**
 * Live race strip shown above the current question. Every correct answer overtakes the car
 * ahead; the strip animates the pass and updates P-position, the gain chip and lap speed.
 */
export function RaceStrip({ race, lap, className }: { race: RaceState; lap?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [hidden, toggle] = useRaceHidden();
  const pathRef = useRef<SVGPathElement>(null);
  const [path, setPath] = useState<SVGPathElement | null>(null);
  useLayoutEffect(() => setPath(pathRef.current), [hidden]);

  const pos = position(race);
  const i = race.order.indexOf(race.you);
  const ahead = i > 0 ? race.order[i - 1] : null;
  const behind = i < race.order.length - 1 ? race.order[i + 1] : null;
  const delta = race.startPos - pos;
  const e = race.event;

  // positions along the road (0 = bottom, 1 = top)
  const tYou = useMotionValue(0.52);
  const latYou = useMotionValue(0);
  const tAhead = useMotionValue(0.74);
  const latAhead = useMotionValue(0);
  const tBehind = useMotionValue(0.2);
  const latBehind = useMotionValue(0);
  const trail = useTransform(tYou, (v) => (path ? -(v * path.getTotalLength() - 70) : 0));

  useEffect(() => {
    const opts = { duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] as const };
    if (e.kind === "overtake") {
      // the car you passed starts alongside-ahead and drops back behind; the next rival appears up the road
      tBehind.set(0.7);
      latBehind.set(-12);
      latYou.set(12);
      tYou.set(0.5);
      tAhead.set(1.15);
      animate(tBehind, 0.2, opts);
      animate(latBehind, 0, opts);
      animate(latYou, 0, opts);
      animate(tYou, [0.5, 0.6, 0.52], { ...opts, duration: reduce ? 0 : 1.1 });
      animate(tAhead, 0.74, { ...opts, duration: reduce ? 0 : 1.2 });
    } else if (e.kind === "overtaken" || e.kind === "lost-lead") {
      tAhead.set(0.3);
      latAhead.set(12);
      latYou.set(-12);
      animate(tAhead, 0.74, opts);
      animate(latAhead, 0, opts);
      animate(latYou, 0, opts);
      tBehind.set(0.0);
      animate(tBehind, 0.2, opts);
    } else if (e.kind === "lockup") {
      animate(tYou, [0.52, 0.46, 0.5], { duration: reduce ? 0 : 0.7 });
      animate(latYou, [0, -5, 4, 0], { duration: reduce ? 0 : 0.5 });
      animate(tBehind, [0.2, 0.32, 0.28], { duration: reduce ? 0 : 0.8 });
    } else if (e.kind === "extend") {
      animate(tYou, [0.52, 0.56, 0.52], { duration: reduce ? 0 : 0.8 });
    }
  }, [race.lap, e.kind, reduce, tYou, latYou, tAhead, latAhead, tBehind, latBehind]);

  if (hidden) {
    return (
      <button type="button" onClick={toggle} className={cn("mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground", className)}>
        <Eye className="h-3.5 w-3.5" aria-hidden /> Show race · P{pos}
      </button>
    );
  }

  const chip =
    pos === 1 && race.gap > 0
      ? { text: `+${race.gap.toFixed(1)}s`, cls: "bg-[#0f2e1a] text-[#38d26b]" }
      : delta > 0
        ? { text: `▲${delta}`, cls: "bg-[#0f2e1a] text-[#38d26b]" }
        : delta < 0
          ? { text: `▼${-delta}`, cls: "bg-[#3a1212] text-[#ff5c5c]" }
          : { text: "—", cls: "bg-white/10 text-white/60" };

  return (
    <div className={cn("relative mt-3 overflow-hidden rounded-[28px] bg-black text-white shadow-[0_10px_40px_-12px_rgba(0,0,0,.6)] ring-1 ring-white/10", className)} aria-label="Race tracker">
      <svg viewBox="0 0 760 186" className="block h-[150px] w-full sm:h-[176px]" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="race-vignette" cx="50%" cy="55%" r="65%">
            <stop offset="0%" stopColor="#1c1c20" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <linearGradient id="race-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
            <stop offset="18%" stopColor="#000" stopOpacity="0" />
            <stop offset="80%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect width="760" height="186" fill="url(#race-vignette)" />
        <path d={ROAD} stroke="#55565c" strokeWidth="96" fill="none" strokeDasharray="12 12" />
        <path d={ROAD} stroke="#d9d9de" strokeWidth="80" fill="none" />
        <path d={ROAD} stroke="#2a2a2f" strokeWidth="74" fill="none" />
        <path ref={pathRef} d={ROAD} stroke="none" fill="none" />
        {path && (
          <motion.path d={ROAD} stroke={PAPAYA} strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.75" strokeDasharray={`70 ${path.getTotalLength()}`} style={{ strokeDashoffset: trail }} />
        )}
        {behind && <PathCar path={path} t={tBehind} lat={latBehind} color="#e8e8ea" />}
        {ahead && <PathCar path={path} t={tAhead} lat={latAhead} color="#e8e8ea" />}
        <PathCar path={path} t={tYou} lat={latYou} color={PAPAYA} you />
        <rect width="760" height="186" fill="url(#race-fade)" />
      </svg>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-5 top-3.5 flex items-center justify-between sm:inset-x-7 sm:top-4">
        <p className="flex items-center gap-2 text-[15px] font-semibold sm:text-lg">
          <span className="grid h-6 min-w-6 place-items-center rounded-md px-1 text-sm font-bold text-black" style={{ background: PAPAYA }}>
            {pos}
          </span>
          {race.you}
          <span className="text-sm font-normal text-white/60">
            • Lap {lap ?? Math.min(race.lap + 1, race.totalLaps)}
            <span className="hidden sm:inline">/{race.totalLaps}</span>
          </span>
        </p>
        <p className="flex items-center gap-2">
          <span className="text-lg font-bold sm:text-2xl">P{pos}</span>
          <span className={cn("rounded-lg px-2 py-0.5 text-sm font-bold tabular-nums", chip.cls)}>{chip.text}</span>
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-5 flex items-baseline gap-1.5 sm:bottom-4 sm:left-7">
        <span className="text-2xl font-bold tabular-nums sm:text-3xl">{race.lap ? race.speed : 0}</span>
        <span className="text-sm text-white/60">km/h</span>
      </div>
      <div className="pointer-events-none absolute bottom-3.5 right-12 max-w-[45%] text-right text-[11px] leading-tight text-white/60 sm:bottom-4 sm:right-14 sm:text-xs">
        {ahead ? (
          <>
            Next: <span className="font-semibold text-white">{ahead}</span>
          </>
        ) : (
          <span className="font-semibold" style={{ color: PAPAYA }}>
            Leading
          </span>
        )}
        <span className="block">{race.order.length} cars · from P{race.startPos}</span>
      </div>
      <button type="button" onClick={toggle} className="absolute bottom-3 right-4 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 sm:bottom-4" aria-label="Hide race tracker">
        <EyeOff className="h-3.5 w-3.5" aria-hidden />
      </button>
      <p className="sr-only" aria-live="polite">
        {race.lap ? eventText(race) : ""}
      </p>
      {race.lap > 0 && (
        <motion.p
          key={race.lap}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -4] }}
          transition={{ duration: 2.4, times: [0, 0.12, 0.8, 1] }}
          className="pointer-events-none absolute left-1/2 top-[50%] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur sm:top-[44%] sm:px-3 sm:py-1 sm:text-xs"
          style={{ color: e.kind === "overtake" || e.kind === "extend" ? PAPAYA : e.kind === "lockup" ? "#ffd166" : "#ff5c5c" }}
          aria-hidden
        >
          {e.kind === "overtake" ? `OVERTAKE · ${e.passed}` : e.kind === "extend" ? `GAP +${e.gap.toFixed(1)}s` : e.kind === "lockup" ? (e.warn ? "LOCK-UP · DRS BEHIND" : "LOCK-UP") : e.kind === "overtaken" ? `PASSED BY ${e.by}` : e.kind === "lost-lead" ? `${e.by} LEADS` : ""}
        </motion.p>
      )}
    </div>
  );
}
