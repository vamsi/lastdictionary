"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useStarred } from "@/hooks/use-local-list";
import { nf } from "@/lib/format";
import type { PreparedIndex } from "@/lib/search";
import { loadSearchIndex } from "@/lib/search-client";
import type { SearchEntry } from "@/lib/search-index";
import { entryPath } from "@/lib/site";
import { letterPath } from "./letters";

export interface AzBrowserProps {
  levels: { rank: number; name: string }[];
  labels: string[];
  domainGroups: { family: string; domains: { code: string; name: string; count: number }[] }[];
  total: number;
  /** What to show when no filter is active: the server-rendered letter overview. */
  children: ReactNode;
}

const chip =
  "h-auto cursor-pointer rounded-none border border-line bg-transparent px-2.5 pt-[7px] pb-1.5 font-mono text-[13px] leading-none hover:bg-paper-2 data-pressed:bg-ink data-pressed:text-paper data-pressed:hover:bg-ink";

/** Level, label and domain filters over every word. Unfiltered, the letter overview shows through. */
export function AzBrowser({ levels, labels, domainGroups, total, children }: AzBrowserProps) {
  const [levelSel, setLevelSel] = useState<string[]>([]);
  const [labelSel, setLabelSel] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [index, setIndex] = useState<PreparedIndex | null>(null);
  const { starred } = useStarred();
  const active = levelSel.length > 0 || labelSel.length > 0 || domain !== "";

  useEffect(() => {
    if (active && !index)
      loadSearchIndex()
        .then(setIndex)
        .catch(() => setIndex(null));
  }, [active, index]);

  const passes = (e: SearchEntry) => {
    if (levelSel.length && !levelSel.includes(String(e.v))) return false;
    if (domain && e.d !== domain && !e.ds?.includes(domain)) return false;
    for (const l of labelSel) {
      if (l === "starred" ? !starred.includes(e.id) : !e.l?.includes(l)) return false;
    }
    return true;
  };

  const filtered = active && index ? index.items.map((i) => i.entry).filter(passes) : null;
  const groups: { letter: string; items: SearchEntry[] }[] = [];
  for (const e of filtered ?? []) {
    const last = groups[groups.length - 1];
    if (last && last.letter === e.k) last.items.push(e);
    else groups.push({ letter: e.k, items: [e] });
  }

  const clear = () => {
    setLevelSel([]);
    setLabelSel([]);
    setDomain("");
  };

  return (
    <>
      <fieldset className="flex flex-wrap items-center gap-x-7 gap-y-3 border-line border-b py-4 font-mono text-sm">
        <legend className="sr-only">Filters</legend>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-ink-3">Level</span>
          <ToggleGroup
            multiple
            value={levelSel}
            onValueChange={(v) => setLevelSel(v as string[])}
            spacing={1.5}
          >
            {levels.map((l) => (
              <ToggleGroupItem key={l.rank} value={String(l.rank)} className={chip}>
                {l.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-ink-3">Label</span>
          <ToggleGroup
            multiple
            value={labelSel}
            onValueChange={(v) => setLabelSel(v as string[])}
            spacing={1.5}
          >
            {[...labels, "starred"].map((l) => (
              <ToggleGroupItem key={l} value={l} className={chip}>
                {l === "starred" ? "★ starred" : l}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="mr-1 text-ink-3" htmlFor="az-domain">
            Domain
          </label>
          <select
            id="az-domain"
            value={domain}
            onChange={(ev) => setDomain(ev.target.value)}
            className="max-w-full border border-line bg-paper px-2 py-1.5 font-mono text-[13px] text-ink"
          >
            <option value="">
              All {domainGroups.reduce((n, g) => n + g.domains.length, 0)} domains
            </option>
            {domainGroups.map((g) => (
              <optgroup key={g.family} label={g.family}>
                {g.domains.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({nf(d.count)})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3.5 text-ink-3 sm:ml-auto">
          <span>
            {active
              ? filtered
                ? `${nf(filtered.length)} of ${nf(total)} entries`
                : "Loading…"
              : `${nf(total)} entries`}
          </span>
          {active && (
            <button
              type="button"
              onClick={clear}
              className="cursor-pointer border-0 bg-transparent p-0 text-ink underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </fieldset>
      {!active ? (
        children
      ) : filtered ? (
        <>
          <LetterBar letters={groups.map((g) => g.letter)} anchors />
          {groups.map((g) => (
            <section key={g.letter}>
              <LetterHeading letter={g.letter} />
              <ul className="m-0 list-none p-0">
                {g.items.map((e) => (
                  <li
                    key={e.id}
                    className="grid gap-x-9 gap-y-1 border-line-2 border-b pt-[15px] pb-4 sm:grid-cols-[minmax(0,290px)_minmax(0,1fr)]"
                  >
                    <Link
                      href={entryPath(e.id)}
                      className="link-quiet font-semibold text-xl leading-[1.3] [overflow-wrap:anywhere]"
                    >
                      {e.t}
                    </Link>
                    <span className="text-[16.5px] text-ink-2 leading-normal">{e.pl}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {!groups.length && (
            <p className="py-6 text-ink-2">
              No entries match these filters.{" "}
              <button
                type="button"
                onClick={clear}
                className="cursor-pointer border-0 bg-transparent p-0 text-ink underline"
              >
                Clear filters
              </button>
            </p>
          )}
        </>
      ) : null}
    </>
  );
}

export const letterAnchor = (letter: string) => `az-${letter === "#" ? "num" : letter}`;

/** The row of letters. On letter pages it links between pages; in filtered views it jumps on the page. */
export function LetterBar({
  letters,
  current,
  anchors = false,
}: {
  letters: string[];
  current?: string;
  anchors?: boolean;
}) {
  return (
    <nav
      className="sticky top-[calc(env(safe-area-inset-top,0px)+var(--navh))] z-[6] flex flex-wrap border-line border-b bg-paper"
      aria-label="Jump to letter"
    >
      {letters.map((l) => (
        <a
          key={l}
          href={anchors ? `#${letterAnchor(l)}` : letterPath(l)}
          aria-current={l === current ? "page" : undefined}
          className="grid h-[38px] min-w-[34px] place-items-center font-semibold text-[17px] no-underline hover:bg-ink hover:text-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper"
        >
          {l}
        </a>
      ))}
    </nav>
  );
}

export function LetterHeading({ letter }: { letter: string }) {
  return (
    <h2
      id={letterAnchor(letter)}
      className="mt-[46px] mb-4 scroll-mt-[calc(var(--navh)+64px)] border-line border-b pb-3 text-[56px] leading-none"
    >
      {letter}
    </h2>
  );
}
