import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryArticle } from "@/components/entry/entry-article";
import { JsonLd } from "@/components/json-ld";
import { getDictionary } from "@/lib/dictionary";
import { absoluteUrl, domainPath, entryPath } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDictionary().entries.map((e) => ({ slug: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const dict = getDictionary();
  const entry = dict.byId.get(slug);
  if (!entry) return {};
  const title = entry.term;
  const description = entry.plain;
  return {
    title,
    description,
    alternates: { canonical: entryPath(entry.id) },
    openGraph: {
      type: "article",
      title,
      description,
      url: entryPath(entry.id),
      siteName: dict.meta.title,
    },
    twitter: { card: "summary_large_image", title, description },
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
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: entry.term,
          alternateName: entry.also ?? [],
          description: entry.plain,
          termCode: entry.id,
          url: absoluteUrl(dict, entryPath(entry.id)),
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: dict.meta.title,
            url: dict.meta.url,
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: dict.meta.title, item: dict.meta.url },
            {
              "@type": "ListItem",
              position: 2,
              name: domain?.name ?? entry.domain,
              item: absoluteUrl(dict, domainPath(entry.domain)),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: entry.term,
              item: absoluteUrl(dict, entryPath(entry.id)),
            },
          ],
        }}
      />
      <EntryArticle dict={dict} entry={entry} />
    </div>
  );
}
