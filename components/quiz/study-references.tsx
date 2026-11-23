import { ArrowUpRight, BookOpen, FileText, Gavel, Globe, Landmark, ListChecks, ShieldCheck } from "lucide-react";
import type { Reference } from "@/lib/types";
import { outlineRef } from "@/data/references";
import { cn } from "@/lib/utils";

const ICON: Record<Reference["kind"], typeof BookOpen> = {
  outline: ListChecks,
  book: BookOpen,
  nist: Landmark,
  rfc: FileText,
  law: Gavel,
  owasp: ShieldCheck,
  industry: Globe,
};

const LABEL: Record<Reference["kind"], string> = {
  outline: "Exam outline",
  book: "Official Study Guide",
  nist: "NIST",
  rfc: "Standard",
  law: "Law & regulation",
  owasp: "OWASP",
  industry: "Industry",
};

/** "Study references" list shown under every question's rationale. */
export function StudyReferences({ refs, className }: { refs: Reference[]; className?: string }) {
  if (!refs?.length) return null;
  return (
    <section className={cn("rounded-2xl border border-border/70 bg-background/40 p-4", className)} aria-label="Study references">
      <h3 className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" aria-hidden /> Study references
      </h3>
      <ol className="mt-3 space-y-2">
        {refs.map(outlineRef).map((r, i) => {
          const Icon = ICON[r.kind];
          const body = (
            <>
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-500 dark:text-violet-300" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug">{r.title}</span>
                <span className="block text-xs text-muted-foreground">{r.publisher}</span>
                <span className="sr-only">{LABEL[r.kind]}</span>
              </span>
              {r.url && <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />}
            </>
          );
          return (
            <li key={`${r.title}-${i}`}>
              {r.url ? (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-accent/60">
                  {body}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <div className="flex gap-3 px-2 py-1.5">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
