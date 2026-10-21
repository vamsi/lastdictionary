import { langOf } from "@/lib/lang";

/** Text that may be in another language gets a `lang` attribute so screen readers switch voice. */
export function LangText({ text }: { text: string }) {
  const lang = langOf(text);
  return lang ? <span lang={lang}>{text}</span> : text;
}
