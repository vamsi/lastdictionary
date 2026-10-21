import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { DecadeBar } from "@/components/timeline/decade-bar";
import { decadePath, decadeSlug, yearsOf } from "@/components/timeline/decades";
import { levelRank } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { nf, yearLabel } from "@/lib/format";
import type { Entry } from "@/lib/schema";
import { entryPath } from "@/lib/site";
import { breadcrumbs, itemListNode, pageGraph, webPageNode } from "@/lib/structured-data";

export const dynamicParams = false;

/** Lists above this size are left out of the structured data to keep the page light. */
const LIST_LIMIT = 300;

export function generateStaticParams() {
  return getDictionary().decades.map((d) => ({ decade: decadeSlug(d) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/timeline/[decade]">): Promise<Metadata> {
  const { decade } = await params;
  const dict = getDictionary();
  const d = dict.decades.find((x) => decadeSlug(x) === decade);
  if (!d) return {};
  return {
    title: `Timeline: ${d.label}`,
    description: `The ${nf(d.n)} words of AI first used in the ${d.label.toLowerCase()}, year by year.`,
    alternates: { canonical: decadePath(d) },
  };
}

export default async function DecadePage({ params }: PageProps<"/timeline/[decade]">) {
  const { decade } = await params;
  const dict = getDictionary();
  const d = dict.decades.find((x) => decadeSlug(x) === decade);
  if (!d) notFound();
  const byYear = new Map<number, Entry[]>();
  for (const e of dict.entries) {
    if (e.year === undefined) continue;
    const list = byYear.get(e.year) ?? [];
    list.push(e);
    byYear.set(e.year, list);
  }
  const years = yearsOf(d, [...byYear.keys()]).sort((a, b) => a - b);
  const rank = (e: Entry) => levelRank(dict.taxonomy, e.level);
  const words = years.flatMap((y) => byYear.get(y) ?? []);
  return (
    <div className="wrap">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: decadePath(d),
            name: `Timeline: ${d.label}`,
            description: `The ${nf(d.n)} words of AI first used in the ${d.label.toLowerCase()}, year by year.`,
            type: "CollectionPage",
            breadcrumb: breadcrumbs(dict, [
              { name: "Timeline", path: "/timeline" },
              { name: d.label, path: decadePath(d) },
            ]),
            ...(words.length <= LIST_LIMIT
              ? {
                  mainEntity: itemListNode(
                    dict,
                    words.map((e) => e.id),
                  ),
                }
              : {}),
          }),
        )}
      />
      <PageHeader kicker="Timeline" title={d.label} className="mb-0 border-b-0 pb-5">
        {nf(d.n)} {d.n === 1 ? "word" : "words"} first used in this period, under the year each was
        born.
      </PageHeader>
      <DecadeBar decades={dict.decades} current={d} />
      <div className="mt-2">
        {years.map((y) => {
          const list = [...(byYear.get(y) ?? [])].sort(
            (a, b) =>
              rank(a) - rank(b) || (dict.position.get(a.id) ?? 0) - (dict.position.get(b.id) ?? 0),
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
      </div>
    </div>
  );
}
