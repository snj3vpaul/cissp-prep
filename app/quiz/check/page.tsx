import type { Metadata } from "next";
import { Suspense } from "react";
import { KnowledgeCheck } from "@/components/knowledge/knowledge-check";

export const metadata: Metadata = { title: "Knowledge check" };

export default function KnowledgeCheckPage() {
  return (
    <div className="container pt-4 pb-16">
      <Suspense>
        <KnowledgeCheck />
      </Suspense>
    </div>
  );
}
