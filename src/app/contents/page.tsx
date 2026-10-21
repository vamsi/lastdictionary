import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import Link from "@/components/link";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { domainPath } from "@/lib/site";
import { breadcrumbs, pageGraph, webPageNode } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Contents",
  description:
    "Seven families of words, each divided into domains: the map of The Last Dictionary.",
  alternates: { canonical: "/contents" },
};

export default function ContentsPage() {
  const dict = getDictionary();
  const domainCount = Object.keys(dict.taxonomy.domains).length;
  return (
    <div className="wrap fade-in">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: "/contents",
            name: "Contents",
            description:
              "Seven families of words, each divided into domains: the map of The Last Dictionary.",
            type: "CollectionPage",
            breadcrumb: breadcrumbs(dict, [{ name: "Contents", path: "/contents" }]),
          }),
        )}
      />
      <PageHeader
        kicker={`${nf(dict.entries.length)} entries · ${domainCount} domains`}
        title="Contents"
      >
        Seven families of words, each divided into domains. Every entry has one home domain and up
        to three neighbors.
      </PageHeader>
      {dict.families.map((f, i) => (
        <section
          key={f.n}
          className={`fam-${f.n} grid gap-4 py-8 pb-[34px] md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-x-14 ${i === 0 ? "pt-0" : "border-line border-t"}`}
          id={`family-${f.n}`}
        >
          <div>
            <h2 className="flex items-center gap-3 text-3xl leading-[1.1]">
              <span className="inline-block size-3 shrink-0 bg-fam-ink" aria-hidden="true" />
              {f.name}
            </h2>
            <p className="mt-2.5 text-[16.5px] text-ink-2 leading-normal">{f.desc}</p>
            <p className="kick mt-3 text-ink-3">
              {nf(f.count)} words · {f.domains.length} domains
            </p>
          </div>
          <div>
            {f.domains.map((d) => (
              <Link
                key={d}
                href={domainPath(d)}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-5 gap-y-1 border-line-2 border-b py-3 pb-[13px] no-underline first:pt-0 [&:hover_.nm]:underline"
              >
                <span>
                  <span className="nm font-semibold text-xl leading-[1.3]">
                    {dict.taxonomy.domains[d]?.name}
                  </span>
                  <span className="mt-0.5 block text-[15.5px] text-ink-2 leading-[1.45]">
                    {dict.taxonomy.domains[d]?.desc}
                  </span>
                </span>
                <span className="font-mono text-ink-3 text-sm tabular-nums">
                  {nf(dict.domainCounts[d] ?? 0)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
