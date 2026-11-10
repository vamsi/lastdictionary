/**
 * Google Analytics 4: the "lastdictionary.com" property in the "Last Dictionary" Analytics account.
 *
 * Page views need no code here. The web stream's enhanced measurement counts every page load and
 * every client-side navigation ("page changes based on browser history events"), with the new
 * page's title and the previous page as referrer; it also reports scrolls, outbound clicks and
 * file downloads. The site adds only the events typed below.
 *
 * Settings that live in Analytics, not in this repository: enhanced measurement's own site search
 * is off (the search event below replaces it), event data is kept for 14 months, and the
 * search_results and placement parameters are registered as custom dimensions.
 */

export const GA_MEASUREMENT_ID = "G-E0RQBH088C";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type Params = Record<string, string | number>;

interface Events {
  /** A settled look-up in the search dialog. search_results 0 means the word is not in the dictionary yet. */
  search: { search_term: string; search_results: number };
  /** An entry opened from the search dialog: a match ("search_result") or a suggestion shown before typing. */
  select_content: {
    content_type: "search_result" | "search_suggestion";
    content_id: string;
    search_term?: string;
  };
  /** Copy citation, Copy link or Copy entry on an entry page. */
  share: {
    method: "copy_citation" | "copy_link" | "copy_entry";
    content_type: "entry";
    content_id: string;
  };
  star_entry: { content_type: "entry"; content_id: string };
  unstar_entry: { content_type: "entry"; content_id: string };
  /** The Random button, with the entry it opened. */
  random_entry: { content_type: "entry"; content_id: string };
  /** A link to the sponsor; placement is the part of the page it sits in. */
  sponsor_click: { placement: "header" | "footer" | "page"; link_url: string };
  /** Enhanced measurement reports .csv and .txt downloads itself, but not .json. */
  file_download: { file_extension: string; file_name: string; link_url: string; link_text: string };
}

/**
 * Sends an event. Does nothing until the Google tag is installed, which happens only on the
 * production host (see components/site/analytics.tsx), so development, CI and previews send nothing.
 */
export function track<E extends keyof Events>(event: E, params: Events[E]): void {
  window.gtag?.("event", event, params as Params);
}

/** Defines gtag() and the dataLayer it feeds, as the Google tag snippet does. */
export function installGtag(): void {
  const dataLayer = window.dataLayer ?? [];
  window.dataLayer = dataLayer;
  window.gtag = function gtag() {
    // biome-ignore lint/complexity/noArguments: the Google tag reads the arguments object itself; an array copy is ignored
    dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
}

/**
 * The search term as reported: trimmed, single-spaced, lower-cased and cut to 100 characters,
 * Analytics' limit for a parameter value. Returns null for an empty query, and for one that looks
 * like an email address or a phone number: Analytics must not receive personal data.
 */
export function reportableSearchTerm(query: string): string | null {
  const term = query.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 100);
  if (!term) return null;
  if (term.includes("@") || /\d{6,}/.test(term.replace(/[\s().+-]/g, ""))) return null;
  return term;
}
