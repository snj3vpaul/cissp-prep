/** Animated gradient mesh: three blurred orbs drifting over a fine grid. Pure CSS, respects reduced-motion via globals.css. */
export function MeshBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_40%,transparent_100%)]" />
      <div className="absolute -left-[10%] -top-[20%] h-[620px] w-[620px] animate-mesh-drift rounded-full bg-violet-600/30 blur-[120px] dark:bg-violet-600/35" />
      <div className="absolute -right-[8%] top-[5%] h-[520px] w-[520px] animate-mesh-drift-slow rounded-full bg-cyan-400/25 blur-[120px] dark:bg-cyan-500/25" />
      <div className="absolute bottom-[-25%] left-[30%] h-[480px] w-[680px] animate-mesh-drift rounded-full bg-indigo-500/20 blur-[130px] [animation-delay:-8s]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
