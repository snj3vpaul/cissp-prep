"use client";

/** Micro-feedback helpers. All respect user settings and prefers-reduced-motion. */

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export async function celebrate(intensity: "small" | "big" = "big") {
  if (typeof window === "undefined" || reducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#8B5CF6", "#22D3EE", "#A78BFA", "#67E8F9", "#ffffff"];
  if (intensity === "small") {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, colors, disableForReducedMotion: true });
    return;
  }
  const end = Date.now() + 900;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors, disableForReducedMotion: true });
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function haptic(enabled: boolean, pattern: number | number[] = 12) {
  if (!enabled || typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

let ctx: AudioContext | null = null;
/** Tiny synthesized sounds — no audio files to ship. */
export function playSound(enabled: boolean, kind: "flip" | "correct" | "wrong") {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const now = ctx.currentTime;
    const cfg = { flip: [420, 620, 0.08], correct: [660, 990, 0.16], wrong: [260, 180, 0.2] }[kind];
    o.type = kind === "wrong" ? "triangle" : "sine";
    o.frequency.setValueAtTime(cfg[0], now);
    o.frequency.exponentialRampToValueAtTime(cfg[1], now + cfg[2]);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + cfg[2] + 0.05);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + cfg[2] + 0.06);
  } catch {
    /* audio blocked */
  }
}
