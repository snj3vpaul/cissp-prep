"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { CoreStage } from "@/components/collection/core-stage";
import type { StageMode } from "@/lib/three/core3d";
import { cn } from "@/lib/utils";

interface Props {
  creature: string;
  colorway?: 0 | 1;
  mode?: StageMode;
  locked?: boolean;
  altUnlocked?: boolean;
  className?: string;
}

/** Live WebGL render of a cipher core. Falls back to the SVG art if WebGL isn't available. */
export function Core3D({ creature, colorway = 0, mode = "reveal", locked = false, altUnlocked = false, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stage: { dispose(): void } | undefined;
    let cancelled = false;
    import("@/lib/three/core3d")
      .then(({ CoreStage3D }) => {
        if (cancelled || !ref.current) return;
        const s = new CoreStage3D(ref.current, { creature, colorway, mode, locked, altUnlocked, reduceMotion: !!reduce });
        s.play();
        stage = s;
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      stage?.dispose();
    };
  }, [creature, colorway, mode, locked, altUnlocked, reduce]);

  if (failed) return <CoreStage creature={creature} colorway={colorway} mode={mode} locked={locked} altUnlocked={altUnlocked} className={className} />;
  return <canvas ref={ref} className={cn("block h-full w-full", className)} aria-hidden />;
}

/** Crisp still render for grids and cards; shows the flat art until the 3D render is ready. */
export function CoreThumb({ creature, colorway = 0, locked = false, className, alt }: { creature: string; colorway?: 0 | 1; locked?: boolean; className?: string; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const run = () =>
      import("@/lib/three/core3d")
        .then(({ renderThumb }) => {
          if (live) setUrl(renderThumb(creature, colorway, locked));
        })
        .catch(() => {});
    const id = window.setTimeout(run, 0);
    return () => {
      live = false;
      window.clearTimeout(id);
    };
  }, [creature, colorway, locked]);

  if (!url) return <CoreStage creature={creature} colorway={colorway} locked={locked} className={cn("opacity-60", className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt ?? ""} className={cn("block h-full w-full object-contain", className)} draggable={false} />;
}
