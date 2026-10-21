import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { toCanonicalEntry, toDictionaryCsv } from "../canonical";
import { parseEntryYaml } from "../entry-io";
import { loadTaxonomy } from "../load";
import { createEntrySchema } from "../schema";

describe("published downloads", () => {
  const schema = createEntrySchema(loadTaxonomy());
  const entry = schema.parse(
    parseEntryYaml(readFileSync(join(process.cwd(), "data/entries/harness.yaml"), "utf8")),
  );

  it("restores the original field set and strips link markup", () => {
    const out = toCanonicalEntry(entry, () => undefined, { additive: false });
    expect(Object.keys(out)).toEqual([
      "term",
      "id",
      "pos",
      "also",
      "pronunciation",
      "domain",
      "domains",
      "labels",
      "level",
      "plain",
      "senses",
      "formula_latex",
      "origin",
      "year",
      "note",
      "see_also",
      "contrast",
      "sources",
      "standards",
      "as_of",
    ]);
    expect(out.pronunciation).toBeNull();
    expect(JSON.stringify(out)).not.toContain("[[");
  });

  it("flattens several senses into one CSV cell with their contexts", () => {
    const csv = toDictionaryCsv([entry]);
    expect(
      csv.startsWith(
        "term,part_of_speech,domain,level,labels,plain,definition,origin,year,see_also,also\r\n",
      ),
    ).toBe(true);
    expect(csv).toContain("Agents: The runtime that turns a large language model");
    expect(csv).toContain(" | Evaluation: Short for evaluation harness");
  });
});
