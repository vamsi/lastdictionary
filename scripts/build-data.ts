/**
 * Generates everything derived from `data/` that the site serves as files:
 *   public/data/dictionary.json   the full dictionary (original shape, cross-link markup stripped)
 *   public/data/dictionary.csv    the flat export
 *   public/search.json            compact index for the search palette and A–Z filters
 *   public/pool.json              ids for the Random button
 *   data/schema/entry.schema.json JSON Schema for editor validation of entry files (committed)
 * Runs before `next dev` and `next build`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { toDictionaryCsv, toDictionaryJson } from "../src/lib/canonical";
import { getDictionary } from "../src/lib/dictionary";
import { createEntrySchema } from "../src/lib/schema";
import { buildSearchIndex } from "../src/lib/search-index";

const ROOT = process.cwd();
const started = Date.now();
const dict = getDictionary();

const dataDir = join(ROOT, "public/data");
mkdirSync(dataDir, { recursive: true });
writeFileSync(join(dataDir, "dictionary.json"), toDictionaryJson(dict.meta, dict.entries));
writeFileSync(join(dataDir, "dictionary.csv"), toDictionaryCsv(dict.entries));
writeFileSync(join(ROOT, "public/search.json"), JSON.stringify(buildSearchIndex(dict)));
writeFileSync(join(ROOT, "public/pool.json"), JSON.stringify(dict.pool));

const schemaDir = join(ROOT, "data/schema");
mkdirSync(schemaDir, { recursive: true });
const jsonSchema = z.toJSONSchema(createEntrySchema(dict.taxonomy), { target: "draft-7" });
writeFileSync(
  join(schemaDir, "entry.schema.json"),
  `${JSON.stringify(
    {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "https://lastdictionary.com/schema/entry.schema.json",
      title: "The Last Dictionary entry",
      description:
        "One dictionary entry, stored as data/entries/<id>.yaml. Generated from src/lib/schema.ts by `pnpm build:data`; do not edit by hand.",
      ...jsonSchema,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `build:data ${dict.entries.length} entries → public/data/*, public/search.json, public/pool.json, data/schema/entry.schema.json (${Date.now() - started} ms)`,
);
