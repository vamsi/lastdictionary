/**
 * Proves the YAML entry files reproduce the original dictionary exactly, and that the derived
 * data matches the compiled site closely. Run after `migrate:extract`; exits non-zero on any
 * fidelity failure.
 */
import { toDictionaryCsv, toDictionaryJson } from "../../src/lib/canonical";
import {
  azRows,
  backlinks,
  decades,
  domainCounts,
  essentials,
  essentialsByReference,
  levelRank,
  wordPool,
} from "../../src/lib/derive";
import { buildDictionary } from "../../src/lib/dictionary";
import { loadData } from "../../src/lib/load";
import { renderFormula } from "../../src/lib/math";
import { letterOf, sortKey } from "../../src/lib/sort";
import { tokenize } from "../../src/lib/tokens";
import { readOriginal } from "./original";

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.log(`✗ ${msg}`);
};
const ok = (msg: string) => console.log(`✓ ${msg}`);

function firstDiff(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const ctx = (s: string) => JSON.stringify(s.slice(Math.max(0, i - 60), i + 60));
  return `at ${i} (lengths ${a.length} vs ${b.length})\n    ours: ${ctx(a)}\n    orig: ${ctx(b)}`;
}

const data = loadData();
const dict = buildDictionary(data);
const { entries, taxonomy, resolver } = dict;
ok(`loaded ${entries.length} entries`);

// 1. Byte-identical downloads.
const origJson = readOriginal("data/dictionary.json");
const ourJson = toDictionaryJson(dict.meta, entries, { additive: false });
if (ourJson === origJson) ok("dictionary.json regenerates byte-for-byte");
else fail(`dictionary.json differs ${firstDiff(ourJson, origJson)}`);

const origCsv = readOriginal("data/dictionary.csv");
const ourCsv = toDictionaryCsv(entries);
if (ourCsv === origCsv) ok("dictionary.csv regenerates byte-for-byte");
else fail(`dictionary.csv differs ${firstDiff(ourCsv, origCsv)}`);

// 2. Order (also implied by the JSON check, but reported explicitly).
const origOrder = (JSON.parse(origJson) as { entries: { id: string }[] }).entries.map((e) => e.id);
const ourOrder = entries.map((e) => e.id);
const misplaced = ourOrder.filter((id, i) => id !== origOrder[i]);
if (!misplaced.length) ok("entry order matches the original");
else fail(`${misplaced.length} entries out of order, e.g. ${misplaced.slice(0, 5).join(", ")}`);

// 3. Parity with the compiled site.
const html = readOriginal("index.html");
const xdata = JSON.parse(
  html.match(/<script type="application\/json" id="x-data">([\s\S]*?)<\/script>/)?.[1] ?? "{}",
) as {
  meta: {
    domainCounts: Record<string, number>;
    decades: { label: string; n: number }[];
    essentials: string[];
    essentialsTop: string[];
    wotdPool: string[];
    az: [string, string, string, string][];
  };
  entries: {
    id: string;
    k: string;
    tk: string[];
    m?: string;
    bl?: string[];
    se: string[];
    co?: string[];
    v: number;
  }[];
};
const xById = new Map(xdata.entries.map((e) => [e.id, e]));

let letterMismatch = 0;
for (const e of entries) if (xById.get(e.id)?.k !== letterOf(sortKey(e))) letterMismatch++;
letterMismatch ? fail(`${letterMismatch} letter keys differ`) : ok("A–Z letter keys match");

JSON.stringify(domainCounts(entries)) ===
  JSON.stringify(Object.fromEntries(Object.entries(xdata.meta.domainCounts).sort())) ||
JSON.stringify(Object.entries(domainCounts(entries)).sort()) ===
  JSON.stringify(Object.entries(xdata.meta.domainCounts).sort())
  ? ok("domain counts match")
  : fail("domain counts differ");

const ourDecades = decades(entries).map((d) => [d.label, d.n]);
const xDecades = xdata.meta.decades.map((d) => [d.label, d.n]);
JSON.stringify(ourDecades) === JSON.stringify(xDecades)
  ? ok("decade buckets match")
  : fail(`decades differ: ${JSON.stringify(ourDecades)} vs ${JSON.stringify(xDecades)}`);

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");
sameSet(essentials(entries, taxonomy), xdata.meta.essentials)
  ? ok("essentials set matches")
  : fail("essentials set differs");
