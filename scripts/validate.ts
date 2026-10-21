/**
 * Validates the source data the way CI does. Reports every problem with its file name and exits
 * non-zero if any is an error. Warnings point at things worth a look but do not fail the build.
 */

import { proseFields } from "../src/lib/derive";
import { linkTargets } from "../src/lib/links";
import { createResolver, loadEntries, loadMeta, loadTaxonomy } from "../src/lib/load";
import { renderFormula } from "../src/lib/math";
import { fold, sortKey } from "../src/lib/sort";

/** Paths the site itself uses, so no entry may take them. */
export const RESERVED_IDS = new Set([
  "a-z",
  "about",
  "contents",
  "domain",
  "essentials",
  "timeline",
  "random",
  "search",
  "index",
  "404",
  "api",
  "_next",
  "favicon.svg",
  "og.png",
  "robots.txt",
  "sitemap.xml",
  "search.json",
  "pool.json",
  "opengraph-image",
]);

interface Problem {
  level: "error" | "warning";
  file: string;
  message: string;
}
const problems: Problem[] = [];
const error = (file: string, message: string) => problems.push({ level: "error", file, message });
const warn = (file: string, message: string) => problems.push({ level: "warning", file, message });

const taxonomy = loadTaxonomy();
loadMeta();
const { entries, issues } = loadEntries(taxonomy);
for (const issue of issues) error(issue.file, issue.message);

const resolver = createResolver(entries);
const ids = new Set(entries.map((e) => e.id));
const termsSeen = new Map<string, string>();

for (const entry of entries) {
  const file = `${entry.id}.yaml`;

  if (RESERVED_IDS.has(entry.id))
    error(file, `id "${entry.id}" is reserved for a page of the site`);

  const termKey = entry.term.toLowerCase();
  const other = termsSeen.get(termKey);
  if (other) error(file, `headword "${entry.term}" is already used by ${other}`);
  termsSeen.set(termKey, file);

  if (!sortKey(entry)) error(file, "term has no letters or digits to file it under");
  if (entry.domain === "people" && !entry.sort_as)
    error(file, "people need sort_as (surname first), e.g. 'Turing Alan'");
  if (entry.domains?.includes(entry.domain))
    warn(file, `domains repeats the home domain "${entry.domain}"`);

  for (const alias of entry.also ?? []) {
    if (alias.toLowerCase() === entry.term.toLowerCase())
      warn(file, `also repeats the headword "${alias}"`);
  }

  for (const text of proseFields(entry)) {
    for (const target of linkTargets(text)) {
      if (!ids.has(target))
        error(file, `cross-link [[${target}|…]] points at an entry that does not exist`);
      if (target === entry.id) warn(file, "an entry links to itself");
    }
    if (/^TODO:/.test(text)) error(file, "a field still holds the scaffold's TODO placeholder");
  }

  for (const [field, names] of [
    ["see_also", entry.see_also ?? []],
    ["contrast", entry.contrast ?? []],
  ] as const) {
    for (const name of names) {
      const id = resolver.resolve(name);
      if (!id) error(file, `${field} "${name}" matches no headword or alias`);
      else if (id === entry.id) warn(file, `${field} "${name}" points back at this entry`);
      else if (
        resolver.ambiguousAliases.has(fold(name)) &&
        !entries.some((e) => e.term.toLowerCase() === name.toLowerCase())
      ) {
        warn(
          file,
          `${field} "${name}" is an alias shared by several entries; it resolves to "${id}"`,
        );
      }
    }
  }

  for (const text of [entry.dates, ...(entry.sources ?? []).map((s) => s.text)]) {
    if (text && /^TODO:/.test(text)) {
      error(file, "a field still holds the scaffold's TODO placeholder");
    }
  }

  if (entry.formula_latex && renderFormula(entry.formula_latex).includes("katex-error")) {
    error(file, `formula_latex does not parse: ${entry.formula_latex}`);
  }

  if (entry.sources) {
    for (const source of entry.sources) {
      if (source.url && !/^https?:\/\//.test(source.url))
        error(file, `source url must start with http(s): ${source.url}`);
    }
  }
}

const errors = problems.filter((p) => p.level === "error");
const warnings = problems.filter((p) => p.level === "warning");
const quiet = process.argv.includes("--quiet");

for (const p of errors) console.log(`error    ${p.file}: ${p.message}`);
if (!quiet) for (const p of warnings) console.log(`warning  ${p.file}: ${p.message}`);

console.log(
  `\n${entries.length} entries checked: ${errors.length} error${errors.length === 1 ? "" : "s"}, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}${quiet && warnings.length ? " (run without --quiet to list them)" : ""}`,
);
process.exit(errors.length ? 1 : 0);
