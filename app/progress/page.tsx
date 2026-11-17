import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProgressView } from "@/components/progress/progress-view";

export const metadata: Metadata = {
  title: "Progress & badges",
  description: "XP, levels, badges, accuracy over time and a study heat calendar for your CISSP preparation.",
};

export default function ProgressPage() {
  return (
    <div className="container">
      <PageHeader eyebrow="Progress" title="Your mission log" sub="Everything is stored locally in this browser." />
      <ProgressView />
    </div>
  );
}
