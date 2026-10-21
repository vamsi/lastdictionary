/**
 * One-time migration: split the original dictionary into one YAML file per entry.
 *
 * Sources:
 *  - data/dictionary.json      canonical text of every field
 *  - index.html (x-data)       the compiled site, which alone holds the curated [[id|text]]
 *                              cross-links inside prose and the life dates of people
 * Both come from the repository's first commit (see original.ts); they are no longer in the tree.
 *
 * Every prose field taken from the compiled site is checked to equal the canonical text once the
 * link markup is stripped, and every YAML file is parsed back and compared before it is kept.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { parseEntryYaml, stringifyEntry } from "../../src/lib/entry-io";
import { stripLinks } from "../../src/lib/links";
import { createEntrySchema, type Entry, TaxonomySchema } from "../../src/lib/schema";
import { readOriginal } from "./original";

interface SourceSense {
  context: string | null;
  definition: string;
  example: string | null;
  labels: string[];
}
interface SourceEntry {
  term: string;
  id: string;
  pos: string;
  also: string[];
  pronunciation: string | null;
  domain: string;
  domains: string[];
  labels: string[];
  level: string;
  plain: string;
  senses: SourceSense[];
  formula_latex: string | null;
  origin: string | null;
  year: number | null;
  note: string | null;
  see_also: string[];
  contrast: string[];
  sources: { t: string; u?: string }[];
  standards: string | null;
  as_of: string | null;
}
interface CompiledEntry {
  id: string;
  pl: string;
  s: { d: string; x?: string }[];
  o?: string;
  n?: string;
  sd?: string;
  dt?: string;
}

const ROOT = process.cwd();
const html = readOriginal("index.html");
const xdataMatch = html.match(/<script type="application\/json" id="x-data">([\s\S]*?)<\/script>/);
if (!xdataMatch?.[1]) throw new Error("x-data block not found in index.html");
const compiled = JSON.parse(xdataMatch[1]) as { entries: CompiledEntry[] };
const compiledById = new Map(compiled.entries.map((e) => [e.id, e]));

const source = JSON.parse(readOriginal("data/dictionary.json")) as {
  entries: SourceEntry[];
};
const taxonomy = TaxonomySchema.parse(
  parse(readFileSync(join(ROOT, "data/taxonomy.yaml"), "utf8")),
);
const EntrySchema = createEntrySchema(taxonomy);

/** Editorial filing exceptions; everyone else in `people` files by surname. */
const SORT_AS_OVERRIDES: Record<string, string> = {
  "liang-wenfeng": "Liang Wenfeng",
  "john-von-neumann": "von Neumann John",
  "the-last-dictionary": "Last Dictionary The",
};

function surnameFirst(term: string): string {
  const tokens = term.split(" ");
  const surname = tokens.pop();
  if (!surname) throw new Error(`cannot file ${term}`);
  return [surname, ...tokens].join(" ");
}

/** Prefer the compiled (cross-linked) text when it exists, proving it matches the canonical text. */
function linked(
  id: string,
  field: string,
  canonical: string | null,
  fromCompiled: string | undefined,
) {
  if (canonical === null) {
    if (fromCompiled !== undefined)
      throw new Error(`${id}.${field}: compiled text but no canonical text`);
    return undefined;
  }
  if (fromCompiled === undefined) return canonical;
  if (stripLinks(fromCompiled) !== canonical) {
    throw new Error(
      `${id}.${field}: compiled text differs from canonical text after stripping links`,
    );
  }
  return fromCompiled;
}

function nonEmpty<T>(list: T[]): T[] | undefined {
  return list.length ? list : undefined;
}

function stable(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)),
        )
      : v,
  );
}

function convert(src: SourceEntry): Entry {
  const x = compiledById.get(src.id);
  if (!x) throw new Error(`${src.id}: missing from compiled data`);
  if (x.pl !== src.plain) throw new Error(`${src.id}.plain differs`);
  if (x.s.length !== src.senses.length) throw new Error(`${src.id}: sense count differs`);

  const sortAs =
    SORT_AS_OVERRIDES[src.id] ?? (src.domain === "people" ? surnameFirst(src.term) : undefined);

  const entry: Entry = {
    term: src.term,
    id: src.id,
    sort_as: sortAs,
    pos: src.pos,
    also: nonEmpty(src.also),
    pronunciation: src.pronunciation ?? undefined,
    domain: src.domain,
    domains: nonEmpty(src.domains),
    labels: nonEmpty(src.labels),
    level: src.level,
    dates: x.dt,
    plain: src.plain,
    senses: src.senses.map((sense, k) => {
      const xs = x.s[k];
      return {
        context: sense.context ?? undefined,
        definition: linked(src.id, `senses[${k}].definition`, sense.definition, xs?.d) as string,
        example: linked(src.id, `senses[${k}].example`, sense.example, xs?.x),
        labels: nonEmpty(sense.labels),
      };
    }),
    formula_latex: src.formula_latex ?? undefined,
    origin: linked(src.id, "origin", src.origin, x.o),
    year: src.year ?? undefined,
    note: linked(src.id, "note", src.note, x.n),
    see_also: nonEmpty(src.see_also),
    contrast: nonEmpty(src.contrast),
    sources: nonEmpty(
      src.sources.map((s) => (s.u === undefined ? { text: s.t } : { text: s.t, url: s.u })),
    ),
    standards: linked(src.id, "standards", src.standards, x.sd),
    as_of: src.as_of ?? undefined,
  };
  // Drop undefined keys so the object compares cleanly with what the YAML parses back to.
  for (const key of Object.keys(entry) as (keyof Entry)[]) {
    if (entry[key] === undefined) delete entry[key];
  }
  for (const sense of entry.senses) {
    for (const key of Object.keys(sense) as (keyof typeof sense)[]) {
      if (sense[key] === undefined) delete sense[key];
    }
  }
  return EntrySchema.parse(entry);
}

const outDir = join(ROOT, "data/entries");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

let links = 0;
for (const src of source.entries) {
  const entry = convert(src);
  const text = stringifyEntry(entry);
  const back = EntrySchema.parse(parseEntryYaml(text));
  if (stable(back) !== stable(entry)) {
    writeFileSync(join(ROOT, `.extract-failed-${entry.id}.yaml`), text);
    throw new Error(
      `${entry.id}: YAML round-trip changed the entry (see .extract-failed-${entry.id}.yaml)`,
    );
  }
  links += (text.match(/\[\[/g) ?? []).length;
  writeFileSync(join(outDir, `${entry.id}.yaml`), text);
}

const written = readdirSync(outDir).length;
console.log(`wrote ${written} entry files to data/entries (${links} cross-links carried over)`);
if (written !== source.entries.length) throw new Error("file count differs from entry count");
