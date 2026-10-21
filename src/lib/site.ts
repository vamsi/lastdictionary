import type { Dictionary } from "./dictionary";
import type { Entry } from "./schema";

/** URL helpers. Entries live at the top level: lastdictionary.com/harness. */
export const entryPath = (id: string) => `/${id}`;
export const domainPath = (code: string) => `/domain/${code}`;

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
