import Link from "next/link";
import { DecadeChart } from "@/components/decade-chart";
import { JsonLd } from "@/components/json-ld";
import { EntryLink } from "@/components/rich-text";
import { HashRedirect } from "@/components/site/hash-redirect";
import { HeroSearch } from "@/components/site/hero-search";
import { familyOfDomain, poolIndexForDate } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { nf, ordinalDate, yearLabel } from "@/lib/format";
import { domainPath, entryPath } from "@/lib/site";

export default function HomePage() {
  const dict = getDictionary();
  const { meta, taxonomy, entries } = dict;
  const today = new Date();
  const wotd = dict.byId.get(dict.pool[poolIndexForDate(dict.pool, today)] ?? "") ?? entries[0];
  if (!wotd) throw new Error("no entries");
  const wotdFamily = familyOfDomain(taxonomy, wotd.domain);

  return (
    <div className="wrap fade-in">
      <HashRedirect />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: meta.title,
          alternateName: meta.subtitle,
          url: meta.url,
          inLanguage: "en",
          description: meta.description,
          datePublished: meta.datePublished,
          numberOfItems: entries.length,
          editor: { "@type": "Person", name: meta.editor },
          license: "https://creativecommons.org/licenses/by/4.0/",
        }}
      />

      <section className="grid border border-line md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-[22px] border-line border-b px-5 py-7 md:border-r md:border-b-0 md:px-11 md:pt-11 md:pb-10">
          <span className="kick inline-block self-start border-line border-b pb-[9px]">
            First Edition · <b>{meta.editionDate}</b>
          </span>
          <h1 className="mt-1.5 text-[clamp(44px,6vw,76px)] leading-none tracking-[-0.02em]">
            Intelligence, defined.
          </h1>
          <p className="max-w-[27em] text-ink-2 text-xl leading-[1.45]">
            {nf(entries.length)} words about minds and machines, from Bayes’ theorem to
            superintelligence. Each is explained in plain words first, then precisely, with the year
            it was born.
          </p>
          <HeroSearch />
          <p className="-mt-1.5 font-mono text-ink-3 text-sm leading-[1.9]">
            Try{" "}
            {meta.tryWords
              .filter((id) => dict.byId.has(id))
              .map((id) => (
                <span key={id}>
                  <Link href={entryPath(id)} className="whitespace-nowrap text-ink">
                    {dict.byId.get(id)?.term}
                  </Link>{" "}
                </span>
              ))}
          </p>
        </div>
        <div
          className={`fam-${wotdFamily.n} flex min-w-0 flex-col gap-3.5 bg-fam px-5 py-7 text-fam-ink md:px-11 md:pt-10 md:pb-[42px]`}
        >
          <div className="kick flex justify-between gap-3 border-current border-b pb-3">
            <span>Word of the day</span>
            <span>{ordinalDate(today)}</span>
          </div>
          <h2 className="mt-4 text-[clamp(42px,5.4vw,68px)] leading-none tracking-[-0.02em] [overflow-wrap:anywhere]">
            <Link href={entryPath(wotd.id)} className="link-quiet hover:decoration-2">
              {wotd.term}
            </Link>
          </h2>
          <div className="kick border-current border-b pb-4">
            {taxonomy.pos[wotd.pos] ?? wotd.pos}
            {wotd.year !== undefined ? ` · born ${yearLabel(wotd.year)}` : ""} ·{" "}
            {taxonomy.domains[wotd.domain]?.name}
          </div>
          <p className="mt-1.5 mb-2 text-[22px] leading-[1.4]">{wotd.plain}</p>
          <Link
            href={entryPath(wotd.id)}
            className="mt-auto inline-flex items-center gap-2 self-start border border-current px-4 pt-3 pb-[11px] font-mono text-sm leading-none no-underline hover:bg-fam-ink hover:text-fam"
          >
            Read the entry →
          </Link>
        </div>
      </section>

      <section className="mt-[72px]">
        <BlockHeading
          title="Seven families of words"
          aside={
            <Link href="/contents" className="link-quiet">
              Contents →
            </Link>
          }
        />
        <div className="grid gap-3">
          {dict.families.map((f) => (
            <article
              key={f.n}
              className={`fam-${f.n} grid min-w-0 grid-cols-[40px_minmax(0,1fr)] bg-fam text-fam-ink sm:grid-cols-[56px_minmax(0,1fr)]`}
            >
              <div className="flex justify-center border-current border-r py-[22px]">
                <span className="whitespace-nowrap font-mono text-[13px] [writing-mode:vertical-rl] rotate-180">
                  {nf(f.count)} words
                </span>
              </div>
              <div className="grid min-w-0 gap-4 px-[18px] pt-5 pb-[22px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-x-11 sm:px-7 sm:pt-6 sm:pb-[26px]">
                <div>
                  <h3 className="text-3xl leading-[1.1]">{f.name}</h3>
                  <p className="mt-2.5 text-[17px] leading-[1.45]">{f.desc}</p>
                </div>
                <div>
                  <span className="kick mb-2 block border-current border-b pb-2">
                    {f.domains.length} domains
                  </span>
                  <ul className="m-0 list-none p-0 font-mono text-sm leading-[1.75] sm:columns-2 sm:gap-7">
                    {f.domains.map((d) => (
                      <li key={d} className="break-inside-avoid">
                        <Link href={domainPath(d)} className="link-quiet">
                          {taxonomy.domains[d]?.name}
                        </Link>
                        <span className="ml-1.5 opacity-70">{nf(dict.domainCounts[d] ?? 0)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-[76px] grid gap-16 md:grid-cols-2 md:gap-14">
        <section>
          <BlockHeading
            title="Start with the essentials"
            aside={
              <Link href="/essentials" className="link-quiet">
                All {nf(dict.essentials.length)} →
              </Link>
            }
          />
          <p className="text-[19px] leading-[1.8]">
            {dict.essentialsByReference.slice(0, 40).map((id, i) => (
              <span key={id}>
                {i > 0 && (
                  <span className="mx-[0.1em] text-ink-3" aria-hidden="true">
                    {" · "}
                  </span>
                )}
                <EntryLink dict={dict} id={id} className="link-quiet whitespace-nowrap" />
              </span>
            ))}
          </p>
        </section>
        <section>
          <BlockHeading
            title="Words born per decade"
            aside={
              <Link href="/timeline" className="link-quiet">
                Timeline →
              </Link>
            }
          />
          <DecadeChart decades={dict.decades} compact />
          <p className="mt-3 font-mono text-[13px] text-ink-3 leading-relaxed">{dict.decadeNote}</p>
        </section>
      </div>
    </div>
  );
}

export function BlockHeading({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-3 border-line border-b pb-3">
      <h2 className="text-[27px] leading-[1.15]">{title}</h2>
      {aside && <span className="kick whitespace-nowrap text-ink-2">{aside}</span>}
    </div>
  );
}
