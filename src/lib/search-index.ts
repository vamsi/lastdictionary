import { levelRank } from "./derive";
import type { Dictionary } from "./dictionary";
import { letterOf, sortKey } from "./sort";

/**
 * The compact index the search palette and the A–Z filters download on first use. Short keys keep
 * the file small; `SearchEntry` documents them.
 */
export interface SearchEntry {
  /** Entry id (URL slug). */
  id: string;
  /** Headword. */
  t: string;
  /** Other names. */
  a?: string[];
  /** Part of speech. */
  p: string;
  /** Home domain code. */
  d: string;
  /** Neighboring domain codes. */
  ds?: string[];
  /** Level rank: 1 essential, 2 core, 3 specialist. */
  v: number;
  /** Labels on the entry or any of its senses. */
  l?: string[];
  /** Plain-words definition. */
  pl: string;
  /** A–Z letter the word files under. */
  k: string;
}

export interface SearchIndex {
  version: 1;
  entries: SearchEntry[];
}

export function buildSearchIndex(dict: Dictionary): SearchIndex {
  return {
    version: 1,
    entries: dict.entries.map((e) => {
      const labels = new Set(e.labels ?? []);
      for (const sense of e.senses) for (const l of sense.labels ?? []) labels.add(l);
      const item: SearchEntry = {
        id: e.id,
        t: e.term,
        p: e.pos,
        d: e.domain,
        v: levelRank(dict.taxonomy, e.level),
        pl: e.plain,
        k: letterOf(sortKey(e)),
      };
      if (e.also?.length) item.a = e.also;
      if (e.domains?.length) item.ds = e.domains;
      if (labels.size) item.l = [...labels];
      return item;
    }),
  };
}
