import { ImageResponse } from "next/og";
import { OG_SIZE, OgTemplate } from "@/lib/og";
import { DOMAINS, getDomainBySlug } from "@/lib/domains";

export const alt = "CISSP domain practice";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.slug }));
}

export default async function Image({ params }: { params: Promise<{ domain: string }> }) {
  const d = getDomainBySlug((await params).domain);
  return new ImageResponse(
    d ? (
      <OgTemplate eyebrow={`Domain ${d.id} · ${d.weight}% of the exam`} title={d.name} sub={`${d.tagline} — original practice questions with rationales`} accent={d.color} />
    ) : (
      <OgTemplate eyebrow="Quiz" title="CISSP practice quiz" sub="Original questions with manager-mindset rationales" />
    ),
    size
  );
}
