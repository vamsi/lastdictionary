import { DecadeChart } from "@/components/decade-chart";
import { JsonLd } from "@/components/json-ld";
import Link from "@/components/link";
import { EntryLink } from "@/components/rich-text";
import { SearchQueryParam } from "@/components/search/search-query-param";
import { HashRedirect } from "@/components/site/hash-redirect";
import { HeroSearch } from "@/components/site/hero-search";
import { familyOfDomain, poolIndexForDate, tryWordsForDate } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { capitalize, nf, numberWord, ordinalDate, yearLabel } from "@/lib/format";
import { domainPath, entryPath, TAGLINE } from "@/lib/site";
import { datasetNode, pageGraph, termSetNode, webPageNode } from "@/lib/structured-data";

export default function HomePage() {
  const dict = getDictionary();
  const { meta, taxonomy, entries } = dict;
  const today = new Date();
  const wotd = dict.byId.get(dict.pool[poolIndexForDate(dict.pool, today)] ?? "") ?? entries[0];
  if (!wotd) throw new Error("no entries");
  const wotdFamily = familyOfDomain(taxonomy, wotd.domain);
  const tryWords = tryWordsForDate(dict.essentialsByReference, today, 5);

  return (
    <div className="wrap fade-in">
      <HashRedirect />
      <SearchQueryParam />
      <JsonLd
        data={pageGraph(
          dict,
          termSetNode(dict),
          datasetNode(dict),
          webPageNode(dict, {
            path: "/",
            name: `${meta.title} · ${TAGLINE}`,
            description: meta.description,
          }),
        )}
      />
      <section className="pt-8 md:pt-12">
        <h1 className="max-w-[9.2em] text-[clamp(44px,10.5vw,84px)] leading-[0.96] tracking-[-0.03em] [overflow-wrap:anywhere] md:max-w-none md:text-[min(7.4vw,92px)]">
          The dictionary of&nbsp;<em>intelligence.</em>
        </h1>
        <p className="mt-7 max-w-[30em] text-[clamp(19px,1.9vw,23px)] text-ink-2 leading-[1.5] md:mt-8">
          {nf(entries.length)} words about minds and machines, from Bayes’ theorem to
          superintelligence. Each is explained in plain words first, then precisely, with the year
          it was born.
        </p>
        <p className="mt-3 max-w-[720px] text-[17px] text-ink-3 leading-[1.5]">
          Written because the language of AI moves faster than any printed book.{" "}
          <Link href="/about#preface" className="whitespace-nowrap text-ink-2">
            Preface →
          </Link>
        </p>
        <div className="mt-8 max-w-[720px]">
          <HeroSearch />
          <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-ink-3 text-sm">
            <span className="mr-2">Try</span>
            {tryWords.map((id) => (
              <Link
                key={id}
                href={entryPath(id)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-ink"
              >
                {dict.byId.get(id)?.term}
              </Link>
            ))}
          </p>
        </div>
      </section>

      <section
        className={`fam-${wotdFamily.n} mt-12 grid gap-x-10 gap-y-5 bg-fam px-5 py-6 text-fam-ink sm:px-8 sm:py-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]`}
        aria-labelledby="wotd-heading"
      >
        <div className="min-w-0">
          <div className="kick flex flex-wrap justify-between gap-x-4 gap-y-1 border-current border-b pb-3">
            <span>Word of the day</span>
            <span>{ordinalDate(today)}</span>
          </div>
          <h2
            id="wotd-heading"
            className="mt-4 text-[clamp(32px,3.6vw,46px)] leading-none tracking-[-0.02em] [overflow-wrap:anywhere]"
          >
            <Link
              href={entryPath(wotd.id)}
              className="link-quiet inline-flex min-h-11 items-center hover:decoration-2"
            >
              {wotd.term}
            </Link>
          </h2>
          <p className="kick mt-2">
            {taxonomy.pos[wotd.pos] ?? wotd.pos}
            {wotd.year !== undefined ? ` · born ${yearLabel(wotd.year)}` : ""} ·{" "}
            {taxonomy.domains[wotd.domain]?.name}
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="kick border-current border-b pb-3">In plain words</div>
          <p className="text-[19px] leading-[1.5]">{wotd.plain}</p>
          <Link
            href={entryPath(wotd.id)}
            className="inline-flex min-h-11 items-center gap-2 self-start border border-current px-4 font-mono text-sm leading-none no-underline hover:bg-fam-ink hover:text-fam"
            aria-label={`Read the entry: ${wotd.term}`}
          >
            Read the entry →
          </Link>
        </div>
      </section>

      <section className="mt-[72px]">
        <BlockHeading
          title={`${capitalize(numberWord(dict.families.length))} families of words`}
          aside={
            <Link
              href="/contents"
              className="link-quiet"
              aria-label="Contents: all families and domains"
            >
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
                <span className="whitespace-nowrap font-mono text-sm [writing-mode:vertical-rl] rotate-180">
                  {nf(f.count)} words
                </span>
              </div>
              <div className="grid min-w-0 gap-4 px-[18px] pt-5 pb-[22px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-x-11 sm:px-7 sm:pt-6 sm:pb-[26px]">
                <div>
                  <h3 className="text-[clamp(26px,8vw,30px)] leading-[1.1] [overflow-wrap:anywhere]">
                    {f.name}
                  </h3>
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
                        <span className="ml-1.5">{nf(dict.domainCounts[d] ?? 0)}</span>
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
              <Link
                href="/essentials"
                className="link-quiet"
                aria-label={`All ${nf(dict.essentials.length)} essentials`}
              >
                All {nf(dict.essentials.length)} →
              </Link>
            }
          />
          <ul className="m-0 flex list-none flex-wrap gap-x-[0.55em] gap-y-1 p-0 text-[19px] leading-[1.8] [&>li+li]:before:mr-[0.55em] [&>li+li]:before:text-ink-3 [&>li+li]:before:content-['·']">
            {dict.essentialsByReference.slice(0, 40).map((id) => (
              <li key={id}>
                <EntryLink dict={dict} id={id} />
              </li>
            ))}
          </ul>
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
          <p className="mt-3 font-mono text-ink-3 text-sm leading-relaxed">{dict.decadeNote}</p>
        </section>
      </div>
    </div>
  );
}

export function BlockHeading({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-3 border-line border-b pb-3">
      <h2 className="text-[27px] leading-[1.15]">{title}</h2>
      {aside && (
        <span className="kick inline-flex min-h-11 items-center whitespace-nowrap text-ink-2 [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center">
          {aside}
        </span>
      )}
    </div>
  );
}
