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
import { TAGLINE } from "../src/lib/site";

const ROOT = process.cwd();
const started = Date.now();
const dict = getDictionary();

const dataDir = join(ROOT, "public/data");
mkdirSync(dataDir, { recursive: true });
writeFileSync(join(dataDir, "dictionary.json"), toDictionaryJson(dict.meta, dict.entries));
writeFileSync(join(dataDir, "dictionary.csv"), toDictionaryCsv(dict.entries));
writeFileSync(join(ROOT, "public/search.json"), JSON.stringify(buildSearchIndex(dict)));
writeFileSync(join(ROOT, "public/pool.json"), JSON.stringify(dict.pool));

// llms.txt (llmstxt.org): a concise map of the site for AI crawlers, plus a full listing.
const { meta, taxonomy } = dict;
const line = (text: string, url: string, note?: string) =>
  `- [${text}](${url})${note ? `: ${note}` : ""}`;
const llms = [
  `# ${meta.title}`,
  "",
  `> ${TAGLINE}. ${dict.entries.length.toLocaleString("en-US")} words of AI, from Bayes' theorem to superintelligence, each defined in plain words first, then precisely, with the year it was born. ${meta.edition}. Text licensed CC BY 4.0.`,
  "",
  `Every entry has its own page at ${meta.url}<id>, with a plain-words definition, numbered senses, origin and birth year, cross-references and sources. The whole dictionary is available as JSON and CSV.`,
  "",
  "## Browse",
  line("Contents", `${meta.url}contents`, "seven families of words, each divided into domains"),
  line("A–Z", `${meta.url}a-z`, "every headword, letter by letter"),
  line(
    "Timeline",
    `${meta.url}timeline`,
    "words by the year they were born, with a page per decade",
  ),
  line(
    "Essentials",
    `${meta.url}essentials`,
    `the ${dict.essentials.length} words a newcomer needs`,
  ),
  line("About", `${meta.url}about`, "how to read an entry, editorial principles, how to cite"),
  "",
  "## Domains",
  ...dict.families.flatMap((f) =>
    f.domains.map((d) =>
      line(
        taxonomy.domains[d]?.name ?? d,
        `${meta.url}domain/${d}`,
        `${taxonomy.domains[d]?.desc ?? ""} (${dict.domainCounts[d] ?? 0} entries)`,
      ),
    ),
  ),
  "",
  "## Data",
  line("dictionary.json", `${meta.url}data/dictionary.json`, "every entry with all fields"),
  line("dictionary.csv", `${meta.url}data/dictionary.csv`, "one row per entry"),
  line(
    "llms-full.txt",
    `${meta.url}llms-full.txt`,
    "every headword with its plain-words definition and URL",
  ),
  "",
  "## Optional",
  line(
    "Source repository",
    "https://github.com/vamsi/lastdictionary",
    "one YAML file per entry; corrections welcome by pull request",
  ),
  "",
].join("\n");
writeFileSync(join(ROOT, "public/llms.txt"), llms);
const full = [
  `# ${meta.title}: every entry`,
  "",
  `> ${dict.entries.length.toLocaleString("en-US")} entries in dictionary order. Format: headword (part of speech, domain): plain-words definition. Full detail at each URL. ${meta.edition}. CC BY 4.0.`,
  "",
  ...dict.entries.map(
    (e) =>
      `- [${e.term}](${meta.url}${e.id}) (${e.pos}, ${taxonomy.domains[e.domain]?.name ?? e.domain}): ${e.plain}`,
  ),
  "",
].join("\n");
writeFileSync(join(ROOT, "public/llms-full.txt"), full);

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
  `build:data ${dict.entries.length} entries → public/data/*, public/search.json, public/pool.json, public/llms*.txt, data/schema/entry.schema.json (${Date.now() - started} ms)`,
);
