import { ImageResponse } from "next/og";
import { OG_SIZE, OgTemplate } from "@/lib/og";

export const alt = "CISSP Command Center — free CISSP exam prep";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgTemplate eyebrow="Free CISSP exam prep" title="Think like a manager. Pass like a pro." sub="Practice questions · SM-2 flashcards · 125-item CAT simulation" />,
    size
  );
}
