import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { WordList } from "@/components/word-list";
import { getDictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { breadcrumbs, itemListNode, pageGraph, webPageNode } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Essentials",
  description: "The words that let you follow almost any conversation about AI, grouped by family.",
  alternates: { canonical: "/essentials" },
};

export default function EssentialsPage() {
  const dict = getDictionary();
  return (
    <div className="wrap fade-in">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: "/essentials",
            name: "The essentials",
            description:
              "The words that let you follow almost any conversation about AI, grouped by family.",
            type: "CollectionPage",
            breadcrumb: breadcrumbs(dict, [{ name: "The essentials", path: "/essentials" }]),
            mainEntity: itemListNode(dict, dict.essentials),
          }),
        )}
      />
      <PageHeader kicker={`${nf(dict.essentials.length)} words`} title="The essentials">
        The words that let you follow almost any conversation about AI, grouped by family. Read the
        plain-words line, then open any word for the full entry.
      </PageHeader>
      {dict.families.map((f) => {
        const ids = dict.essentials.filter((id) =>
          f.domains.includes(dict.byId.get(id)?.domain ?? ""),
        );
        if (!ids.length) return null;
        return (
          <section key={f.n} className={`fam-${f.n} mt-14 first-of-type:mt-0`}>
            <SectionHeading title={f.name} count={nf(ids.length)} swatch />
            <WordList dict={dict} ids={ids} />
          </section>
        );
      })}
    </div>
  );
}
