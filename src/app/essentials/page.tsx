import type { Metadata } from "next";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { WordList } from "@/components/word-list";
import { getDictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";

export const metadata: Metadata = {
  title: "Essentials",
  description: "The words that let you follow almost any conversation about AI, grouped by family.",
  alternates: { canonical: "/essentials" },
};

export default function EssentialsPage() {
  const dict = getDictionary();
  return (
    <div className="wrap fade-in">
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
