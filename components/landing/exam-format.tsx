import { Clock, ListOrdered, Target, Workflow } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/landing/reveal";
import { EXAM_FORMAT } from "@/lib/domains";

const ITEMS = [
  { icon: ListOrdered, value: `${EXAM_FORMAT.minItems}–${EXAM_FORMAT.maxItems}`, label: "items per exam", note: "Our sim fixes it at 125 so you build stamina." },
  { icon: Clock, value: "3 hours", label: "maximum time", note: "A live countdown keeps your pacing honest." },
  { icon: Target, value: `${EXAM_FORMAT.passingScore}/${EXAM_FORMAT.maxScore}`, label: "passing score", note: "Scaled scoring estimate after every sim." },
  { icon: Workflow, value: "CAT", label: "adaptive format", note: "Answer in order. No skipping, no backtracking." },
];

export function ExamFormat() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="format-heading">
      <div className="container">
        <SectionHeading
          eyebrow="Mirror test day"
          title={<span id="format-heading">Train under real exam conditions</span>}
          sub="The CISSP uses Computerized Adaptive Testing. Our simulation recreates the constraints so nothing on exam day surprises you."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it, i) => (
            <Reveal key={it.label} delay={i * 0.06}>
              <div className="glass h-full rounded-3xl p-6">
                <it.icon className="h-5 w-5 text-cyan-500 dark:text-cyan-300" aria-hidden />
                <p className="mt-4 font-display text-3xl font-bold">{it.value}</p>
                <p className="text-sm font-medium">{it.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{it.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
