import { ArrowUpRight, Sparkles } from "lucide-react";
import { NEXT_OUTLINE } from "@/lib/domains";

export function OutlineBanner() {
  return (
    <div className="relative z-50 overflow-hidden border-b border-violet-500/20 bg-gradient-to-r from-violet-600/20 via-cyan-500/10 to-violet-600/20">
      <div className="container flex flex-col items-center justify-center gap-1 py-2 text-center text-xs sm:flex-row sm:gap-3 sm:text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
          New ISC2 exam outline effective {NEXT_OUTLINE.effective} — AI topics woven into all 8 domains
        </span>
        <a
          href={NEXT_OUTLINE.hubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-semibold text-cyan-600 underline-offset-4 hover:underline dark:text-cyan-300"
        >
          View exam outlines <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
