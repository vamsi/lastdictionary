import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/dictionary";
import { entryPath } from "@/lib/site";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  const dict = getDictionary();
  return (
    <div className="wrap fade-in">
      <PageHeader kicker="404" title="No entry here">
        There is no page at this address. The word may be filed under another name, or not yet in
        the dictionary.
      </PageHeader>
      <p className="max-w-[40em] text-ink-2">
        Press <kbd className="border border-line px-1.5 font-mono text-sm">/</kbd> to search, browse
        the <Link href="/a-z">A–Z</Link>, or try one of{" "}
        {dict.meta.tryWords.map((id, i) => (
          <span key={id}>
            {i > 0 && ", "}
            <Link href={entryPath(id)}>{dict.byId.get(id)?.term ?? id}</Link>
          </span>
        ))}
        . Missing a word?{" "}
        <a href="https://github.com/vamsi/lastdictionary/issues/new/choose">Propose it on GitHub</a>
        .
      </p>
    </div>
  );
}
