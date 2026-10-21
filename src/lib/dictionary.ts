import {
  type AzRow,
  azRows,
  backlinks,
  decadeNote,
  decades,
  domainCounts,
  essentials,
  essentialsByReference,
  families,
  wordPool,
  yearRange,
} from "./derive";
import { createResolver, type LoadedData, loadData, type Resolver } from "./load";
import type { Entry, Meta, Taxonomy } from "./schema";

/**
 * The whole dictionary, loaded and derived once per process. Pages and scripts call
 * `getDictionary()`; nothing here touches the network or the request.
 */
export interface Dictionary {
  meta: Meta;
  taxonomy: Taxonomy;
  entries: Entry[];
  byId: Map<string, Entry>;
  position: Map<string, number>;
  resolver: Resolver;
  backlinks: Map<string, string[]>;
  azRows: AzRow[];
  decades: ReturnType<typeof decades>;
  decadeNote: string;
  years: { min: number; max: number };
  domainCounts: Record<string, number>;
  families: ReturnType<typeof families>;
  essentials: string[];
  essentialsByReference: string[];
  pool: string[];
}

export function buildDictionary(data: LoadedData): Dictionary {
  const { meta, taxonomy, entries } = data;
  const resolver = createResolver(entries);
  return {
    meta,
    taxonomy,
    entries,
    byId: new Map(entries.map((e) => [e.id, e])),
    position: new Map(entries.map((e, i) => [e.id, i])),
    resolver,
    backlinks: backlinks(entries, taxonomy, resolver),
    azRows: azRows(entries),
    decades: decades(entries),
    decadeNote: decadeNote(entries),
    years: yearRange(entries),
    domainCounts: domainCounts(entries),
    families: families(entries, taxonomy),
    essentials: essentials(entries, taxonomy),
    essentialsByReference: essentialsByReference(entries, taxonomy, resolver),
    pool: wordPool(entries, taxonomy),
  };
}

let cached: Dictionary | undefined;

export function getDictionary(): Dictionary {
  cached ??= buildDictionary(loadData());
  return cached;
}
