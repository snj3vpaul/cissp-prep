import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, glow, ...props }: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return <div className={cn("glass rounded-3xl p-5 sm:p-6", glow && "glow-border", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("font-display text-base font-semibold tracking-tight", className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-muted/70", className)} />;
}

export function Chip({ className, active, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary/60 bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DomainDot({ color, className }: { color: string; className?: string }) {
  return <span aria-hidden className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", className)} style={{ background: color }} />;
}
