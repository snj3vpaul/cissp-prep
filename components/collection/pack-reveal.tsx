"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { Core3D } from "@/components/collection/core3d";
import { CREATURE, type Grant } from "@/lib/collection";
import { getDomain } from "@/lib/domains";
import { cn } from "@/lib/utils";

type Rarity = "common" | "rare" | "legendary";
const RARITY: Record<Rarity, { label: string; rays: string; confetti: number; notes: number[] }> = {
  common: { label: "Common", rays: "rgba(235,240,255,0.55)", confetti: 70, notes: [523, 659, 784] },
  rare: { label: "Rare colourway", rays: "rgba(255,206,92,0.7)", confetti: 150, notes: [523, 659, 784, 1046] },
  legendary: { label: "Legendary", rays: "rainbow", confetti: 280, notes: [392, 523, 659, 784, 1046, 1318] },
};
const HOLD_MS = 1200;
const SOUND_KEY = "cissp-command-center:sound";

/* ---------------------------------------------------------------- sound (WebAudio, no files) */

function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const chargeRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "off";
    } catch {
      return true;
    }
  });
  const ctx = useCallback(() => {
    if (!on) return null;
    try {
      ctxRef.current ??= new AudioContext();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, [on]);

  const startCharge = () => {
    const c = ctx();
    if (!c) return;
    const osc = c.createOscillator();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + HOLD_MS / 1000);
    filter.type = "lowpass";
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.15);
    osc.connect(filter).connect(gain).connect(c.destination);
    osc.start();
    chargeRef.current = { osc, gain };
  };
  const stopCharge = () => {
    const c = ctxRef.current;
    const ch = chargeRef.current;
    if (!c || !ch) return;
    ch.gain.gain.cancelScheduledValues(c.currentTime);
    ch.gain.gain.setTargetAtTime(0.0001, c.currentTime, 0.05);
    ch.osc.stop(c.currentTime + 0.3);
    chargeRef.current = null;
  };
  const burst = (notes: number[]) => {
    const c = ctx();
    if (!c) return;
    const t0 = c.currentTime;
    // pop: a falling sine
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.setValueAtTime(900, t0);
    o.frequency.exponentialRampToValueAtTime(90, t0 + 0.28);
    g.gain.setValueAtTime(0.18, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + 0.35);
    // chime arpeggio, longer for rarer pulls
    notes.forEach((f, i) => {
      const n = c.createOscillator();
      const ng = c.createGain();
      n.type = "triangle";
      n.frequency.value = f;
      const s = t0 + 0.18 + i * 0.09;
      ng.gain.setValueAtTime(0.0001, s);
      ng.gain.exponentialRampToValueAtTime(0.09, s + 0.02);
      ng.gain.exponentialRampToValueAtTime(0.0001, s + 0.9);
      n.connect(ng).connect(c.destination);
      n.start(s);
      n.stop(s + 1);
    });
  };
  const toggle = () =>
    setOn((v) => {
      try {
        localStorage.setItem(SOUND_KEY, v ? "off" : "on");
      } catch {
        /* ignore */
      }
      return !v;
    });
  return { on, toggle, startCharge, stopCharge, burst };
}

/* ---------------------------------------------------------------- backdrop */

function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    const stars = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.3, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() }));
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
    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = reduce ? 0.7 : 0.35 + 0.65 * Math.abs(Math.sin(s.p + t * 0.0008 * s.s));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#e9efe6";
        ctx.beginPath();
        ctx.arc(s.x * W, ((s.y + (reduce ? 0 : t * 0.000004 * s.s)) % 1) * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}

function Platform({ color }: { color: string }) {
  return (
    <svg viewBox="-400 -110 800 220" className="pointer-events-none absolute bottom-[-40px] left-1/2 w-[min(1000px,140vw)] -translate-x-1/2" aria-hidden>
      {[100, 160, 220, 290, 360].map((rx, i) => (
        <ellipse
          key={rx}
          rx={rx}
          ry={rx * 0.26}
          fill="none"
          stroke={i % 2 ? color : "#8a7cff"}
          strokeOpacity={0.5 - i * 0.07}
          strokeWidth={i === 0 ? 2 : 1.2}
          strokeDasharray={i % 2 ? "40 18 6 18" : "2 10"}
          className="pack-orbit"
          style={{ animationDuration: `${30 + i * 12}s`, animationDirection: i % 2 ? "reverse" : "normal" }}
        />
      ))}
      <ellipse rx="70" ry="18" fill={color} opacity="0.18" />
    </svg>
  );
}

/* ---------------------------------------------------------------- card */

