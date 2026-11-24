import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { MnemonicVault } from "@/components/mnemonics/vault";

export const metadata: Metadata = {
  title: "Mnemonics & Mindmap Vault",
};

export default function MnemonicsPage() {
  return (
    <div className="container">
      <PageHeader eyebrow="Mnemonics & Mindmap Vault" title="Hooks that stick under pressure" sub="Tap a card to expand it. Every hook explains how it helps you eliminate wrong answers." />
      <MnemonicVault />
    </div>
  );
}
