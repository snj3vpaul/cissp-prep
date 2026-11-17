import type { Metadata } from "next";
import { ExamSim } from "@/components/exam/exam-sim";

export const metadata: Metadata = {
  title: "Full CISSP exam simulation",
  description: "A free 125-item, 3-hour CAT-style CISSP simulation: in order, no skipping, no backtracking, adaptive difficulty and a scaled score estimate.",
};

export default function ExamPage() {
  return (
    <div className="container pt-8 sm:pt-12">
      <ExamSim />
    </div>
  );
}
