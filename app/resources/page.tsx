import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { RESOURCES } from "@/data/resources";
import { PageHeader } from "@/components/page-header";
import { QUESTIONS } from "@/data/questions";
import { OSG, REFS } from "@/data/references";
import type { RefKind } from "@/data/references/library";

const KIND_LABEL: Record<RefKind, string> = {
  outline: "Exam outline",
  book: "Books",
  nist: "NIST publications",
  rfc: "Protocol standards (IETF & others)",
  law: "Law & regulation",
  owasp: "OWASP",
  industry: "Industry frameworks & guidance",
};

export const metadata: Metadata = {
  title: "Free CISSP study resources",
  description: "Curated, legitimate free CISSP study aids: ISC2 flash cards and exam outline, ThorTeaches QOTD, Destination Certification mindmaps, Pocket Prep, LearnZapp and r/cissp.",
};

const TAG_STYLE: Record<string, string> = {
  Official: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  Practice: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Mindmaps: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  App: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Community: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
};

export default function ResourcesPage() {
  const citedBy = new Map<string, number>();
  for (const q of QUESTIONS) for (const r of q.references) if (r.key) citedBy.set(r.key, (citedBy.get(r.key) ?? 0) + 1);
  const groups = (["nist", "owasp", "rfc", "law", "industry"] as RefKind[]).map((kind) => ({
    kind,
    items: Object.entries(REFS)
      .filter(([, r]) => r.kind === kind)
      .map(([key, r]) => ({ key, ...r, count: citedBy.get(key) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title)),
  }));
  return (
    <div className="container pb-20">
      <PageHeader
        eyebrow="Resources"
        title="Free study aids worth your time"
        sub="Hand-picked, legitimate resources. We’re not affiliated with any of them — free tiers can change, so check each site for current terms."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group flex h-full flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40"
            >
              <span className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TAG_STYLE[r.tag]}`}>{r.tag}</span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
              </span>
              <span className="mt-4 font-display text-lg font-semibold">{r.name}</span>
              <span className="text-xs text-muted-foreground">{r.org}</span>
              <span className="mt-3 text-sm text-muted-foreground">{r.description}</span>
              <span className="mt-auto pt-4 font-mono text-xs text-muted-foreground">
                {new URL(r.url).hostname.replace("www.", "")}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <section className="mt-16" aria-labelledby="library-heading">
        <h2 id="library-heading" className="text-2xl font-bold">
          Reference library
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Every practice question cites its exam-outline objective, the matching chapter of the {OSG.edition}, and the free authoritative
          sources below. Counts show how many questions cite each source.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {groups.map((g) => (
            <div key={g.kind} className="glass rounded-3xl p-5">
              <h3 className="font-display font-semibold">{KIND_LABEL[g.kind]}</h3>
              <ul className="mt-3 divide-y divide-border/50">
                {g.items.map((r) => (
                  <li key={r.key}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-3 py-2.5 text-sm">
                      <span>
                        <span className="font-medium group-hover:underline">{r.title}</span>
                        <span className="block text-xs text-muted-foreground">{r.publisher}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-xs tabular-nums text-muted-foreground" title={`Cited by ${r.count} questions`}>
                        {r.count}
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="glass rounded-3xl p-5">
            <h3 className="font-display font-semibold">Official Study Guide chapters</h3>
            <p className="mt-1 text-xs text-muted-foreground">{OSG.edition} — chapter titles; check your copy for page numbers.</p>
            <ol className="mt-3 grid gap-1.5 text-sm">
              {Object.entries(OSG.chapters).map(([n, t]) => (
                <li key={n} className="flex gap-2">
                  <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">{n}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
