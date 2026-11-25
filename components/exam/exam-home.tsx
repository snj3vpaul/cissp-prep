"use client";

import { TRACK_ID } from "@/lib/track";
import { ExamSim } from "@/components/exam/exam-sim";
import { LinearExam } from "@/components/exam/linear-exam";

/** CISSP gets the adaptive CAT; CCSK, CTFL and the micro-credential get linear, percentage-scored exams. */
export function ExamHome() {
  return TRACK_ID === "cissp" ? <ExamSim /> : <LinearExam />;
}
