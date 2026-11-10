import type { Dictionary } from "./dictionary";
import type { Entry } from "./schema";

/** URL helpers. Entries live at the top level: lastdictionary.com/harness. */
/** The positioning line: used in the home title, the social card and the structured data. */
export const TAGLINE = "The dictionary of intelligence";

/** The name as the masthead sets it. The formal title, "The Last Dictionary", stays in the data, titles and citations. */
export const WORDMARK = "Last Dictionary";

/** The sponsor, shown in the masthead, the footer, the About page and the structured data. */
export const SPONSOR = {
  name: "Plane",
  url: "https://plane.so/",
  tagline: "The work infrastructure for humans and agents",
  pillars: ["Projects", "Knowledge", "Service"],
  /** The tagline as it reads mid-sentence. */
  blurb: "the work infrastructure for humans and agents: Projects, Knowledge and Service",
} as const;

export const entryPath = (id: string) => `/${id}`;
export const domainPath = (code: string) => `/domain/${code}`;

/** First-edition section anchors and the pages that replaced them. */
const LEGACY_SECTIONS: Record<string, string> = {
  about: "/about",
  guide: "/about",
  contents: "/contents",
  domains: "/contents",
  index: "/a-z",
  timeline: "/timeline",
  essentials: "/essentials",
};

/**
 * The first edition lived at lastdictionary.com/#word. The page an old link's fragment (with or
 * without the "#") now points to, or null when it needs no redirect.
 */
export function legacyHashPath(hash: string): string | null {
  let key: string;
  try {
    key = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return null;
  }
  if (!key || key === "home") return null;
  const section = LEGACY_SECTIONS[key];
  if (section) return section;
  if (key.startsWith("domain-")) return domainPath(key.slice(7));
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key) ? entryPath(key) : null;
}

export function absoluteUrl(dict: Dictionary, path: string): string {
  return new URL(path, dict.meta.url).toString();
}

/** The citation offered by "Copy citation" on every entry. */
export function citation(dict: Dictionary, entry: Entry): string {
  const n = dict.meta.editionNumber;
  const ordinal = n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
  const host = dict.meta.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `${dict.meta.title}, ${ordinal} ed. (${dict.meta.editionDate}), s.v. “${entry.term},” ${host}${entryPath(entry.id)}.`;
}
