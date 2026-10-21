import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { WordList } from "@/components/word-list";
import { familyOfDomain, levelRank } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { domainPath } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(getDictionary().taxonomy.domains).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/domain/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const domain = getDictionary().taxonomy.domains[slug];
  if (!domain) return {};
  return {
    title: domain.name,
    description: domain.desc,
    alternates: { canonical: domainPath(slug) },
    openGraph: { title: domain.name, description: domain.desc, url: domainPath(slug) },
  };
}

export default async function DomainPage({ params }: PageProps<"/domain/[slug]">) {
  const { slug } = await params;
  const dict = getDictionary();
  const domain = dict.taxonomy.domains[slug];
  if (!domain) notFound();
  const family = familyOfDomain(dict.taxonomy, slug);
  const home = dict.entries.filter((e) => e.domain === slug);
  const near = dict.entries.filter((e) => e.domain !== slug && e.domains?.includes(slug));
  const essential = home.filter((e) => levelRank(dict.taxonomy, e.level) === 1).map((e) => e.id);
  const rest = home.filter((e) => levelRank(dict.taxonomy, e.level) !== 1).map((e) => e.id);
  return (
    <div className={`wrap fam-${family.n}`}>
      <PageHeader
        panel
        kicker={
          <Link href="/contents" className="link-quiet">
            {family.name}
          </Link>
        }
        title={domain.name}
      >
        {domain.desc} {nf(home.length)} entries live here, and {nf(near.length)} from other domains
        touch it.
      </PageHeader>
      {essential.length > 0 && (
        <section>
          <SectionHeading title="Essential" count={nf(essential.length)} />
          <WordList dict={dict} ids={essential} />
        </section>
      )}
      {rest.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            title={essential.length ? "All other entries" : "All entries"}
            count={nf(rest.length)}
          />
          <WordList dict={dict} ids={rest} />
        </section>
      )}
      {near.length > 0 && (
        <section className="mt-14">
          <SectionHeading title="Also relevant" count={nf(near.length)} />
          <WordList dict={dict} ids={near.map((e) => e.id)} />
        </section>
      )}
    </div>
  );
}
