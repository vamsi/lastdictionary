import { linkTargets } from "./links";
import type { Resolver } from "./load";
import type { Entry, Taxonomy } from "./schema";
import { compareKeys, fold, foldWords, letterOf, sortKey } from "./sort";

/**
 * Everything the site shows that is computed from the entries rather than written in them:
 * backlinks, the A–Z index, the decade chart, the essentials list, the word-of-the-day pool.
 */

export const BACKLINK_CAP = 24;

export function levelRank(taxonomy: Taxonomy, level: string): number {
  return Object.keys(taxonomy.levels).indexOf(level) + 1;
}

/** Every prose field of an entry that may carry cross-links. */
export function proseFields(entry: Entry): string[] {
  const out = [entry.plain];
  for (const sense of entry.senses) {
    out.push(sense.definition);
    if (sense.example) out.push(sense.example);
  }
  if (entry.origin) out.push(entry.origin);
  if (entry.note) out.push(entry.note);
  if (entry.standards) out.push(entry.standards);
  return out;
}

/** Ids an entry points at: inline links, see-also and contrast, never itself. */
export function outgoingRefs(entry: Entry, resolver: Resolver): Set<string> {
  const refs = new Set<string>();
  for (const text of proseFields(entry)) for (const id of linkTargets(text)) refs.add(id);
  for (const name of entry.see_also ?? []) {
    const id = resolver.resolve(name);
    if (id) refs.add(id);
  }
  for (const name of entry.contrast ?? []) {
    const id = resolver.resolve(name);
    if (id) refs.add(id);
  }
  refs.delete(entry.id);
  return refs;
}

export function incomingRefs(
  entries: readonly Entry[],
  resolver: Resolver,
): Map<string, Set<string>> {
  const incoming = new Map<string, Set<string>>();
  for (const entry of entries) {
    for (const target of outgoingRefs(entry, resolver)) {
      const set = incoming.get(target) ?? new Set<string>();
      set.add(entry.id);
      incoming.set(target, set);
    }
  }
  return incoming;
}

/** "Mentioned in": referrers ordered by level then headword, capped so the list stays readable. */
export function backlinks(
  entries: readonly Entry[],
  taxonomy: Taxonomy,
  resolver: Resolver,
): Map<string, string[]> {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const order = (id: string) => {
    const e = byId.get(id);
    return e ? ([levelRank(taxonomy, e.level), fold(e.term)] as const) : ([9, id] as const);
  };
  const out = new Map<string, string[]>();
  for (const [target, referrers] of incomingRefs(entries, resolver)) {
    if (!byId.has(target)) continue;
    const sorted = [...referrers].sort((a, b) => {
      const [la, ka] = order(a);
      const [lb, kb] = order(b);
      return la - lb || compareKeys(ka, kb) || compareKeys(a, b);
    });
    out.set(target, sorted.slice(0, BACKLINK_CAP));
  }
  return out;
}

export interface AzRow {
  letter: string;
  /** Text shown in the index: the headword, or an alias in italics. */
  display: string;
  /** The entry this row opens. */
  id: string;
  /** True when the row is an alias pointing at its headword. */
  redirect: boolean;
  key: string;
}

/**
 * The A–Z index: every headword plus every alias that is unambiguous, i.e. not spelled like a
 * headword and not claimed by two different entries.
 */
export function azRows(entries: readonly Entry[]): AzRow[] {
  // Two spellings count as the same name when they differ only in case or in punctuation that
  // stands between words ("hold-out set" and "hold out set"; not "c.ai" and "CAI").
  const sameName = (text: string) => foldWords(text);
  const headwords = new Set(entries.map((e) => e.term.toLowerCase()));
  const aliasOwners = new Map<string, Set<string>>();
  for (const e of entries) {
    for (const alias of e.also ?? []) {
      const name = sameName(alias);
      const owners = aliasOwners.get(name) ?? new Set<string>();
      owners.add(e.id);
      aliasOwners.set(name, owners);
    }
  }
  const rows: AzRow[] = [];
  for (const e of entries) {
    const key = sortKey(e);
    rows.push({ letter: letterOf(key), display: e.term, id: e.id, redirect: false, key });
    for (const alias of e.also ?? []) {
      const name = sameName(alias);
      const k = fold(alias);
      if (!k || headwords.has(alias.toLowerCase()) || (aliasOwners.get(name)?.size ?? 0) > 1)
        continue;
      rows.push({ letter: letterOf(k), display: alias, id: e.id, redirect: true, key: k });
    }
  }
  rows.sort(
    (a, b) =>
      compareKeys(a.key, b.key) ||
      Number(a.redirect) - Number(b.redirect) ||
      compareKeys(a.display, b.display),
  );
  return rows;
}

