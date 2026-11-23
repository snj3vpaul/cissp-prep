import type { Metadata } from "next";
import { OutlineView } from "@/components/outline/outline-view";

export const metadata: Metadata = { title: "Exam outline" };

export default function OutlinePage() {
  return <OutlineView />;
}
