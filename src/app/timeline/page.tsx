import type { Metadata } from "next";
import { DecadeChart } from "@/components/decade-chart";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { FIRST_DECADE, levelRank } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { yearLabel } from "@/lib/format";
import type { Entry } from "@/lib/schema";
import { entryPath } from "@/lib/site";
import { breadcrumbs, pageGraph, webPageNode } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Timeline",
  description: "The history of AI told through the birth years of its words, from 1591 to today.",
  alternates: { canonical: "/timeline" },
};

export default function TimelinePage() {
  const dict = getDictionary();
  const byYear = new Map<number, Entry[]>();
  for (const e of dict.entries) {
    if (e.year === undefined) continue;
    const list = byYear.get(e.year) ?? [];
    list.push(e);
    byYear.set(e.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => a - b);
  const groups: { id: string; label: string; years: number[] }[] = [];
  for (const y of years) {
    const label = y < FIRST_DECADE ? `Before ${FIRST_DECADE}` : `${Math.floor(y / 10) * 10}s`;
    const id = y < FIRST_DECADE ? "dec-before" : `dec-${Math.floor(y / 10) * 10}s`;
    const last = groups[groups.length - 1];
    if (last && last.id === id) last.years.push(y);
    else groups.push({ id, label, years: [y] });
  }
  return (
    <div className="wrap fade-in">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: "/timeline",
            name: "Timeline",
            description:
              "The history of AI told through the birth years of its words, from 1591 to today.",
            type: "WebPage",
            breadcrumb: breadcrumbs(dict, [{ name: "Timeline", path: "/timeline" }]),
          }),
        )}
      />
      <PageHeader kicker={`${dict.years.min}–${dict.years.max}`} title="Timeline">
        The history of AI told through the birth years of its words. Each word sits under the year
        it was first used in the sense this dictionary defines.
      </PageHeader>
      <DecadeChart decades={dict.decades} />
      <p className="mt-3 font-mono text-[13px] text-ink-3 leading-relaxed">{dict.decadeNote}</p>
      {groups.map((g) => (
        <section key={g.id}>
          <h2
            id={g.id}
            className="mt-[60px] scroll-mt-[calc(var(--navh)+24px)] border-line border-b pb-3.5 text-[40px] leading-none"
          >
            {g.label}
          </h2>
          {g.years.map((y) => {
            const list = [...(byYear.get(y) ?? [])].sort(
              (a, b) =>
                levelRank(dict.taxonomy, a.level) - levelRank(dict.taxonomy, b.level) ||
                (dict.position.get(a.id) ?? 0) - (dict.position.get(b.id) ?? 0),
            );
            return (
              <div
                key={y}
                id={`y${y}`}
                className="grid scroll-mt-[calc(var(--navh)+80px)] grid-cols-[58px_minmax(0,1fr)] gap-x-3.5 gap-y-1 border-line-2 border-b py-3 pb-[13px] target:bg-paper-2 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-x-6"
              >
                <div className="font-mono text-[15px] leading-[1.75] tabular-nums">
                  {yearLabel(y)}
                </div>
                <div className="flex flex-wrap gap-x-[18px] gap-y-0.5 text-[17.5px]">
                  {list.map((e) => (
                    <a key={e.id} href={entryPath(e.id)} className="link-quiet">
                      {e.term}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
