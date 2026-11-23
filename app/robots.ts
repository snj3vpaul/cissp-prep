import type { MetadataRoute } from "next";

/** Personal study tool: keep it out of search engines. */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
