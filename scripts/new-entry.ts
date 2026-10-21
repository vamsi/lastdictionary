/**
 * Scaffolds a new entry file:  pnpm new-entry "Your term" [--domain code] [--level core] [--pos n.]
 * Writes data/entries/<id>.yaml with the required fields filled in and TODO markers where prose
 * is needed. `pnpm validate` refuses TODOs, so nothing half-written can ship.
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringifyEntry } from "../src/lib/entry-io";
import { ENTRIES_DIR, loadTaxonomy } from "../src/lib/load";
import type { Entry } from "../src/lib/schema";
import { fold } from "../src/lib/sort";

const args = process.argv.slice(2);
const term = args.find((a) => !a.startsWith("--"));
const option = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? (args[i + 1] as string) : fallback;
};
if (!term) {
  console.error(
    'usage: pnpm new-entry "term" [--domain code] [--level essential|core|specialist] [--pos n.]',
  );
  process.exit(2);
}

const taxonomy = loadTaxonomy();
const domain = option("domain", "core");
const level = option("level", "core");
const pos = option("pos", "n.");
for (const [value, allowed, what] of [
  [domain, Object.keys(taxonomy.domains), "domain"],
  [level, Object.keys(taxonomy.levels), "level"],
  [pos, Object.keys(taxonomy.pos), "pos"],
] as const) {
  if (!allowed.includes(value)) {
    console.error(`unknown ${what} "${value}"; one of: ${allowed.join(", ")}`);
    process.exit(2);
  }
}

const id = fold(term).replace(/ /g, "-");
if (!id) {
  console.error("the term needs at least one letter or digit");
  process.exit(2);
}
const file = join(ENTRIES_DIR, `${id}.yaml`);
if (existsSync(file)) {
  console.error(`${file} already exists`);
  process.exit(1);
}

const entry: Entry = {
  term,
  id,
  pos,
  domain,
  level,
  plain: "TODO: one or two sentences anyone can follow.",
  senses: [
    {
      definition:
        "TODO: the precise definition. Link other entries like [[transformer|transformers]].",
      example: "TODO: one sentence using the word the way practitioners use it.",
    },
  ],
  origin: "TODO: who introduced the word, when and where, only as firmly as the evidence allows.",
  see_also: [],
  sources: [{ text: "TODO: Author (Year). Title. Venue.", url: "https://example.com" }],
};
if (domain === "people") {
  const tokens = term.split(" ");
  const surname = tokens.pop() ?? term;
  entry.sort_as = [surname, ...tokens].join(" ");
  entry.pos = "prop. n.";
  entry.dates = "TODO: 1912–1954 or b. 1977";
}
delete entry.see_also;

writeFileSync(file, stringifyEntry(entry));
console.log(`created data/entries/${id}.yaml`);
console.log("next: fill in every TODO, then run  pnpm validate  and  pnpm dev");
