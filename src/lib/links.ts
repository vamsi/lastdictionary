/**
 * Wiki-style cross-links inside dictionary prose.
 *
 * Prose fields (definitions, examples, origin, note, standards) may contain `[[id|text]]`, which
 * renders `text` as a link to the entry `id`, or `[[id]]`, which renders the target's headword.
 * Backticks mark inline code. The published downloads strip the markup, so the text reads the same
 * with or without it.
 */

export type Segment =
  | { type: "text"; text: string }
  | { type: "link"; id: string; text: string | null }
  | { type: "code"; text: string };

const TOKEN = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]|`([^`]+)`/g;

export function parseRich(source: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of source.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push({ type: "text", text: source.slice(last, start) });
    if (m[3] !== undefined) out.push({ type: "code", text: m[3] });
    else out.push({ type: "link", id: (m[1] as string).trim(), text: m[2] ?? null });
    last = start + m[0].length;
  }
  if (last < source.length) out.push({ type: "text", text: source.slice(last) });
  return out;
}

/** Remove link markup, keeping the visible text. Unknown `[[id]]` forms fall back to the id. */
export function stripLinks(
  source: string,
  headwordOf?: (id: string) => string | undefined,
): string {
  return source.replace(/\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g, (_m, id: string, text?: string) => {
    if (text !== undefined) return text;
    return headwordOf?.(id.trim()) ?? id.trim();
  });
}

/** Ids referenced by `[[...]]` links in a piece of prose, in order of appearance, de-duplicated. */
export function linkTargets(source: string): string[] {
  const ids: string[] = [];
  for (const seg of parseRich(source)) {
    if (seg.type === "link" && !ids.includes(seg.id)) ids.push(seg.id);
  }
  return ids;
}
