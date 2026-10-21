/** Guesses the language of a short string from its script, for `lang` attributes on other names. */
const SCRIPTS: [RegExp, string][] = [
  [/[぀-ヿ]/, "ja"],
  [/[가-힯]/, "ko"],
  [/[一-鿿㐀-䶿]/, "zh"],
  [/[Ѐ-ӿ]/, "ru"],
  [/[؀-ۿ]/, "ar"],
  [/[֐-׿]/, "he"],
];

export function langOf(text: string): string | undefined {
  for (const [re, lang] of SCRIPTS) if (re.test(text)) return lang;
  return undefined;
}
