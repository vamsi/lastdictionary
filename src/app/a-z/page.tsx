import type { Metadata } from "next";
import { AzBrowser } from "@/components/az/az-browser";
import { letterPath } from "@/components/az/letters";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { levelRank } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { breadcrumbs, pageGraph, webPageNode } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "A–Z",
  description:
    "Every headword in The Last Dictionary, letter by letter, with other names pointing to their entries.",
  alternates: { canonical: "/a-z" },
};

const LABEL_CHIPS = ["emerging", "slang", "contested", "historical", "legal"];

export default function AzPage() {
  const dict = getDictionary();
  const { taxonomy } = dict;
  const letters = new Map<string, { words: number; names: number }>();
  for (const r of dict.azRows) {
    const l = letters.get(r.letter) ?? { words: 0, names: 0 };
    if (r.redirect) l.names++;
    else l.words++;
    letters.set(r.letter, l);
  }
  return (
    <div className="wrap">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: "/a-z",
            name: "A–Z",
            description:
              "Every headword in The Last Dictionary, letter by letter, with other names pointing to their entries.",
            type: "CollectionPage",
            breadcrumb: breadcrumbs(dict, [{ name: "A–Z", path: "/a-z" }]),
          }),
        )}
      />
      <PageHeader kicker="Every headword" title="A–Z" className="mb-0 border-b-0 pb-5">
        All {nf(dict.entries.length)} entries, letter by letter. Other names point to their entry.
        Or filter every word by level, label or domain.
      </PageHeader>
      <AzBrowser
        levels={Object.entries(taxonomy.levels).map(([code, name]) => ({
          rank: levelRank(taxonomy, code),
          name,
        }))}
        labels={LABEL_CHIPS.filter((l) => l in taxonomy.labels)}
        domainGroups={dict.families.map((f) => ({
          family: f.name,
          domains: f.domains.map((code) => ({
            code,
            name: taxonomy.domains[code]?.name ?? code,
            count: dict.domainCounts[code] ?? 0,
          })),
        }))}
        total={dict.entries.length}
      >
        <ul className="m-0 mt-8 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-px border border-line bg-line p-0">
          {[...letters].map(([letter, n]) => (
            <li key={letter} className="bg-paper">
              <a
                href={letterPath(letter)}
                className="group flex h-full flex-col gap-2 px-4 pt-3 pb-4 no-underline hover:bg-ink hover:text-paper"
              >
                <span className="font-semibold text-[44px] leading-none">{letter}</span>
                <span className="font-mono text-[12.5px] text-ink-3 leading-snug group-hover:text-inherit group-hover:opacity-75">
                  {nf(n.words)} {n.words === 1 ? "word" : "words"}
                  {n.names ? ` · ${nf(n.names)} other ${n.names === 1 ? "name" : "names"}` : ""}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </AzBrowser>
    </div>
  );
}
