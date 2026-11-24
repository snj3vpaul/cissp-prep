"use client";

import { TRACK_ID } from "@/lib/track";
import { ExamSim } from "@/components/exam/exam-sim";
import { CcskExam } from "@/components/exam/ccsk-exam";

/** CISSP gets the adaptive CAT; CCSK gets its linear, percentage-scored exam. */
export function ExamHome() {
  return TRACK_ID === "ccsk" ? <CcskExam /> : <ExamSim />;
}
