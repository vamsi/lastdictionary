import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LetterBar } from "@/components/az/az-browser";
import { letterFromSlug, letterPath, letterSlug } from "@/components/az/letters";
import { JsonLd } from "@/components/json-ld";
import { LangText } from "@/components/lang-text";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { entryPath } from "@/lib/site";
import { breadcrumbs, itemListNode, pageGraph, webPageNode } from "@/lib/structured-data";

export const dynamicParams = false;

function lettersOf() {
  const dict = getDictionary();
  const letters: string[] = [];
  for (const r of dict.azRows) if (!letters.includes(r.letter)) letters.push(r.letter);
  return letters;
}

export function generateStaticParams() {
  return lettersOf().map((l) => ({ letter: letterSlug(l) }));
}

export async function generateMetadata({ params }: PageProps<"/a-z/[letter]">): Promise<Metadata> {
  const { letter } = await params;
  const l = letterFromSlug(letter);
  const title = l === "#" ? "A–Z: words starting with a digit" : `A–Z: ${l}`;
  return {
    title,
    description: `Every headword in The Last Dictionary filed under ${l === "#" ? "a digit" : l}.`,
    alternates: { canonical: letterPath(l) },
  };
}

export default async function LetterPage({ params }: PageProps<"/a-z/[letter]">) {
  const { letter } = await params;
  const l = letterFromSlug(letter);
  const dict = getDictionary();
  const rows = dict.azRows.filter((r) => r.letter === l);
  if (!rows.length) notFound();
  const words = rows.filter((r) => !r.redirect).length;
  return (
    <div className="wrap">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: letterPath(l),
            name: l === "#" ? "A–Z: words starting with a digit" : `A–Z: ${l}`,
            description: `Every headword in The Last Dictionary filed under ${l === "#" ? "a digit" : l}.`,
            type: "CollectionPage",
            breadcrumb: breadcrumbs(dict, [
              { name: "A–Z", path: "/a-z" },
              { name: l === "#" ? "0–9" : l, path: letterPath(l) },
            ]),
            mainEntity: itemListNode(
              dict,
              rows.filter((r) => !r.redirect).map((r) => r.id),
            ),
          }),
        )}
      />
      <PageHeader kicker="A–Z" title={l === "#" ? "0–9" : l} className="mb-0 border-b-0 pb-5">
        {nf(words)} {words === 1 ? "word" : "words"}
        {rows.length - words
          ? ` and ${nf(rows.length - words)} other names, in italics, pointing to their entries.`
          : "."}
      </PageHeader>
      <LetterBar letters={lettersOf()} current={l} />
      <ul className="m-0 mt-7 list-none columns-[210px] gap-8 p-0 text-[16.5px] leading-[1.55] md:columns-4 [&_a]:scroll-mt-[calc(var(--navh)+60px)]">
        {rows.map((r) =>
          r.redirect ? (
            <li
              key={`${r.display}|${r.id}`}
              className="break-inside-avoid py-0.5 text-ink-3 italic"
            >
              <LangText text={r.display} /> →{" "}
              <a href={entryPath(r.id)} className="link-quiet text-ink not-italic">
                {dict.byId.get(r.id)?.term}
              </a>
            </li>
          ) : (
            <li key={r.id} className="break-inside-avoid py-0.5">
              <a href={entryPath(r.id)} className="link-quiet">
                {r.display}
              </a>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
