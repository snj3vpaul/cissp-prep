import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your CISSP readiness score, domain radar, study streak, exam countdown and next best study session.",
};

export default function DashboardPage() {
  return (
    <div className="container pt-8 sm:pt-12">
      <Dashboard />
    </div>
  );
}
