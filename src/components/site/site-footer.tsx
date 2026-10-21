import type { Dictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { WORDMARK } from "@/lib/site";
import { Brand } from "./brand";
import { ShortcutsToggle } from "./shortcuts-toggle";
import { FooterNav } from "./site-header";
import { ThemeSegment } from "./theme-toggle";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  const { meta, entries } = dict;
  return (
    <footer className="gutter">
      <div className="wrap mt-[120px] grid gap-8 border-line border-t pt-[34px] pb-12 font-mono text-sm leading-relaxed sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="sm:max-md:col-span-2">
          <Brand title={WORDMARK} large />
          <p className="mt-3.5 text-ink-3">
            {meta.edition} · {nf(entries.length)} entries
            <br />
            {meta.credit}
            <br />
            Text{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="link-quiet underline"
              rel="license"
            >
              CC BY 4.0
            </a>
            {" · "}
            <a href="https://github.com/vamsi/lastdictionary" className="link-quiet underline">
              Source on GitHub
            </a>
          </p>
        </div>
        <FooterNav />
        <div className="grid content-start gap-7">
          <div>
            <span className="mb-2 block text-ink-3">Theme</span>
            <ThemeSegment />
          </div>
          <ShortcutsToggle />
        </div>
      </div>
    </footer>
  );
}
