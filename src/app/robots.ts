import type { MetadataRoute } from "next";
import { getDictionary } from "@/lib/dictionary";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const dict = getDictionary();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl(dict, "/sitemap.xml"),
  };
}
