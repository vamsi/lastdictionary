import type { Metadata } from "next";
import { DecadeChart } from "@/components/decade-chart";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { decadePath, yearsOf } from "@/components/timeline/decades";
import { levelRank } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { entryPath } from "@/lib/site";
import { breadcrumbs, pageGraph, webPageNode } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "The history of AI told through the birth years of its words, from 1591 to today, decade by decade.",
  alternates: { canonical: "/timeline" },
};

export default function TimelinePage() {
  const dict = getDictionary();
  return (
    <div className="wrap fade-in">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: "/timeline",
            name: "Timeline",
            description:
              "The history of AI told through the birth years of its words, from 1591 to today, decade by decade.",
            type: "CollectionPage",
            breadcrumb: breadcrumbs(dict, [{ name: "Timeline", path: "/timeline" }]),
          }),
        )}
      />
      <PageHeader kicker={`${dict.years.min}–${dict.years.max}`} title="Timeline">
        The history of AI told through the birth years of its words. Each word sits under the year
        it was first used in the sense this dictionary defines. Open a decade to read it year by
        year.
      </PageHeader>
      <DecadeChart decades={dict.decades} />
      <p className="mt-3 font-mono text-[13px] text-ink-3 leading-relaxed">{dict.decadeNote}</p>
      <ol className="m-0 mt-12 list-none p-0">
        {dict.decades.map((d) => {
          const ids = dict.entries
            .filter((e) => e.year !== undefined && yearsOf(d, [e.year]).length)
            .sort((a, b) => levelRank(dict.taxonomy, a.level) - levelRank(dict.taxonomy, b.level))
            .slice(0, 6)
            .map((e) => e.id);
          return (
            <li
              key={d.label}
              className="grid gap-x-6 gap-y-2 border-line-2 border-b py-5 md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-baseline"
            >
              <a href={decadePath(d)} className="link-quiet font-semibold text-[28px] leading-none">
                {d.label}
              </a>
              <p className="m-0 text-[17px] text-ink-2 leading-[1.6]">
                {ids.map((id, i) => (
                  <span key={id}>
                    {i > 0 && (
                      <span className="mx-[0.1em] text-ink-3" aria-hidden="true">
                        {" · "}
                      </span>
                    )}
                    <a href={entryPath(id)} className="link-quiet whitespace-nowrap text-ink">
                      {dict.byId.get(id)?.term}
                    </a>
                  </span>
                ))}
                {d.n > ids.length && <span className="text-ink-3"> …</span>}
              </p>
              <a href={decadePath(d)} className="kick link-quiet whitespace-nowrap text-ink-2">
                {nf(d.n)} words →
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
