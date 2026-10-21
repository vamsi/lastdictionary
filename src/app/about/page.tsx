import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EntryArticle } from "@/components/entry/entry-article";
import { JsonLd } from "@/components/json-ld";
import Link from "@/components/link";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { citation, domainPath, entryPath } from "@/lib/site";
import { breadcrumbs, pageGraph, webPageNode } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "About",
  description: "What The Last Dictionary is, how to read an entry, and how the edition was made.",
  alternates: { canonical: "/about" },
};

const SECTIONS = [
  ["preface", "Preface"],
  ["read", "How to read an entry"],
  ["labels", "Labels and abbreviations"],
  ["principles", "Editorial principles"],
  ["lineage", "Lineage"],
  ["edition", "Edition and citation"],
  ["contribute", "Contribute"],
] as const;

const KEY: [string, ReactNode][] = [
  ["Headword", "The word as it is most often written."],
  [
    "Part of speech and other names",
    <>
      Noun, verb, adjective, abbreviation, phrase or proper noun, with a simple respelling where the
      reading is not obvious. Other names and abbreviations follow <i>Also</i> and work in search.
    </>,
  ],
  [
    "Domains and labels",
    <>
      The home domain comes first, then neighboring domains, then labels such as <i>emerging</i> or{" "}
      <i>contested</i>.
    </>,
  ],
  [
    "As a model reads it",
    "The headword split into tokens by the open o200k tokenizer: how a language model actually sees the word.",
  ],
  ["In plain words", "One or two sentences anyone can follow. Start here."],
  [
    "Senses",
    "The precise definitions, numbered when a word has several meanings, each with its context.",
  ],
  ["Example", "The word used the way practitioners use it."],
  [
    "Origin and birth year",
    "Who introduced the word, when and where, stated with the confidence the evidence supports. The year places the word on the timeline.",
  ],
  ["Usage note", "Common confusions, disputes and advice on usage."],
  [
    "Related",
    <>
      <i>See also</i> points to neighboring ideas. <i>Contrast with</i> points to opposites and
      easily confused terms, a convention borrowed from the IBM Dictionary of Computing.
    </>,
  ],
  ["Sources", "Primary sources for the origin and the definition, with links where available."],
  [
    "Law and standards",
    <>
      Where a statute or standard defines the term, the instrument and article. Time-sensitive
      entries also carry an <i>as of</i> date.
    </>,
  ],
];

const PRINCIPLES: [string, string][] = [
  [
    "Two layers, one truth.",
    "Every entry opens with a plain-words definition, then gives the technical one. Neither contradicts the other.",
  ],
  [
    "Every word has a birth certificate.",
    "We say coined by only when the evidence shows first use; otherwise introduced, popularized or earliest known use.",
  ],
  [
    "Senses, not soup.",
    "Words with several meanings, such as harness, kernel, bias, token and inference, get numbered senses with their contexts.",
  ],
  [
    "Describe usage and label it honestly.",
    "We record how words are used, including slang, and mark what is emerging, contested, historical or deprecated.",
  ],
  [
    "Map disagreements; don't settle them.",
    "On AGI, emergence, consciousness and risk, entries set out the positions and who holds them.",
  ],
  ["Standards-aware.", "Where law or a standard defines a term, the entry says so."],
  [
    "Dated, because the field moves.",
    "Anything that can change carries an as of date. The dictionary is issued in numbered editions.",
  ],
  ["Connected.", "Every entry links to related and contrasting entries. There are no dead ends."],
  [
    "Original and safe.",
    "Definitions are written fresh, not copied. Entries on attacks and misuse explain concepts and defenses, never procedures.",
  ],
];

