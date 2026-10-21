/**
 * Sorting and lettering rules for headwords.
 *
 * The dictionary orders entries the way a printed reference does: case-insensitive, ignoring
 * punctuation and diacritics, with Greek letters read as their names (λ-return files under L)
 * and people filed by surname. The surname rule and a few editorial exceptions are expressed
 * through the optional `sort_as` field on an entry, so the rule here stays mechanical.
 */

const GREEK: Record<string, string> = {
  α: "alpha",
  β: "beta",
  γ: "gamma",
  δ: "delta",
  ε: "epsilon",
  ζ: "zeta",
  η: "eta",
  θ: "theta",
  ι: "iota",
  κ: "kappa",
  λ: "lambda",
  μ: "mu",
  ν: "nu",
  ξ: "xi",
  ο: "omicron",
  π: "pi",
  ρ: "rho",
  σ: "sigma",
  ς: "sigma",
  τ: "tau",
  υ: "upsilon",
  φ: "phi",
  χ: "chi",
  ψ: "psi",
  ω: "omega",
};

/** Lowercase, transliterate Greek, strip diacritics, keep only letters, digits and single spaces. */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(/[α-ω]/g, (g) => GREEK[g] ?? g)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Like `fold`, but punctuation between words becomes a space, so "hold-out" and "hold out" agree. */
export function foldWords(text: string): string {
  return text
    .toLowerCase()
    .replace(/[α-ω]/g, (g) => GREEK[g] ?? g)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function sortKey(entry: { term: string; sort_as?: string | undefined }): string {
  return fold(entry.sort_as ?? entry.term);
}

/** The A–Z letter a sort key files under: its first character, or `#` for digits. */
export function letterOf(key: string): string {
  const first = key.charAt(0);
  if (!first) return "#";
  return /[0-9]/.test(first) ? "#" : first.toUpperCase();
}

export function compareKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Order entries by sort key, then by id so the order is total and stable across machines. */
export function compareEntries(
  a: { id: string; term: string; sort_as?: string | undefined },
  b: { id: string; term: string; sort_as?: string | undefined },
): number {
  return compareKeys(sortKey(a), sortKey(b)) || compareKeys(a.id, b.id);
}
