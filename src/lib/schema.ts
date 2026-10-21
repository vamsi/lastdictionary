import { z } from "zod";

/**
 * The shape of the dictionary's source files.
 *
 * `data/taxonomy.yaml` defines the codes an entry may use (domains, labels, levels, parts of
 * speech); `createEntrySchema` turns those codes into enums so that validation, TypeScript types,
 * editor autocompletion (via the generated JSON Schema) and the contributor docs all come from
 * this one definition.
 */

export const TaxonomySchema = z.strictObject({
  families: z.array(
    z.strictObject({
      n: z.int().positive(),
      name: z.string().min(1),
      desc: z.string().min(1),
      domains: z.array(z.string().min(1)).min(1),
    }),
  ),
  domains: z.record(
    z.string(),
    z.strictObject({ name: z.string().min(1), desc: z.string().min(1) }),
  ),
  labels: z.record(z.string(), z.string().min(1)),
  levels: z.record(z.string(), z.string().min(1)),
  pos: z.record(z.string(), z.string().min(1)),
});
export type Taxonomy = z.infer<typeof TaxonomySchema>;

export const MetaSchema = z.strictObject({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  url: z.url(),
  description: z.string().min(1),
  edition: z.string().min(1),
  editionNumber: z.int().positive(),
  editionDate: z.string().min(1),
  datePublished: z.string().regex(/^\d{4}-\d{2}$/),
  editor: z.string().min(1),
  credit: z.string().min(1),
  tryWords: z.array(z.string().min(1)),
  specimen: z.string().min(1),
});
export type Meta = z.infer<typeof MetaSchema>;

/** Entry ids are URL slugs: lowercase letters, digits and single hyphens. */
export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const prose = (what: string) => z.string().min(1).describe(what);

export const SourceSchema = z.strictObject({
  text: prose(
    "The citation as it should be read: authors, year, title, venue or publisher. Written fresh, not pasted from a reference manager.",
  ),
  url: z.url().optional().describe("A link to the source when one exists."),
});

function enumOf(codes: string[], what: string) {
  if (codes.length === 0) throw new Error(`taxonomy has no ${what}`);
  return z.enum(codes as [string, ...string[]]);
}

export function createEntrySchema(taxonomy: Taxonomy) {
  const domain = enumOf(Object.keys(taxonomy.domains), "domains");
  const label = enumOf(Object.keys(taxonomy.labels), "labels");
  const level = enumOf(Object.keys(taxonomy.levels), "levels");
  const pos = enumOf(Object.keys(taxonomy.pos), "parts of speech");

  const SenseSchema = z.strictObject({
    context: z
      .string()
      .min(1)
      .optional()
      .describe(
        "The field or setting in which this sense applies, e.g. 'Interpretability'. Used when a word has several senses.",
      ),
    definition: prose(
      "The precise definition. May contain [[id|text]] cross-links to other entries and `code`.",
    ),
    example: z
      .string()
      .min(1)
      .optional()
      .describe("One sentence using the word the way practitioners use it."),
    labels: z.array(label).optional().describe("Usage labels that apply to this sense only."),
  });

  return z.strictObject({
    term: prose("The headword, written as it is most often written."),
    id: z
      .string()
      .regex(ID_PATTERN)
      .describe(
        "URL slug and file name: lowercase letters, digits and hyphens. Never changes once published.",
      ),
    sort_as: z
      .string()
      .min(1)
      .optional()
      .describe(
        "How to file the word alphabetically when that differs from the headword. People are filed by surname: 'Turing Alan'.",
      ),
    pos: pos.describe("Part of speech, abbreviated: n., v., adj., adv., abbr., phr., prop. n."),
    also: z
      .array(z.string().min(1))
      .optional()
      .describe(
        "Other names, spellings and abbreviations. They appear in the A–Z and work in search.",
      ),
    pronunciation: z
      .string()
      .min(1)
      .optional()
      .describe("A simple respelling, e.g. 'AY-star', when the reading is not obvious."),
    domain: domain.describe("The home domain. See data/taxonomy.yaml for codes."),
    domains: z.array(domain).max(3).optional().describe("Up to three neighboring domains."),
    labels: z
      .array(label)
      .optional()
      .describe("Usage labels for the whole entry: emerging, contested, legal, ..."),
    level: level.describe(
      "essential (a newcomer needs it), core (working vocabulary) or specialist (research and niche terms).",
    ),
    dates: z
      .string()
      .min(1)
      .optional()
      .describe("For people: life dates, e.g. '1912–1954' or 'b. 1977'."),
    plain: prose("One or two sentences anyone can follow. The reader starts here."),
    senses: z
      .array(SenseSchema)
      .min(1)
      .describe("The precise definitions, numbered when a word has several meanings."),
    formula_latex: z
      .string()
      .min(1)
      .optional()
      .describe("A defining formula in LaTeX, rendered as MathML."),
    origin: z
      .string()
      .min(1)
      .optional()
      .describe(
        "Who introduced the word, when and where, stated only as firmly as the evidence allows. May contain cross-links.",
      ),
    year: z
      .int()
      .min(-5000)
      .max(2200)
      .optional()
      .describe(
        "First known use in this sense (or founding year for organizations). Places the word on the timeline.",
      ),
    note: z
      .string()
      .min(1)
      .optional()
      .describe("Usage note: common confusions, disputes and advice. May contain cross-links."),
    see_also: z
      .array(z.string().min(1))
      .optional()
      .describe("Related entries, by headword or alias (not by id)."),
    contrast: z
      .array(z.string().min(1))
      .optional()
      .describe("Opposites and easily confused neighbors, by headword or alias."),
    sources: z
      .array(SourceSchema)
      .optional()
      .describe("Primary sources for the origin and the definition."),
    standards: z
      .string()
      .min(1)
      .optional()
      .describe(
        "Where a statute or standard defines the term: the instrument and article, paraphrased.",
      ),
    as_of: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional()
      .describe("For time-sensitive entries, the month the facts were last checked, as YYYY-MM."),
  });
}

export type EntrySchema = ReturnType<typeof createEntrySchema>;
export type Entry = z.infer<EntrySchema>;
export type Sense = Entry["senses"][number];
export type Source = z.infer<typeof SourceSchema>;

/** Key order used when writing entry files, so every file reads the same way. */
export const ENTRY_KEY_ORDER = [
  "term",
  "id",
  "sort_as",
  "pos",
  "also",
  "pronunciation",
  "domain",
  "domains",
  "labels",
  "level",
  "dates",
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
] as const satisfies readonly (keyof Entry)[];
