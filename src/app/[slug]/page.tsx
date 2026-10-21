import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryArticle } from "@/components/entry/entry-article";
import { JsonLd } from "@/components/json-ld";
import { getDictionary } from "@/lib/dictionary";
import { entryModifiedMonth, entryTitleMetadata, metaDescription } from "@/lib/seo";
import { domainPath, entryPath } from "@/lib/site";
import { entryGraph } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDictionary().entries.map((e) => ({ slug: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const dict = getDictionary();
  const entry = dict.byId.get(slug);
  if (!entry) return {};
  const description = metaDescription(entry.plain);
  return {
    title: entryTitleMetadata(entry),
    description,
    alternates: { canonical: entryPath(entry.id) },
    openGraph: {
      type: "article",
      title: entry.term,
      description,
      url: entryPath(entry.id),
      siteName: dict.meta.title,
      locale: "en_US",
      publishedTime: dict.meta.datePublished,
      modifiedTime: entryModifiedMonth(dict, entry),
      section: dict.taxonomy.domains[entry.domain]?.name,
    },
    twitter: { card: "summary_large_image", title: entry.term, description },
  };
}

export default async function EntryPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const dict = getDictionary();
  const entry = dict.byId.get(slug);
  if (!entry) notFound();
  const domain = dict.taxonomy.domains[entry.domain];
  return (
    <div className="wrap">
      <JsonLd
        data={entryGraph(dict, entry, domain?.name ?? entry.domain, domainPath(entry.domain))}
      />
      <EntryArticle dict={dict} entry={entry} />
    </div>
  );
}
