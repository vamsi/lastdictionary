import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { parseEntryYaml } from "./entry-io";
import {
  createEntrySchema,
  type Entry,
  type Meta,
  MetaSchema,
  type Taxonomy,
  TaxonomySchema,
} from "./schema";
import { compareEntries, fold } from "./sort";

/** Reads and validates the source files under `data/`. */

export const DATA_DIR = join(process.cwd(), "data");
export const ENTRIES_DIR = join(DATA_DIR, "entries");

export interface LoadIssue {
  file: string;
  message: string;
}

export interface LoadedData {
  meta: Meta;
  taxonomy: Taxonomy;
  /** All entries in dictionary order. */
  entries: Entry[];
}

export function loadTaxonomy(): Taxonomy {
  return TaxonomySchema.parse(parse(readFileSync(join(DATA_DIR, "taxonomy.yaml"), "utf8")));
}

export function loadMeta(): Meta {
  return MetaSchema.parse(parse(readFileSync(join(DATA_DIR, "meta.yaml"), "utf8")));
}

export function listEntryFiles(): string[] {
  return readdirSync(ENTRIES_DIR)
    .filter((f) => f.endsWith(".yaml"))
    .sort();
}

/** Parse every entry file, collecting problems instead of throwing so a report can list them all. */
export function loadEntries(taxonomy: Taxonomy): { entries: Entry[]; issues: LoadIssue[] } {
  const schema = createEntrySchema(taxonomy);
  const entries: Entry[] = [];
  const issues: LoadIssue[] = [];
  for (const file of listEntryFiles()) {
    const text = readFileSync(join(ENTRIES_DIR, file), "utf8");
    let raw: unknown;
    try {
      raw = parseEntryYaml(text);
    } catch (error) {
      issues.push({ file, message: `not valid YAML: ${(error as Error).message}` });
      continue;
    }
    const result = schema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push({ file, message: `${issue.path.join(".") || "(root)"}: ${issue.message}` });
      }
      continue;
    }
    if (`${result.data.id}.yaml` !== file) {
      issues.push({ file, message: `file name must be "${result.data.id}.yaml" to match its id` });
    }
    entries.push(result.data);
  }
  entries.sort(compareEntries);
  return { entries, issues };
}

/** Load everything, throwing with a readable report if any file is invalid. */
export function loadData(): LoadedData {
  const taxonomy = loadTaxonomy();
  const meta = loadMeta();
  const { entries, issues } = loadEntries(taxonomy);
  if (issues.length) {
    const lines = issues.slice(0, 40).map((i) => `  ${i.file}: ${i.message}`);
    if (issues.length > 40) lines.push(`  … and ${issues.length - 40} more`);
    throw new Error(`Invalid entry files:\n${lines.join("\n")}`);
  }
  return { meta, taxonomy, entries };
}

/**
 * Resolves the names used in `see_also` and `contrast` (headwords or aliases, in any case) to
 * entry ids. Exact headwords win over folded matches; folded headwords win over aliases.
 */
export interface Resolver {
  resolve(name: string): string | undefined;
  /** Alias spellings shared by more than one entry, which resolve to the first in dictionary order. */
  ambiguousAliases: Map<string, string[]>;
}

export function createResolver(entries: readonly Entry[]): Resolver {
  const exact = new Map<string, string>();
  const folded = new Map<string, string>();
  const aliases = new Map<string, string[]>();
  for (const entry of entries) {
    exact.set(entry.term.toLowerCase(), entry.id);
    if (!folded.has(fold(entry.term))) folded.set(fold(entry.term), entry.id);
  }
  for (const entry of entries) {
    for (const alias of entry.also ?? []) {
      const key = fold(alias);
      const list = aliases.get(key) ?? [];
      list.push(entry.id);
      aliases.set(key, list);
    }
  }
  const ambiguousAliases = new Map([...aliases].filter(([, ids]) => ids.length > 1));
  return {
    resolve(name) {
      return (
        exact.get(name.toLowerCase()) ?? folded.get(fold(name)) ?? aliases.get(fold(name))?.[0]
      );
    },
    ambiguousAliases,
  };
}
