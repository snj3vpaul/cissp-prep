import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Set your exam date and theme, toggle sound and haptics, and export, import or reset your progress.",
  robots: { index: false },
};

export default function SettingsPage() {
  return (
    <div className="container">
      <PageHeader eyebrow="Settings" title="Mission parameters" />
      <SettingsView />
    </div>
  );
}
