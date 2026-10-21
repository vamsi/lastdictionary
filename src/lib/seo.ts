import type { Dictionary } from "./dictionary";
import type { Entry } from "./schema";

/** Titles and descriptions as search engines and answer engines read them. */

export const DESCRIPTION_MAX = 160;

/** Trims text for a meta description: whole sentences when possible, else at a word, never mid-word. */
export function metaDescription(text: string, max = DESCRIPTION_MAX): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const head = t.slice(0, max);
  const sentenceEnd = Math.max(
    head.lastIndexOf(". "),
    head.lastIndexOf("? "),
    head.lastIndexOf("! "),
  );
  if (sentenceEnd >= max * 0.5) return head.slice(0, sentenceEnd + 1);
  const cut = head.slice(0, max - 1).lastIndexOf(" ");
  return `${head.slice(0, cut > 0 ? cut : max - 1).replace(/[,;:\s]+$/, "")}…`;
}

/** The length of " · The Last Dictionary", which the layout appends to every title. */
export const TITLE_SUFFIX = 22;
/** Google shows roughly this many characters of a title before cutting it. */
export const TITLE_BUDGET = 60;

/** The page title for an entry: what it is, in the words people search with, short enough to show whole. */
export function entryTitle(entry: Entry): string {
  if (entry.domain === "people") return entry.dates ? `${entry.term} (${entry.dates})` : entry.term;
  if (entry.domain === "orgs")
    return entry.year !== undefined ? `${entry.term} (founded ${entry.year})` : entry.term;
  const long = entry.origin ? `${entry.term}: definition and origin` : `${entry.term}: definition`;
  if (long.length + TITLE_SUFFIX <= TITLE_BUDGET) return long;
  const short = `${entry.term}: definition`;
  return short.length + TITLE_SUFFIX <= TITLE_BUDGET ? short : entry.term;
}

/** ISO 8601 month the entry's facts were last checked, falling back to the edition. */
export function entryModifiedMonth(dict: Dictionary, entry: Entry): string {
  return entry.as_of ?? dict.meta.datePublished;
}

/** A full date for sitemaps, which need at least YYYY-MM-DD. */
export const monthToDate = (month: string) => `${month}-01`;

/** The `title` metadata for an entry: with the site name appended when that still fits a snippet. */
export function entryTitleMetadata(entry: Entry): string | { absolute: string } {
  const title = entryTitle(entry);
  return title.length + TITLE_SUFFIX <= TITLE_BUDGET ? title : { absolute: title };
}