export interface Decade {
  label: string;
  short: string;
  n: number;
  /** The open-ended "before" bucket at the start. */
  pre?: boolean;
  /** First year of the bucket, used to jump into the timeline. */
  start: number;
}

export const FIRST_DECADE = 1940;

export function decades(entries: readonly Entry[]): Decade[] {
  const years = entries.map((e) => e.year).filter((y): y is number => y !== undefined);
  if (!years.length) return [];
  const max = Math.max(...years);
  const lastDecade = Math.floor(max / 10) * 10;
  const out: Decade[] = [
    {
      label: `Before ${FIRST_DECADE}`,
      short: `<${FIRST_DECADE}`,
      n: years.filter((y) => y < FIRST_DECADE).length,
      pre: true,
      start: Math.min(...years),
    },
  ];
  for (let d = FIRST_DECADE; d <= lastDecade; d += 10) {
    out.push({
      label: `${d}s`,
      short: d === FIRST_DECADE || d === lastDecade ? `${d}s` : `’${String(d).slice(2)}`,
      n: years.filter((y) => y >= d && y < d + 10).length,
      start: d,
    });
  }
  return out;
}

const nf = (n: number) => n.toLocaleString("en-US");

export function decadeNote(entries: readonly Entry[]): string {
  const years = entries.map((e) => e.year).filter((y): y is number => y !== undefined);
  const recent = years.filter((y) => y >= 2015).length;
  const twenties = years.filter((y) => y >= 2020 && y < 2030).length;
  const pct = Math.round((recent / years.length) * 100);
  return `Of the ${nf(years.length)} dated words, ${pct}% first appeared in 2015 or later, and ${nf(twenties)} in the 2020s alone.`;
}

export function yearRange(entries: readonly Entry[]): { min: number; max: number } {
  const years = entries.map((e) => e.year).filter((y): y is number => y !== undefined);
  return { min: Math.min(...years), max: Math.max(...years) };
}

export function domainCounts(entries: readonly Entry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.domain] = (counts[e.domain] ?? 0) + 1;
  return counts;
}

/** Ids of essential-level entries in dictionary order. */
export function essentials(entries: readonly Entry[], taxonomy: Taxonomy): string[] {
  return entries.filter((e) => levelRank(taxonomy, e.level) === 1).map((e) => e.id);
}

/** Essentials ordered by how often the rest of the dictionary refers to them. */
export function essentialsByReference(
  entries: readonly Entry[],
  taxonomy: Taxonomy,
  resolver: Resolver,
): string[] {
  const incoming = incomingRefs(entries, resolver);
  const position = new Map(entries.map((e, i) => [e.id, i]));
  return essentials(entries, taxonomy).sort(
    (a, b) =>
      (incoming.get(b)?.size ?? 0) - (incoming.get(a)?.size ?? 0) ||
      (position.get(a) ?? 0) - (position.get(b) ?? 0),
  );
}

function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * The pool for word of the day and the Random button: essential and core words with a known
 * birth year, in a fixed pseudo-random order so the same day shows the same word everywhere.
 */
export function wordPool(entries: readonly Entry[], taxonomy: Taxonomy): string[] {
  return entries
    .filter((e) => levelRank(taxonomy, e.level) <= 2 && e.year !== undefined)
    .map((e) => e.id)
    .sort((a, b) => fnv1a(a) - fnv1a(b) || compareKeys(a, b));
}

/** The index into the pool for a given UTC day. */
export function poolIndexForDate(pool: readonly string[], date: Date): number {
  const day = Math.floor(date.getTime() / 86_400_000);
  return pool.length ? ((day % pool.length) + pool.length) % pool.length : 0;
}

export interface Family {
  n: number;
  name: string;
  desc: string;
  domains: string[];
  count: number;
}

export function families(entries: readonly Entry[], taxonomy: Taxonomy): Family[] {
  const counts = domainCounts(entries);
  return taxonomy.families.map((f) => ({
    ...f,
    count: f.domains.reduce((sum, d) => sum + (counts[d] ?? 0), 0),
  }));
}

export function familyOfDomain(taxonomy: Taxonomy, domain: string): Taxonomy["families"][number] {
  return (
    taxonomy.families.find((f) => f.domains.includes(domain)) ??
    (taxonomy.families[0] as Taxonomy["families"][number])
  );
}
