import { toCsv } from "./csv";
import { stripLinks } from "./links";
import type { Entry, Meta } from "./schema";

/**
 * The two published downloads, `dictionary.json` and `dictionary.csv`, regenerated from the entry
 * files. Their shape is the original one the dictionary was first released in; cross-link markup
 * is stripped so the text reads exactly as on the page.
 */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function nullable<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

function proseOrNull(value: string | undefined, headwordOf: (id: string) => string | undefined) {
  return value === undefined ? null : stripLinks(value, headwordOf);
}

export interface CanonicalOptions {
  /** Include the fields added after the first edition (`dates`, `sort_as`). */
  additive?: boolean;
}

export function toCanonicalEntry(
  entry: Entry,
  headwordOf: (id: string) => string | undefined,
  options: CanonicalOptions = {},
): Record<string, Json> {
  const out: Record<string, Json> = {
    term: entry.term,
    id: entry.id,
    pos: entry.pos,
    also: entry.also ?? [],
    pronunciation: nullable(entry.pronunciation),
    domain: entry.domain,
    domains: entry.domains ?? [],
    labels: entry.labels ?? [],
    level: entry.level,
    plain: stripLinks(entry.plain, headwordOf),
    senses: entry.senses.map((sense) => ({
      context: nullable(sense.context),
      definition: stripLinks(sense.definition, headwordOf),
      example: proseOrNull(sense.example, headwordOf),
      labels: sense.labels ?? [],
    })),
    formula_latex: nullable(entry.formula_latex),
    origin: proseOrNull(entry.origin, headwordOf),
    year: nullable(entry.year),
    note: proseOrNull(entry.note, headwordOf),
    see_also: entry.see_also ?? [],
    contrast: entry.contrast ?? [],
    sources: (entry.sources ?? []).map((source) => {
      const out: Record<string, Json> = { t: source.text };
      if (source.url !== undefined) out.u = source.url;
      return out;
    }),
    standards: proseOrNull(entry.standards, headwordOf),
    as_of: nullable(entry.as_of),
  };
  if (options.additive !== false) {
    if (entry.dates !== undefined) out.dates = entry.dates;
    if (entry.sort_as !== undefined) out.sort_as = entry.sort_as;
  }
  return out;
}

export function toDictionaryJson(
  meta: Meta,
  entries: readonly Entry[],
  options: CanonicalOptions = {},
): string {
  const headwords = new Map(entries.map((e) => [e.id, e.term]));
  const headwordOf = (id: string) => headwords.get(id);
  const doc = {
    title: meta.title,
    subtitle: meta.subtitle,
    url: meta.url,
    edition: meta.edition,
    entries: entries.map((entry) => toCanonicalEntry(entry, headwordOf, options)),
  };
  return JSON.stringify(doc, null, 1);
}

export const CSV_COLUMNS = [
  "term",
  "part_of_speech",
  "domain",
  "level",
  "labels",
  "plain",
  "definition",
  "origin",
  "year",
  "see_also",
  "also",
] as const;

export function toDictionaryCsv(entries: readonly Entry[]): string {
  const headwords = new Map(entries.map((e) => [e.id, e.term]));
  const headwordOf = (id: string) => headwords.get(id);
  const rows: string[][] = [[...CSV_COLUMNS]];
  for (const entry of entries) {
    const definition = entry.senses
      .map(
        (sense) =>
          (sense.context ? `${sense.context}: ` : "") + stripLinks(sense.definition, headwordOf),
      )
      .join(" | ");
    rows.push([
      entry.term,
      entry.pos,
      entry.domain,
      entry.level,
      (entry.labels ?? []).join("; "),
      stripLinks(entry.plain, headwordOf),
      definition,
      entry.origin === undefined ? "" : stripLinks(entry.origin, headwordOf),
      entry.year === undefined ? "" : String(entry.year),
      (entry.see_also ?? []).join("; "),
      (entry.also ?? []).join("; "),
    ]);
  }
  return toCsv(rows);
}
