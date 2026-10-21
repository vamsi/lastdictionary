import { Document, isPair, isScalar, parse, Scalar, visit } from "yaml";
import { ENTRY_KEY_ORDER, type Entry } from "./schema";

/**
 * Reading and writing entry files.
 *
 * Entries are YAML 1.2. Long prose is written as folded block scalars (`>-`) so that a file wraps
 * at a readable width, edits produce small diffs, and colons or quotes inside a sentence never
 * need escaping. Empty fields are omitted rather than written as null.
 */

export const SCHEMA_COMMENT = " yaml-language-server: $schema=../schema/entry.schema.json";

const PROSE_KEYS = new Set([
  "plain",
  "definition",
  "example",
  "origin",
  "note",
  "standards",
  "text",
]);
const FOLD_AT = 80;

function ordered(entry: Entry): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of ENTRY_KEY_ORDER) {
    const value = entry[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = key === "senses" ? entry.senses.map(orderedSense) : value;
  }
  return out;
}

function orderedSense(sense: Entry["senses"][number]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (sense.context) out.context = sense.context;
  out.definition = sense.definition;
  if (sense.example) out.example = sense.example;
  if (sense.labels?.length) out.labels = sense.labels;
  return out;
}

export function stringifyEntry(entry: Entry): string {
  const doc = new Document(ordered(entry));
  visit(doc, {
    Pair(_, pair) {
      if (!isPair(pair) || !isScalar(pair.key) || !isScalar(pair.value)) return;
      const value = pair.value.value;
      if (
        typeof value === "string" &&
        PROSE_KEYS.has(String(pair.key.value)) &&
        value.length > FOLD_AT
      ) {
        pair.value.type = Scalar.BLOCK_FOLDED;
      }
    },
  });
  doc.commentBefore = SCHEMA_COMMENT;
  return doc.toString({ lineWidth: 100, minContentWidth: 30 });
}

/** Parse a YAML entry file to a plain object. Validation happens in the loader. */
export function parseEntryYaml(text: string): unknown {
  return parse(text);
}
