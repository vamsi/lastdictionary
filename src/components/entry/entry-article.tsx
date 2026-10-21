import { Fragment, type ReactNode } from "react";
import { letterPath } from "@/components/az/letters";
import { LangText } from "@/components/lang-text";
import Link from "@/components/link";
import { EntryLink, RichText } from "@/components/rich-text";
import { yearPath } from "@/components/timeline/decades";
import { familyOfDomain, levelRank } from "@/lib/derive";
import type { Dictionary } from "@/lib/dictionary";
import { monthLabel, nf, yearLabel } from "@/lib/format";
import { renderFormula } from "@/lib/math";
import type { Entry } from "@/lib/schema";
import { absoluteUrl, citation, domainPath, entryPath } from "@/lib/site";
import { letterOf, sortKey } from "@/lib/sort";
import { tokenize } from "@/lib/tokens";
import { EntryActions } from "./entry-actions";
import { EntryClient } from "./entry-client";
import { entryText } from "./entry-text";

interface Props {
  dict: Dictionary;
  entry: Entry;
  /** The About page shows one entry with its parts numbered and without the page furniture. */
  annotated?: boolean;
}

export function EntryArticle({ dict, entry, annotated = false }: Props) {
  const { taxonomy } = dict;
  const family = familyOfDomain(taxonomy, entry.domain);
  const position = dict.position.get(entry.id) ?? 0;
  const prev = dict.entries[position - 1];
  const next = dict.entries[position + 1];
  const rank = levelRank(taxonomy, entry.level);
  const tokens = tokenize(entry.term);
  const backlinks = dict.backlinks.get(entry.id) ?? [];
  const seeAlso = (entry.see_also ?? [])
    .map((n) => dict.resolver.resolve(n))
    .filter((id): id is string => !!id);
  const contrast = (entry.contrast ?? [])
    .map((n) => dict.resolver.resolve(n))
    .filter((id): id is string => !!id);
  const labelTitle = (l: string) => taxonomy.labels[l] ?? "";
  const A = (n: number): ReactNode =>
    annotated ? (
      <span
        className="mx-1 inline-grid size-[22px] place-items-center bg-fam-ink align-[4px] font-mono font-medium text-fam text-xs not-italic leading-none [.e-main_&]:bg-ink [.e-main_&]:text-paper [.e-side_&]:bg-ink [.e-side_&]:text-paper"
        aria-hidden="true"
      >
        {n}
      </span>
    ) : null;

  const single = entry.senses.length === 1;
  // On the About page the specimen sits under the page's own headings.
  const Headword = annotated ? "p" : "h1";
  const blockLevel = annotated ? "h3" : "h2";
  const isOrg = entry.domain === "orgs";

  return (
    <article className={`fam-${family.n} ${annotated ? "" : "fade-in"}`}>
      {!annotated && <EntryClient id={entry.id} prev={prev?.id} next={next?.id} />}
      <section
        className={`bg-fam text-fam-ink ${annotated ? "px-[18px] py-[22px] sm:px-7 sm:py-[26px]" : "px-5 py-[26px] sm:px-10 sm:py-[34px]"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
          <div className="kick flex flex-wrap items-stretch border-current border-b">
            <Link
              href={domainPath(entry.domain)}
              className="link-quiet inline-flex min-h-11 items-center"
            >
              {taxonomy.domains[entry.domain]?.name}
            </Link>
            {(entry.domains ?? []).map((d) => (
              <span key={d}>
                <span className="mx-2.5 self-center opacity-55" aria-hidden="true">
                  /
                </span>
                <Link href={domainPath(d)} className="link-quiet inline-flex min-h-11 items-center">
                  {taxonomy.domains[d]?.name ?? d}
                </Link>
              </span>
            ))}
            {A(3)}
          </div>
          {entry.labels?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {entry.labels.map((l) => (
                <Label key={l} label={l} title={labelTitle(l)} />
              ))}
            </div>
          ) : null}
        </div>
        <Headword
          className={`${annotated ? "my-4 mb-4 text-[52px]" : "mt-[26px] mb-5 text-[clamp(44px,7vw,86px)]"} leading-none tracking-[-0.022em] [overflow-wrap:anywhere]`}
        >
          {entry.term}
          {A(1)}
        </Headword>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5 border-current border-b pb-5 font-mono text-[15px] leading-normal">
          <span className="italic" title={entry.pos}>
            {taxonomy.pos[entry.pos] ?? entry.pos}
            {A(2)}
          </span>
          {entry.pronunciation && <span>/{entry.pronunciation}/</span>}
          {entry.also?.length ? (
            <span>
              Also:{" "}
              {entry.also.map((a, i) => (
                <Fragment key={a}>
                  {i > 0 && ", "}
                  <LangText text={a} />
                </Fragment>
              ))}
            </span>
          ) : null}
        </div>
        <p className="mt-[22px] max-w-[33em] font-normal text-[clamp(21px,2.4vw,28px)] leading-[1.5]">
          <span className="mb-2.5 block font-mono text-sm leading-normal">
            In plain words{A(5)}
          </span>
          {entry.plain}
        </p>
      </section>

      <div
        className={
          annotated
            ? "mt-7 grid gap-7 px-[18px] pb-[22px] sm:px-7 sm:pb-7"
            : "mt-[46px] grid items-start gap-9 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10 lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[216px_minmax(0,680px)_200px] xl:justify-between"
        }
      >
        <aside
          className={`e-side grid content-start gap-[30px] font-mono text-sm leading-normal ${annotated ? "grid-cols-1 gap-x-6 gap-y-[22px] sm:grid-cols-2" : "grid-cols-1 sm:max-md:grid-cols-2"}`}
          aria-label="About this word"
        >
          {entry.dates ? (
            <SideBox label="Dates">
              <span className="font-serif font-semibold text-3xl leading-none tracking-[-0.02em]">
                {entry.dates}
              </span>
            </SideBox>
          ) : (
            <SideBox
              label={
                <>
                  {isOrg ? "Founded" : "Born"}
                  {A(8)}
                </>
              }
            >
              {entry.year !== undefined ? (
                <Link
                  href={yearPath(dict.decades, entry.year)}
                  className="link-quiet font-serif font-semibold text-[46px] leading-none tracking-[-0.02em] tabular-nums hover:decoration-2"
                >
                  {yearLabel(entry.year)}
                </Link>
              ) : (
                <span className="font-serif font-semibold text-[46px] leading-none tracking-[-0.02em]">
                  —
                </span>
              )}
              <span className="mt-2 block text-ink-3 text-sm">
                {entry.year !== undefined
                  ? isOrg
                    ? "Year founded"
                    : "First known use in this sense"
                  : "Year not established"}
              </span>
            </SideBox>
          )}
          <SideBox label="Level">
            {taxonomy.levels[entry.level]}
            <div className="mt-2.5 flex gap-1" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <i
                  key={n}
                  className={`h-2 w-5 border border-ink ${rank <= 4 - n ? "level-on bg-ink" : ""}`}
                />
              ))}
            </div>
          </SideBox>
          {tokens.length > 0 && (
            <SideBox label={<>As a model reads it{A(4)}</>}>
              <ul className="m-0 flex list-none flex-wrap gap-1 p-0" aria-label="Tokens">
                {tokens.map((t, i) => (
                  <li
                    key={tokens.slice(0, i + 1).join("|")}
                    className="whitespace-pre border border-line px-1.5 py-px text-xs"
                  >
                    {t.startsWith(" ") ? (
                      <>
                        <span className="text-ink-3" aria-hidden="true">
                          ␣
                        </span>
                        {t.slice(1)}
                      </>
                    ) : (
                      t
                    )}
                  </li>
                ))}
              </ul>
              <span className="mt-2 block text-ink-3 text-sm">
                {tokens.length} {tokens.length === 1 ? "token" : "tokens"} in the o200k tokenizer
              </span>
            </SideBox>
          )}
          {entry.as_of && <SideBox label="Current as of">{monthLabel(entry.as_of)}</SideBox>}
          {!annotated && (
            <>
              <div className="sm:max-md:col-span-2">
                <EntryActions
                  id={entry.id}
                  citation={citation(dict, entry)}
                  url={absoluteUrl(dict, entryPath(entry.id))}
                  text={entryText(dict, entry)}
                />
              </div>
              <div className="hidden md:block xl:hidden">
                <Nearby dict={dict} entry={entry} />
              </div>
            </>
          )}
        </aside>

        <div className="e-main min-w-0">
          <ol className="m-0 grid list-none gap-[30px] p-0">
            {entry.senses.map((sense, k) => (
              <li
                key={sense.definition}
                className={`grid ${single ? "" : "grid-cols-[38px_minmax(0,1fr)]"}`}
              >
                {!single && (
                  <span className="font-semibold text-[22px] leading-[1.32]">{k + 1}</span>
                )}
                <div>
                  {(sense.context || sense.labels?.length) && (
                    <p className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-ink-2 text-sm">
                      {sense.context && <span>{sense.context}</span>}
                      {sense.labels?.map((l) => (
                        <Label key={l} label={l} title={labelTitle(l)} />
                      ))}
                    </p>
                  )}
                  <p>
                    <RichText dict={dict} text={sense.definition} />
                    {k === 0 && A(6)}
                  </p>
                  {sense.example && (
                    <p className="mt-3 border-line border-l pl-4 text-ink-2 italic">
                      <RichText dict={dict} text={sense.example} />
                      {k === 0 && A(7)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {entry.formula_latex && (
            <div
              className="mt-8 overflow-x-auto border border-line p-5 text-center text-[21px]"
              role="math"
              aria-label="Formula"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: MathML generated by KaTeX from formula_latex at build time
              dangerouslySetInnerHTML={{ __html: renderFormula(entry.formula_latex) }}
            />
          )}

          {entry.origin && (
            <Block level={blockLevel} title={<>Origin{A(8)}</>}>
              <p>
                <RichText dict={dict} text={entry.origin} />
              </p>
            </Block>
          )}
          {entry.note && (
            <Block level={blockLevel} title={<>Usage note{A(9)}</>}>
              <p>
                <RichText dict={dict} text={entry.note} />
              </p>
            </Block>
          )}
          {(seeAlso.length > 0 || contrast.length > 0) && (
            <Block level={blockLevel} title="Related">
              <div className="grid gap-3.5">
                {seeAlso.length > 0 && (
                  <RelatedRow dict={dict} label={<>See also{A(10)}</>} ids={seeAlso} />
                )}
                {contrast.length > 0 && (
                  <RelatedRow dict={dict} label="Contrast with" ids={contrast} />
                )}
              </div>
            </Block>
          )}
          {entry.sources?.length ? (
            <Block level={blockLevel} title={<>Sources{A(11)}</>}>
              <ol className="m-0 grid list-decimal gap-2 pl-[1.4em] text-[16px] text-ink-2">
                {entry.sources.map((s) => (
                  <li key={s.text}>
                    {s.text}
                    {s.url && (
                      <>
                        {" "}
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener"
                          className="font-mono text-ink-3 text-sm [overflow-wrap:anywhere]"
                        >
                          {s.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </Block>
          ) : null}
          {entry.standards && (
            <Block level={blockLevel} title={<>Defined in law or standards{A(12)}</>}>
              <p>
                <RichText dict={dict} text={entry.standards} />
              </p>
            </Block>
          )}
          {!annotated && backlinks.length > 0 && (
            <Block level={blockLevel} title="Mentioned in">
              <p className="text-[16.5px] text-ink-2 leading-[1.7]">
                {backlinks.map((id, i) => (
                  <span key={id}>
                    {i > 0 && ", "}
                    <EntryLink dict={dict} id={id} />
                  </span>
                ))}
              </p>
            </Block>
          )}
          {!annotated && (
            <nav
              className="mt-[72px] grid border border-line sm:grid-cols-2"
              aria-label="Neighboring entries"
            >
              {prev ? (
                <Link
                  href={entryPath(prev.id)}
                  className="group flex min-w-0 flex-col gap-1.5 px-[22px] pt-[18px] pb-5 no-underline hover:bg-ink hover:text-paper"
                >
                  <span className="font-mono text-ink-3 text-sm group-hover:text-inherit">
                    ← Previous
                  </span>
                  <b className="font-semibold text-[22px] leading-[1.2] [overflow-wrap:anywhere]">
                    {prev.term}
                  </b>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={entryPath(next.id)}
                  className="group flex min-w-0 flex-col items-end gap-1.5 border-line border-t px-[22px] pt-[18px] pb-5 text-right no-underline hover:bg-ink hover:text-paper sm:border-t-0 sm:border-l"
                >
                  <span className="font-mono text-ink-3 text-sm group-hover:text-inherit">
                    Next →
                  </span>
                  <b className="font-semibold text-[22px] leading-[1.2] [overflow-wrap:anywhere]">
                    {next.term}
                  </b>
                </Link>
              )}
            </nav>
          )}
        </div>

        {!annotated && (
          <aside
            className="sticky top-[calc(env(safe-area-inset-top,0px)+var(--navh)+28px)] hidden min-w-0 font-mono text-sm leading-normal xl:block"
            aria-label="Nearby words"
          >
            <Nearby dict={dict} entry={entry} />
          </aside>
        )}
      </div>
    </article>
  );
}

/** A usage label. The pill links to its definition on the About page, so the meaning is one tap away. */
function Label({ label, title }: { label: string; title: string }) {
  return (
    <a
      href="/about#labels"
      className="inline-flex min-h-11 items-center no-underline"
      aria-label={`${label}: ${title}`}
      title={title}
    >
      <span className="whitespace-nowrap border border-current px-[7px] pt-[5px] pb-1 font-mono text-xs leading-none">
        {label}
      </span>
    </a>
  );
}

function SideBox({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div>
      <span className="mb-3 block border-line border-b pb-2 text-ink-2">{label}</span>
      {children}
    </div>
  );
}

function Block({
  title,
  children,
  level = "h2",
}: {
  title: ReactNode;
  children: ReactNode;
  level?: "h2" | "h3";
}) {
  const H = level;
  return (
    <section className="mt-[46px]">
      <H className="mb-3.5 border-line border-b pb-[9px] font-mono font-normal text-ink-2 text-sm">
        {title}
      </H>
      {children}
    </section>
  );
}

function RelatedRow({ dict, label, ids }: { dict: Dictionary; label: ReactNode; ids: string[] }) {
  return (
    <div className="grid gap-x-4 gap-y-1 sm:grid-cols-[132px_minmax(0,1fr)]">
      <span className="font-mono text-ink-3 text-sm leading-[1.9]">{label}</span>
      <ul className="m-0 flex list-none flex-wrap p-0 [&>li+li]:before:mx-[0.5em] [&>li+li]:before:text-ink-3 [&>li+li]:before:content-['·']">
        {ids.map((id) => (
          <li key={id}>
            <EntryLink dict={dict} id={id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Nearby({ dict, entry }: { dict: Dictionary; entry: Entry }) {
  const i = dict.position.get(entry.id) ?? 0;
  const from = Math.max(0, i - 6);
  const to = Math.min(dict.entries.length, i + 7);
  const letter = letterOf(sortKey(entry));
  return (
    <div>
      <span className="mb-3 block border-line border-b pb-2 text-ink-2">Nearby</span>
      <ol className="m-0 list-none p-0">
        {dict.entries.slice(from, to).map((e) => (
          <li key={e.id}>
            <Link
              href={entryPath(e.id)}
              aria-current={e.id === entry.id ? "page" : undefined}
              className="block overflow-hidden text-ellipsis whitespace-nowrap py-[11.5px] text-ink-3 no-underline hover:text-ink hover:underline aria-[current=page]:text-ink aria-[current=page]:before:content-['→_']"
            >
              {e.term}
            </Link>
          </li>
        ))}
      </ol>
      <Link
        href={letterPath(letter)}
        className="mt-1 inline-flex min-h-11 items-center text-ink underline"
        aria-label={`All of ${letter} in the A–Z`}
      >
        All of {letter}
      </Link>
    </div>
  );
}

export function entryCount(n: number): string {
  return `${nf(n)} ${n === 1 ? "entry" : "entries"}`;
}
