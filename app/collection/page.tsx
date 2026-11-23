import type { Metadata } from "next";
import { CollectionView } from "@/components/collection/collection-view";

export const metadata: Metadata = { title: "Cipher cores" };

export default function CollectionPage() {
  return <CollectionView />;
}
