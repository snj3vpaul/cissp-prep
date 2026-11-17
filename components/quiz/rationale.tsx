import { cn } from "@/lib/utils";

/** Splits "B is correct: … A is wrong: … C …" into scannable lines, highlighting the option letters. */
export function Rationale({ text, answerIndex, className }: { text: string; answerIndex: number; className?: string }) {
  // Option labels are standalone capitals A–D (authoring rule), so split before any sentence that starts with one.
  const parts = text.split(/(?<=[.!?])\s+(?=[A-D](?:,? (?:and )?[A-D])* [a-z])/);
  const letter = "ABCD"[answerIndex];
  return (
    <ul className={cn("space-y-2 text-sm leading-relaxed", className)}>
      {parts.map((p, i) => {
        const m = p.match(/^((?:[A-D](?:,? (?:and )?[A-D])*))\b/);
        const isCorrect = m && m[1] === letter;
        return (
          <li key={i} className={cn("rounded-xl px-3 py-2", isCorrect ? "bg-emerald-500/10" : "bg-muted/40")}>
            {m ? (
              <>
                <span className={cn("mr-1 font-mono text-xs font-bold", isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>{m[1]}</span>
                {p.slice(m[1].length)}
              </>
            ) : (
              p
            )}
          </li>
        );
      })}
    </ul>
  );
}
