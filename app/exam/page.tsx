import type { Metadata } from "next";
import { ExamHome } from "@/components/exam/exam-home";

export const metadata: Metadata = { title: "Exam simulation" };

export default function ExamPage() {
  return (
    <div className="container pt-8 sm:pt-12">
      <ExamHome />
    </div>
  );
}
