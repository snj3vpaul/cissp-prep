import type { Metadata } from "next";
import { MasteryView } from "@/components/mastery/mastery-view";

export const metadata: Metadata = { title: "Mastery" };

export default function MasteryPage() {
  return <MasteryView />;
}