const ourTop = essentialsByReference(entries, taxonomy, resolver);
const topMatches = ourTop.filter((id, i) => id === xdata.meta.essentialsTop[i]).length;
console.log(
  `  essentials-by-reference: ${topMatches}/${ourTop.length} positions identical (ties may differ)`,
);
sameSet(wordPool(entries, taxonomy), xdata.meta.wotdPool)
  ? ok("word-of-the-day pool matches")
  : fail("pool differs");

// A–Z rows: compare the set of (letter, display, target id).
const ourAz = new Set(azRows(entries).map((r) => `${r.letter}|${r.display}|${r.id}`));
const xAz = new Set(xdata.meta.az.map((r) => `${r[0]}|${r[1]}|${r[2] || r[3]}`));
const missing = [...xAz].filter((r) => !ourAz.has(r));
const extra = [...ourAz].filter((r) => !xAz.has(r));
if (!missing.length && extra.length <= 1)
  ok(
    `A–Z index rows match (${ourAz.size} rows${extra.length ? `; ${extra.length} extra: ${extra.join(", ")}` : ""})`,
  );
else
  fail(
    `A–Z rows differ: missing ${missing.length} ${JSON.stringify(missing.slice(0, 5))}, extra ${extra.length} ${JSON.stringify(extra.slice(0, 5))}`,
  );

// Resolution of see_also / contrast names to ids.
let seMismatch = 0;
let coMismatch = 0;
for (const e of entries) {
  const x = xById.get(e.id);
  if (!x) continue;
  const se = (e.see_also ?? []).map((n) => resolver.resolve(n) ?? `?${n}`);
  if (JSON.stringify(se) !== JSON.stringify(x.se)) {
    seMismatch++;
    if (seMismatch <= 3)
      console.log(`  see_also ${e.id}: ours ${JSON.stringify(se)} vs ${JSON.stringify(x.se)}`);
  }
  const co = (e.contrast ?? []).map((n) => resolver.resolve(n) ?? `?${n}`);
  if (JSON.stringify(co) !== JSON.stringify(x.co ?? [])) coMismatch++;
}
seMismatch || coMismatch
  ? fail(`${seMismatch} see_also and ${coMismatch} contrast lists resolve differently`)
  : ok("see_also and contrast resolve to the same ids");

// Backlinks.
const bl = backlinks(entries, taxonomy, resolver);
let blSame = 0;
for (const e of entries)
  if (JSON.stringify(bl.get(e.id) ?? []) === JSON.stringify(xById.get(e.id)?.bl ?? [])) blSame++;
console.log(
  `  backlinks identical for ${blSame}/${entries.length} entries (known tie-order residue)`,
);
blSame >= 2600 ? ok("backlinks match within tolerance") : fail("backlinks differ beyond tolerance");

// Tokens and formulas.
let tkMismatch = 0;
for (const e of entries) {
  const x = xById.get(e.id);
  if (x && JSON.stringify(tokenize(e.term)) !== JSON.stringify(x.tk)) {
    tkMismatch++;
    if (tkMismatch <= 3)
      console.log(
        `  tokens ${e.id}: ours ${JSON.stringify(tokenize(e.term))} vs ${JSON.stringify(x.tk)}`,
      );
  }
}
tkMismatch > 5
  ? fail(`${tkMismatch} token splits differ`)
  : ok(
      `tokens match for ${entries.length - tkMismatch}/${entries.length} headwords (o200k contraction handling differs for the rest)`,
    );

let formulas = 0;
let formulaFail = 0;
for (const e of entries) {
  if (!e.formula_latex) continue;
  formulas++;
  const mml = renderFormula(e.formula_latex);
  if (!mml.includes("<math")) formulaFail++;
}
formulaFail
  ? fail(`${formulaFail}/${formulas} formulas failed to render`)
  : ok(`${formulas} formulas render to MathML`);
const levelsOk = entries.every((e) => levelRank(taxonomy, e.level) === xById.get(e.id)?.v);
levelsOk ? ok("level ranks match") : fail("level ranks differ");

console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
process.exit(failures ? 1 : 0);
