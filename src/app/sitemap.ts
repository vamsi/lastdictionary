import type { MetadataRoute } from "next";
import { letterPath } from "@/components/az/letters";
import { getDictionary } from "@/lib/dictionary";
import { absoluteUrl, domainPath, entryPath } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const dict = getDictionary();
  const built = new Date();
  const pages = ["/", "/contents", "/a-z", "/timeline", "/essentials", "/about"].map((p) => ({
    url: absoluteUrl(dict, p),
    lastModified: built,
  }));
  const domains = Object.keys(dict.taxonomy.domains).map((d) => ({
    url: absoluteUrl(dict, domainPath(d)),
    lastModified: built,
  }));
  const letters = [...new Set(dict.azRows.map((r) => r.letter))].map((l) => ({
    url: absoluteUrl(dict, letterPath(l)),
    lastModified: built,
  }));
  const entries = dict.entries.map((e) => ({
    url: absoluteUrl(dict, entryPath(e.id)),
    lastModified: built,
  }));
  return [...pages, ...letters, ...domains, ...entries];
}
