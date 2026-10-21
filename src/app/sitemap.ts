import type { MetadataRoute } from "next";
import { letterPath } from "@/components/az/letters";
import { decadePath } from "@/components/timeline/decades";
import { getDictionary } from "@/lib/dictionary";
import { entryModifiedMonth, monthToDate } from "@/lib/seo";
import { absoluteUrl, domainPath, entryPath } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const dict = getDictionary();
  const edition = monthToDate(dict.meta.datePublished);
  const pages = [
    "/",
    "/contents",
    "/a-z",
    "/timeline",
    "/essentials",
    "/about",
    "/accessibility",
  ].map((p) => ({
    url: absoluteUrl(dict, p),
    lastModified: edition,
  }));
  const letters = [...new Set(dict.azRows.map((r) => r.letter))].map((l) => ({
    url: absoluteUrl(dict, letterPath(l)),
    lastModified: edition,
  }));
  const decades = dict.decades.map((d) => ({
    url: absoluteUrl(dict, decadePath(d)),
    lastModified: edition,
  }));
  const domains = Object.keys(dict.taxonomy.domains).map((d) => ({
    url: absoluteUrl(dict, domainPath(d)),
    lastModified: edition,
  }));
  const entries = dict.entries.map((e) => ({
    url: absoluteUrl(dict, entryPath(e.id)),
    lastModified: monthToDate(entryModifiedMonth(dict, e)),
  }));
  return [...pages, ...letters, ...decades, ...domains, ...entries];
}
