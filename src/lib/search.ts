import type { SearchEntry, SearchIndex } from "./search-index";

/**
 * The search ranking, shared by the palette and tests. Headword matches beat alias matches, which
 * beat matches inside the plain-words definition; essentials get a small boost over specialist
 * terms so the common word wins a tie.
 */

/** Case, accent, dash and quote insensitive, but punctuation kept so "A*" can match "A* search". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

interface Prepared {
  entry: SearchEntry;
  headword: string;
  aliases: string[];
  body: string;
}

export interface PreparedIndex {
  items: Prepared[];
  byId: Map<string, SearchEntry>;
}

export function prepareIndex(index: SearchIndex): PreparedIndex {
  const items = index.entries.map((entry) => ({
    entry,
    headword: normalize(entry.t),
    aliases: (entry.a ?? []).map(normalize),
    body: normalize(entry.pl),
  }));
  return { items, byId: new Map(index.entries.map((e) => [e.id, e])) };
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  /** The alias that matched, when the headword did not. */
  via: string | null;
}

export const SEARCH_LIMIT = 80;

export function search(index: PreparedIndex, rawQuery: string, limit = SEARCH_LIMIT): SearchHit[] {
  const q = normalize(rawQuery);
  if (!q) return [];
  const words = q.split(" ");
  const hits: (SearchHit & { position: number })[] = [];
  index.items.forEach((item, position) => {
    const { entry, headword, aliases, body } = item;
    let score = 0;
    let via: string | null = null;
    if (headword === q) score = 1000;
    else if (headword.startsWith(q)) score = 800 - Math.min(headword.length - q.length, 60);
    aliases.forEach((alias, k) => {
      const original = entry.a?.[k] ?? alias;
      if (alias === q && score < 950) {
        score = 950;
        via = original;
      } else if (alias.startsWith(q) && score < 700) {
        score = 700 - Math.min(alias.length - q.length, 60);
        via = original;
      } else if (q.length > 2 && alias.indexOf(q) > 0 && score < 380) {
        score = 380;
        via = original;
      }
    });
    if (!score && q.length > 1) {
      const at = headword.indexOf(q);
      if (at > 0) score = 520 - Math.min(at, 40);
      else if (words.length > 1 && words.every((w) => headword.includes(w))) score = 450;
    }
    if (!score && q.length > 2) {
      const at = body.indexOf(q);
      if (at >= 0) score = 120 - Math.min(at / 20, 40);
      else if (words.length > 1 && words.every((w) => w.length < 3 || body.includes(w))) score = 60;
    }
    if (score) hits.push({ entry, score: score + (4 - entry.v) * 6, via, position });
  });
  hits.sort((a, b) => b.score - a.score || a.position - b.position);
  return hits.slice(0, limit).map(({ entry, score, via }) => ({ entry, score, via }));
}

/** Splits `text` around the first match of `query` for highlighting, or returns null. */
export function highlightRange(text: string, rawQuery: string): [string, string, string] | null {
  const q = normalize(rawQuery);
  if (!q) return null;
  const folded = normalize(text);
  if (folded.length !== text.length) return null;
  const at = folded.indexOf(q);
  if (at < 0) return null;
  return [text.slice(0, at), text.slice(at, at + q.length), text.slice(at + q.length)];
}
