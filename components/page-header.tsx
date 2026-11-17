export function PageHeader({ eyebrow, title, sub, children }: { eyebrow?: string; title: React.ReactNode; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 pb-5 pt-6 sm:flex-row sm:items-end sm:justify-between sm:pt-12">
      <div>
        {eyebrow && <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">{eyebrow}</p>}
        <h1 className="mt-2 text-2xl font-bold sm:text-4xl">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