export default function AboutPage() {
  const dict = getDictionary();
  const { meta, taxonomy, entries } = dict;
  const specimen = dict.byId.get(meta.specimen);
  const count = nf(entries.length);
  return (
    <div className="wrap fade-in">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: "/about",
            name: "About this dictionary",
            description:
              "What The Last Dictionary is, how to read an entry, and how the edition was made.",
            type: "AboutPage",
            breadcrumb: breadcrumbs(dict, [{ name: "About this dictionary", path: "/about" }]),
          }),
        )}
      />
      <PageHeader kicker="Front matter · First Edition" title="About this dictionary">
        What it is, how to read an entry, and how the edition was made.
      </PageHeader>
      <div className="grid items-start gap-7 lg:grid-cols-[236px_minmax(0,700px)] lg:gap-[60px]">
        <nav
          className="flex flex-wrap gap-x-[18px] gap-y-2 border-line border-b pb-3.5 font-mono text-sm lg:sticky lg:top-[calc(env(safe-area-inset-top,0px)+var(--navh)+28px)] lg:grid lg:gap-[9px] lg:border-b-0 lg:pb-0"
          aria-label="On this page"
        >
          <span className="hidden border-line border-b pb-2 text-ink-2 lg:block">On this page</span>
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="link-quiet flex min-h-11 items-center">
              {label}
            </a>
          ))}
        </nav>

        <div className="prose-about min-w-0 [&_h2]:mt-16 [&_h2]:mb-4 [&_h2]:scroll-mt-[calc(var(--navh)+20px)] [&_h2]:border-line [&_h2]:border-t [&_h2]:pt-[18px] [&_h2]:text-[32px] [&_h2]:leading-[1.15] [&_h2:first-child]:mt-0 [&_h2:first-child]:border-t-0 [&_h2:first-child]:pt-0 [&_h3]:mt-8 [&_h3]:mb-2.5 [&_h3]:font-mono [&_h3]:font-normal [&_h3]:text-ink-2 [&_h3]:text-sm [&_p]:mb-4">
          <h2 id="preface">Preface</h2>
          <p>
            In 1993 IBM published the tenth edition of its <i>Dictionary of Computing</i>. It
            defined about 18,000 terms, and many carried a small letter telling you which standards
            body stood behind the definition. It gave an industry a shared vocabulary at the moment
            that industry was remaking the world.
          </p>
          <p>
            Artificial intelligence has reached that moment, and its vocabulary moves faster than
            any printed book. In 2023 people rarely called the software around an AI agent a{" "}
            <Link href={entryPath("harness")}>harness</Link>; by 2026 researchers were publishing
            papers on what exactly counts as one.{" "}
            <Link href={entryPath("vibe-coding")}>Vibe coding</Link> went from a single social media
            post to everyday speech within a year. Older words such as{" "}
            <Link href={entryPath("inference")}>inference</Link> and{" "}
            <Link href={entryPath("bias")}>bias</Link> took on new senses along the way. Even the
            name of the field is now in play: in September 2026 a{" "}
            <Link href={entryPath("executive-order-14434")}>US executive order</Link> directed
            federal agencies to say "Super Intelligence" where they had said "artificial
            intelligence."
          </p>
          <p>
            <i>The Last Dictionary</i> records that language in {count} entries, from Bayes' theorem
            and the perceptron to agents and superintelligence. It is written for three readers at
            once. The newcomer gets a plain-words definition at the top of every entry. The
            practitioner gets precise senses, formulas and primary sources. The decision-maker gets
            labels for what is emerging or contested, and markers for terms that laws and standards
            define.
          </p>
          <p>
            Every entry also carries a birth certificate: who introduced the word, when and where,
            stated only as firmly as the evidence allows. Read in order, those dates tell the
            history of the field one word at a time. The <Link href="/timeline">timeline</Link> lays
            them out.
          </p>
          <p>
            The name is a pun. <i>Last</i> as in final, the way Fermat's Last Theorem was the last
            of Fermat's claims to be settled; and also the latest, and meant to last. The{" "}
            <Link href={entryPath("the-last-dictionary")}>entry for the book itself</Link> says a
            little more.
          </p>
          <p>
            This first edition was researched and drafted with AI assistance and then fact-checked
            entry by entry by reviewers who had not written the entries. It will still contain
            errors. A dictionary of a field this young has to be corrected and reissued, as IBM's
            was through ten editions. That is why its source is open: every entry can be{" "}
            <a href="#contribute">corrected by anyone</a>.
          </p>

          {specimen && (
            <>
              <h2 id="read">How to read an entry</h2>
              <p>
                Every entry follows the same anatomy. Here is the entry for{" "}
                <Link href={entryPath(specimen.id)}>{specimen.term}</Link>, a word whose meaning has
                changed three times, with each part numbered.
              </p>
              <div className="mt-[22px] border border-line">
                <EntryArticle dict={dict} entry={specimen} annotated />
              </div>
              <ol className="m-0 mt-[26px] grid list-none gap-3.5 p-0 text-[16.5px]">
                {KEY.map(([name, desc], k) => (
                  <li key={name} className="grid grid-cols-[30px_minmax(0,1fr)] gap-2">
                    <span className="inline-grid size-5 place-items-center bg-ink font-mono font-medium text-[11px] text-paper leading-none">
                      {k + 1}
                    </span>
                    <div>
                      <b>{name}.</b> {desc}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          <h2 id="labels">Labels and abbreviations</h2>
          <h3>Parts of speech</h3>
          <Table>
            {Object.entries(taxonomy.pos).map(([abbr, name]) => (
              <tr key={abbr}>
                <th scope="row">{abbr}</th>
                <td>
                  {abbr === "prop. n." ? "proper noun: a named system, law, event or work" : name}
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row">s.v.</th>
              <td>
                <i>sub verbo</i>, "under the word": used when citing an entry
              </td>
            </tr>
          </Table>
          <h3>Labels</h3>
          <Table>
            {Object.entries(taxonomy.labels).map(([label, desc]) => (
              <tr key={label}>
                <th scope="row">
                  <span className="whitespace-nowrap border border-current px-[7px] pt-[5px] pb-1 font-mono text-xs text-ink leading-none">
                    {label}
                  </span>
                </th>
                <td>{desc}</td>
              </tr>
            ))}
          </Table>
          <h3>Levels</h3>
          <Table>
            <tr>
              <th scope="row">Essential</th>
              <td>
                A newcomer needs it to follow AI news. There are {nf(dict.essentials.length)}; see{" "}
                <Link href="/essentials">the essentials</Link>.
              </td>
            </tr>
            <tr>
              <th scope="row">Core</th>
              <td>The working vocabulary of practitioners.</td>
            </tr>
            <tr>
              <th scope="row">Specialist</th>
              <td>Research vocabulary and niche terms.</td>
            </tr>
          </Table>
          <h3>Families and domains</h3>
          <Table>
            {dict.families.map((f) =>
              f.domains.map((d, k) => (
                <tr key={d}>
                  {k === 0 && (
                    <th scope="rowgroup" rowSpan={f.domains.length}>
                      {f.name}
                    </th>
                  )}
                  <td>
                    <Link href={domainPath(d)}>{taxonomy.domains[d]?.name}</Link>
                  </td>
                  <td className="font-mono text-[13.5px] text-ink-3">
                    {nf(dict.domainCounts[d] ?? 0)}
                  </td>
                </tr>
              )),
            )}
          </Table>
          <h3>Cross-references</h3>
          <p>
            <b>Also</b> lists other names and abbreviations. <b>See also</b> points to related
            entries. <b>Contrast with</b> points to opposites and easily confused neighbors.{" "}
            <b>Mentioned in</b> lists the entries that link to this one. Links inside a definition
            show a plain-words preview when you hover over them.
          </p>
          <h3>Law and standards</h3>
          <p>
            IBM's dictionary marked definitions taken from American (A) and international (I, T)
            standards. This dictionary keeps the idea for the AI era. Where a statute or standard
            defines a term, such as the EU AI Act, ISO/IEC 22989 or the NIST AI Risk Management
            Framework, the entry names the instrument and the article, paraphrased rather than
            quoted.
          </p>

          <h2 id="principles">Editorial principles</h2>
          <ol className="m-0 grid gap-2.5 pl-[1.3em]">
            {PRINCIPLES.map(([lead, rest]) => (
              <li key={lead}>
                <b>{lead}</b> {rest}
              </li>
            ))}
          </ol>

          <h2 id="lineage">Lineage</h2>
          <p>Four computing dictionaries shaped this one. Each solved a different problem.</p>
          <Lineage
            year="1993"
            title="IBM Dictionary of Computing, 10th edition"
            took="authority, standards markers, “Contrast with”."
          >
            Compiled by George McDaniel and published by McGraw-Hill (copyright 1994): about 18,000
            terms and abbreviations, for readers from novices to systems programmers. It grew out of
            IBM's in-house Data Processing Glossary and marked definitions drawn from the ANSI
            dictionary for information systems (A) and from ISO/IEC vocabularies (I, and T for
            drafts). IBM's own manuals cited it as their authority on terms, and it still turns up
            in patent litigation to settle what a technical term meant.
          </Lineage>
          <Lineage
            year="1983"
            title="Oxford Dictionary of Computing"
            took="readability, regular revision."
          >
            First published by Oxford University Press with Valerie Illingworth as editor, and
            revised through a sixth edition (John Daintith and Edmund Wright) of more than 6,500
            entries. Concise and readable, written for students.
          </Lineage>
          <Lineage
            year="1975"
            title="The Jargon File"
            took="the culture and slang, with usage notes."
          >
            Started by Raphael Finkel at Stanford to record hacker slang, edited into print by Guy
            Steele as <i>The Hacker's Dictionary</i> (1983) and by Eric S. Raymond as{" "}
            <i>The New Hacker's Dictionary</i> (MIT Press, 1991). It recorded a culture as well as a
            vocabulary, and was itself cited by style manuals.
          </Lineage>
          <Lineage year="1985" title="FOLDOC" took="hyperlinks everywhere, openness to correction.">
            The Free On-line Dictionary of Computing, started by Denis Howe and long hosted at
            Imperial College London. About 15,000 cross-linked entries, built with some 2,000
            contributors, and freely licensed so its text could flow into other projects.
          </Lineage>
          <p className="mt-[22px]">
            Modern AI glossaries also informed the scope: Google's Machine Learning Glossary, NIST's{" "}
            <i>The Language of Trustworthy AI</i> (AI 100-3, 2023) and the international standard
            ISO/IEC 22989:2022 on AI concepts and terminology. None of them covers the whole field,
            from classical statistics to agents, safety, law and slang, with origins for every term.
            That gap is why this dictionary exists.
          </p>

          <h2 id="edition">Edition and citation</h2>
          <p>
            {meta.edition}, {count} entries. Time-sensitive facts are current to the <i>as of</i>{" "}
            date shown in each entry.
          </p>
          <p>
            The whole dictionary is free to download as <a href="/data/dictionary.json">JSON</a> and{" "}
            <a href="/data/dictionary.csv">CSV</a>, and every entry is a small file in the{" "}
            <a href="https://github.com/vamsi/lastdictionary">source repository</a>. The text is
            licensed under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" rel="license">
              Creative Commons Attribution 4.0
            </a>
            ; the site's code is MIT licensed.
          </p>
          <p>
            To cite an entry, use <b>Copy citation</b> on the entry, which produces a reference
            like: <i>{specimen ? citation(dict, specimen) : null}</i>
          </p>
          <h3>How this edition was made</h3>
          <p>
            A master list of about 1,860 planned headwords was divided among forty contributing
            editors, with one owner for every word; the editors added some 850 more as they worked.
            Each editor researched and drafted entries against a common style guide, checking
            origins, dates and recent facts against primary sources and flagging every claim they
            could not confirm.
          </p>
          <p>
            A separate fact-checker, who had not written the entries, then reviewed every entry in
            every domain, resolving each flag and correcting errors. In fast-moving domains such as
            law, organizations and the newest vocabulary, a third or more of the entries needed a
            correction. Three further auditors then re-checked 166 randomly chosen entries. About
            one entry in twelve still had a factual error, usually a minor one, and about one in
            twenty had a passage that followed its source too closely. Every problem they found was
            corrected. A final originality sweep then compared each entry with the best-known
            published wording on its subject, such as encyclopedia openings, paper abstracts,
            documentation and legal texts, and rewrote more than a thousand passages that followed a
            source too closely, or credited the source by name. Similar errors surely remain in an
            edition of this size.
          </p>
          <p>The edition was compiled with Claude, an AI model made by Anthropic.</p>
          <h3>Colophon</h3>
          <p>
            Set in Newsreader, a typeface by Production Type made for reading on screens, whose
            optical sizes sharpen as the type grows, with DM Mono for labels and figures. The mark
            is the small square that ends a mathematical proof. Tokens are shown with the open o200k
            tokenizer through the gpt-tokenizer library. Formulas are rendered as MathML with KaTeX.
            The site is built with Next.js into plain static pages, one per word.
          </p>

          <h2 id="contribute">Contribute</h2>
          <p>
            The dictionary is maintained in the open at{" "}
            <a href="https://github.com/vamsi/lastdictionary">github.com/vamsi/lastdictionary</a>.
            Each entry is one small YAML file, so a correction is a one-file pull request, and a new
            word is a new file. Found an error?{" "}
            <a href="https://github.com/vamsi/lastdictionary/issues/new/choose">Open an issue</a>{" "}
            with the entry and a source, or fix it directly. The contributing guide explains the
            fields, the style rules and how to check your work before you send it.
          </p>
          <p>
            The site is built to WCAG 2.2 AAA where that is sensible; the{" "}
            <Link href="/accessibility">accessibility statement</Link> says what was tested, what
            the exceptions are, and how to report a problem.
          </p>
        </div>
      </div>
    </div>
  );
}

function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[16px] [&_td]:border-line-2 [&_td]:border-b [&_td]:py-[9px] [&_td]:pr-3.5 [&_td]:text-left [&_td]:align-top [&_th]:whitespace-nowrap [&_th]:border-line-2 [&_th]:border-b [&_th]:py-[9px] [&_th]:pr-3.5 [&_th]:text-left [&_th]:align-top [&_th]:font-mono [&_th]:font-normal [&_th]:text-[13.5px] [&_th]:text-ink-2">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Lineage({
  year,
  title,
  took,
  children,
}: {
  year: string;
  title: string;
  took: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-x-6 gap-y-1 border-line-2 border-t py-[22px] sm:grid-cols-[84px_minmax(0,1fr)]">
      <div className="font-semibold text-[28px] leading-none">{year}</div>
      <div>
        <h3 className="!mt-0 !mb-1.5 !font-serif !font-semibold !text-ink !text-xl !leading-[1.25]">
          {title}
        </h3>
        <p className="!mb-2">{children}</p>
        <p className="!mb-0 font-mono text-[13.5px] text-ink-2">We took: {took}</p>
      </div>
    </div>
  );
}
