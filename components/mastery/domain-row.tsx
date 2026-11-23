import Link from "next/link";
import type { masteryModel } from "@/lib/mastery";
import { cn } from "@/lib/utils";

type Row = ReturnType<typeof masteryModel>["domains"][number];

/** "01  Identity  LV 4  ──●──────  68%" — index, name, level, slider-style meter, coloured percent. */
export function DomainRow({ row, active, onActive, compact = false }: { row: Row; active?: boolean; onActive?: (on: boolean) => void; compact?: boolean }) {
  const { domain: d, mastery, level, attempted } = row;
  return (
    <Link
      href={`/quiz/${d.slug}`}
      onMouseEnter={() => onActive?.(true)}
      onMouseLeave={() => onActive?.(false)}
      onFocus={() => onActive?.(true)}
      onBlur={() => onActive?.(false)}
      className={cn("grid items-center gap-3 rounded-xl px-2 transition-colors hover:bg-muted/70", compact ? "h-10 grid-cols-[18px_minmax(0,1fr)_34px_64px_38px]" : "h-12 grid-cols-[22px_minmax(0,1fr)_40px_minmax(0,1.3fr)_52px]", active && "bg-muted/70")}
    >
      <span className="text-[11px] tabular-nums" style={{ color: d.color }}>
        {String(d.id).padStart(2, "0")}
      </span>
      <span className={cn("truncate", compact ? "text-sm" : "text-[17px]")}>{d.short}</span>
      <span className="text-[10px] tabular-nums text-muted-foreground">LV {level}</span>
      <span className="relative h-3" aria-hidden>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[repeating-linear-gradient(90deg,hsl(var(--border))_0_1px,transparent_1px_12%)]" />
        <span className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full transition-[width] duration-700" style={{ width: `${mastery}%`, background: `linear-gradient(90deg, ${d.color}22, ${d.color})` }} />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background transition-[left] duration-700"
          style={{ left: `${Math.max(2, mastery)}%`, borderColor: d.color, boxShadow: `0 0 0 3px ${d.color}26` }}
        />
      </span>
      <span className={cn("text-right tabular-nums", compact ? "text-xs" : "text-[17px]")} style={{ color: attempted ? d.color : undefined }}>
        {attempted ? `${mastery}%` : "—"}
      </span>
    </Link>
  );
}
