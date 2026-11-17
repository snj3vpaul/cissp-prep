import { cn } from "@/lib/utils";

/** Shield + brain hybrid mark. Left lobe = circuit traces, right lobe = neural folds. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="lm-g" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="lm-f" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" stopOpacity="0.28" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* shield */}
      <path d="M24 3.5 7.5 9.6v12.1c0 10.4 7 18.9 16.5 22.8 9.5-3.9 16.5-12.4 16.5-22.8V9.6L24 3.5Z" fill="url(#lm-f)" stroke="url(#lm-g)" strokeWidth="2.2" strokeLinejoin="round" />
      {/* brain split */}
      <path d="M24 13v22" stroke="url(#lm-g)" strokeWidth="1.8" strokeLinecap="round" />
      {/* right lobe — organic folds */}
      <path d="M24 14.5c3.2-1.6 7.4-.3 8.2 3 2.7.7 3.6 4 1.8 6 1.6 2.3.3 5.6-2.4 6-.6 2.7-4 4-6.6 2.6" stroke="url(#lm-g)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27.5 19.5c1.6.2 2.6 1.4 2.4 3M27 26.5c1.4-.5 2.9 0 3.6 1.2" stroke="url(#lm-g)" strokeWidth="1.5" strokeLinecap="round" />
      {/* left lobe — circuit traces */}
      <path d="M24 17h-4.5l-2.5 2.5M24 23h-7M24 29h-4.5l-2.5-2.5" stroke="url(#lm-g)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.4" cy="20.1" r="1.6" fill="#8B5CF6" />
      <circle cx="16" cy="23" r="1.6" fill="#7C8CF4" />
      <circle cx="16.4" cy="25.9" r="1.6" fill="#22D3EE" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[15px] font-semibold leading-none tracking-tight">
        CISSP <span className="text-gradient">Command Center</span>
      </span>
    </span>
  );
}
