import type { Dictionary } from "@/lib/dictionary";
import { stripLinks } from "@/lib/links";
import type { Entry } from "@/lib/schema";
import { citation } from "@/lib/site";

/** The plain-text form of an entry, for "Copy entry". */
export function entryText(dict: Dictionary, entry: Entry): string {
  const headwordOf = (id: string) => dict.byId.get(id)?.term;
  const strip = (s: string) => stripLinks(s, headwordOf);
  const lines = [
    `${entry.term}${entry.pronunciation ? ` /${entry.pronunciation}/` : ""} ${entry.pos}`,
  ];
  if (entry.also?.length) lines.push(`Also: ${entry.also.join(", ")}`);
  lines.push(`In plain words: ${entry.plain}`);
  entry.senses.forEach((sense, k) => {
    const n = entry.senses.length > 1 ? `${k + 1}. ` : "";
    const ctx = sense.context ? `(${sense.context}) ` : "";
    lines.push(
      `${n}${ctx}${strip(sense.definition)}${sense.example ? ` Example: ${strip(sense.example)}` : ""}`,
    );
  });
  if (entry.origin) lines.push(`Origin: ${strip(entry.origin)}`);
  if (entry.note) lines.push(`Note: ${strip(entry.note)}`);
  if (entry.see_also?.length) lines.push(`See also: ${entry.see_also.join(", ")}`);
  if (entry.sources?.length) {
    lines.push(
      `Sources: ${entry.sources.map((s) => `${s.text}${s.url ? ` ${s.url}` : ""}`).join(" | ")}`,
    );
  }
  lines.push(`— ${citation(dict, entry)}`);
  return lines.join("\n");
}
