import type { Metadata } from "next";
import { QuizHome } from "@/components/quiz/quiz-home";

export const metadata: Metadata = { title: "Quiz modes" };

export default function QuizPage() {
  return <QuizHome />;
}
