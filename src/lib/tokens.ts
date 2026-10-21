import { decode, encode } from "gpt-tokenizer";

/**
 * Splits a headword the way the open o200k tokenizer does, returning the text of each token.
 * Tokens that cut a multi-byte character in half are merged with their neighbors so every piece
 * is printable.
 */
export function tokenize(text: string): string[] {
  const ids = encode(text);
  const out: string[] = [];
  let pending: number[] = [];
  for (const id of ids) {
    pending.push(id);
    const piece = decode(pending);
    if (piece.includes("�")) continue;
    out.push(piece);
    pending = [];
  }
  if (pending.length) out.push(decode(pending));
  return out;
}