function CardBack({ accent, rarity, domain }: { accent: string; rarity: Rarity; domain: string }) {
  return (
    <div className="absolute inset-0 rounded-[22px] border-[10px] border-[#ece6da] bg-[#0f1113] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] [backface-visibility:hidden]">
      <div className="absolute inset-0 overflow-hidden rounded-[12px]" style={{ background: `repeating-linear-gradient(135deg, ${accent}2e 0 7px, transparent 7px 16px), radial-gradient(120% 80% at 50% 40%, ${accent}33, transparent 70%)` }}>
        <div className="pack-sheen absolute inset-0" />
        <div className="absolute inset-0 grid place-items-center">
          <p className="text-center font-display text-[44px] font-semibold leading-[0.9] tracking-tight text-[#ece6da]">
            cipher
            <br />
            core<span style={{ color: accent }}>.</span>
          </p>
        </div>
        <p className="absolute inset-x-0 bottom-5 text-center font-mono text-[10px] tracking-[0.25em] text-[#ece6da]/70">
          SERIES 01 · {domain.toUpperCase()} · {RARITY[rarity].label.split(" ")[0].toUpperCase()}
        </p>
      </div>
    </div>
  );
}

function CardFront({ grant, open }: { grant: Grant; open: boolean }) {
  const c = CREATURE[grant.creature];
  const cw = c.colorways[grant.colorway];
  return (
    <div className="absolute inset-0 rounded-[22px] border-[10px] border-[#ece6da] bg-[#0f1113] [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <div className="absolute inset-0 overflow-hidden rounded-[12px]" style={{ background: `radial-gradient(90% 60% at 50% 42%, ${cw.body}66, transparent 70%), #0f1113` }}>
        <div className="absolute inset-x-0 top-2 h-[78%]">{open && <Core3D creature={grant.creature} colorway={grant.colorway} mode="reveal" />}</div>
        <div className="absolute inset-x-0 bottom-4 text-center">
          <p className="font-display text-xl font-semibold text-[#ece6da]">{c.name}</p>
          <p className="font-mono text-[10px] tracking-[0.2em]" style={{ color: cw.accent === "#1b1b22" ? cw.body : cw.accent }}>
            {cw.name.toUpperCase()} · {c.domain ? `D${c.domain}` : "LEGENDARY"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- reveal */

export function PackReveal({
  grant,
  pull,
  pulls,
  name,
  onNext,
  onDone,
}: {
  grant: Grant;
  pull: number;
  pulls: number;
  name?: string;
  onNext: () => void;
  onDone: () => void;
}) {
  const reduce = useReducedMotion();
  const sound = useSound();
  const c = CREATURE[grant.creature];
  const cw = c.colorways[grant.colorway];
  const rarity: Rarity = c.domain === null ? "legendary" : grant.colorway === 1 ? "rare" : "common";
  const R = RARITY[rarity];
  const domain = c.domain ? getDomain(c.domain).short : "Legendary";

  const [phase, setPhase] = useState<"sealed" | "open">("sealed");
  const [progress, setProgress] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<{ start: number; raf: number } | null>(null);

  const open = useCallback(() => {
    setPhase("open");
    setProgress(1);
    sound.stopCharge();
    sound.burst(R.notes);
    const colors = rarity === "legendary" ? ["#ff5e5e", "#ffb84d", "#ffe45c", "#5ee38a", "#4dc3ff", "#8a7cff", "#f472b6"] : [cw.body, cw.accent, "#ece6da", rarity === "rare" ? "#ffce5c" : "#ffffff"];
    const fire = (ratio: number, opts: confetti.Options) => confetti({ ...opts, particleCount: Math.round(R.confetti * ratio), origin: { y: 0.45 }, colors, zIndex: 80, disableForReducedMotion: true });
    fire(0.35, { spread: 30, startVelocity: 55 });
    fire(0.3, { spread: 70 });
    fire(0.35, { spread: 110, decay: 0.91, scalar: 0.9 });
    if (rarity === "legendary") window.setTimeout(() => fire(0.5, { spread: 160, startVelocity: 35 }), 450);
  }, [R, cw, rarity, sound]);

  const startHold = () => {
    if (phase !== "sealed" || holdRef.current) return;
    sound.startCharge();
    const start = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        holdRef.current = null;
        open();
        return;
      }
      holdRef.current = { start, raf: requestAnimationFrame(tick) };
    };
    holdRef.current = { start, raf: requestAnimationFrame(tick) };
  };
  const endHold = () => {
    if (!holdRef.current) return;
    cancelAnimationFrame(holdRef.current.raf);
    holdRef.current = null;
    sound.stopCharge();
    setProgress(0);
  };

  // Tilt the card toward the pointer.
  const onMove = (e: React.PointerEvent) => {
    if (reduce || !cardRef.current) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    cardRef.current.style.setProperty("--ry", `${x * 22}deg`);
    cardRef.current.style.setProperty("--rx", `${-y * 16}deg`);
    cardRef.current.style.setProperty("--sheen", `${50 + x * 60}%`);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onDone();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onDone]);
  useEffect(
    () => () => {
      if (holdRef.current) cancelAnimationFrame(holdRef.current.raf);
    },
    []
  );

  const charging = phase === "sealed" && progress > 0;
  const isOpen = phase === "open";
  const ring = 2 * Math.PI * 26;

  return (
    <div role="dialog" aria-modal="true" aria-label={`Core pull ${pull} of ${pulls}`} className="fixed inset-0 z-[70] overflow-hidden bg-[#07090b] text-[#ece6da]" onPointerMove={onMove}>
      <Starfield />
      {/* rainbow halo */}
      <div className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 [mask-image:linear-gradient(to_bottom,#000_35%,transparent_70%)]" aria-hidden>
        <div
          className={cn("h-[min(130vmin,1100px)] w-[min(130vmin,1100px)] rounded-full blur-[6px] transition-opacity duration-700", isOpen ? "opacity-80" : "opacity-35")}
          style={{
            background: "conic-gradient(from 270deg, #ff5e5e, #ffb84d, #ffe45c, #5ee38a, #4dc3ff, #8a7cff, #f472b6, #ff5e5e)",
            WebkitMaskImage: "radial-gradient(closest-side, transparent 86%, #000 88%, #000 93%, transparent 95%)",
            maskImage: "radial-gradient(closest-side, transparent 86%, #000 88%, #000 93%, transparent 95%)",
          }}
        />
      </div>
      {/* rarity light rays */}
      <div
        className={cn("pointer-events-none absolute left-1/2 top-[44%] h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 transition-all duration-700", isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0", !reduce && "pack-rays")}
        style={{
          background:
            R.rays === "rainbow"
              ? "repeating-conic-gradient(from 0deg, rgba(255,94,94,.35) 0 3deg, transparent 3deg 9deg, rgba(77,195,255,.35) 9deg 12deg, transparent 12deg 18deg, rgba(255,228,92,.35) 18deg 21deg, transparent 21deg 27deg)"
              : `repeating-conic-gradient(from 0deg, ${R.rays} 0 3deg, transparent 3deg 14deg)`,
          WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 38%)",
          maskImage: "radial-gradient(circle, #000 0%, transparent 38%)",
        }}
        aria-hidden
      />
      <Platform color={cw.accent === "#1b1b22" ? cw.body : cw.accent} />

      <button type="button" onClick={sound.toggle} aria-pressed={sound.on} className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] hover:border-white/40">
        SOUND {sound.on ? "ON" : "OFF"}
      </button>
      <button type="button" onClick={onDone} className="absolute left-4 top-4 z-10 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-white/50 hover:text-white">
        CLOSE
      </button>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 pb-24">
        {/* card */}
        <div className="[perspective:1200px]">
          <div
            ref={cardRef}
            className={cn("relative h-[min(60vh,420px)] w-[min(68vw,300px)] transition-transform duration-[900ms] [transform-style:preserve-3d]", charging && progress > 0.55 && !reduce && "pack-shake")}
            style={{
              transform: `rotateX(var(--rx,0deg)) rotateY(calc(var(--ry,0deg) + ${isOpen ? 180 : 0}deg)) scale(${1 + progress * 0.05})`,
              filter: charging ? `drop-shadow(0 0 ${8 + progress * 40}px ${cw.accent === "#1b1b22" ? cw.body : cw.accent})` : undefined,
              transitionTimingFunction: "cubic-bezier(.2,1.25,.35,1)",
            }}
          >
            <CardBack accent={cw.accent === "#1b1b22" ? cw.body : cw.accent} rarity={rarity} domain={domain} />
            <CardFront grant={grant} open={isOpen} />
          </div>
        </div>
      </div>

      {/* footer copy + actions */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center px-4 text-center">
        {isOpen ? (
          <>
            <p className="font-mono text-[10px] tracking-[0.25em] text-amber-300">
              {pull} OF {pulls} {pulls === 1 ? "PULL" : "PULLS"} · {R.label.toUpperCase()}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-snug">
              Nice work{name ? `, ${name}` : ""}. {grant.source} opened this core.
              <br />
              {c.name} joins the collection.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => { setPhase("sealed"); setProgress(0); }} className="rounded-full border border-white/25 px-4 py-2 font-mono text-[11px] tracking-[0.18em] hover:border-white/50">
                OPEN IT AGAIN
              </button>
              <Link href="/collection" onClick={onDone} className="rounded-full border border-white/25 px-4 py-2 font-mono text-[11px] tracking-[0.18em] hover:border-white/50">
                COLLECTION
              </Link>
              <button type="button" autoFocus onClick={pull < pulls ? onNext : onDone} className="rounded-full bg-[#ece6da] px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.18em] text-black">
                {pull < pulls ? `NEXT PULL (${pulls - pull})` : "DONE"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/60">
              {pull} OF {pulls} {pulls === 1 ? "PULL" : "PULLS"}
            </p>
            <button
              type="button"
              autoFocus
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && (e.preventDefault(), startHold())}
              onKeyUp={(e) => (e.key === " " || e.key === "Enter") && endHold()}
              onContextMenu={(e) => e.preventDefault()}
              className="relative mt-3 grid h-16 w-16 touch-none select-none place-items-center rounded-full bg-white/5"
              aria-label="Hold to open the core"
            >
              <svg viewBox="0 0 60 60" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
                <circle cx="30" cy="30" r="26" fill="none" stroke="#ece6da" strokeWidth="3" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - progress)} />
              </svg>
              <span className="h-3 w-3 rounded-full bg-[#ece6da]" style={{ transform: `scale(${1 + progress})` }} />
            </button>
            <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-white/70">HOLD TO OPEN</p>
          </>
        )}
      </div>
    </div>
  );
}
