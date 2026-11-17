import type { MetadataRoute } from "next";
import { SITE } from "@/lib/utils";
import { DOMAINS } from "@/lib/domains";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/dashboard", "/quiz", "/exam", "/flashcards", "/mnemonics", "/resources", "/progress"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...DOMAINS.map((d) => ({ url: `${SITE.url}/quiz/${d.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
