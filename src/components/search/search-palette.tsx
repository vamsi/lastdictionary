"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RECENT_KEY, useLocalList } from "@/hooks/use-local-list";
import { nf } from "@/lib/format";
import { highlightRange, type PreparedIndex, type SearchHit, search } from "@/lib/search";
import { loadSearchIndex } from "@/lib/search-client";
import type { SearchEntry } from "@/lib/search-index";
import { entryPath } from "@/lib/site";
import { useSearch } from "./search-provider";

interface Props {
  domainNames: Record<string, string>;
  tryWords: string[];
  total: number;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const range = query.trim() ? highlightRange(text, query) : null;
  if (!range) return <>{text}</>;
  return (
    <>
      {range[0]}
      <mark>{range[1]}</mark>
      {range[2]}
    </>
  );
}

/** The look-up dialog: opens with `/` or ⌘K, searches as you type, arrows to move, enter to open. */
export function SearchPalette({ domainNames, tryWords, total }: Props) {
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<PreparedIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(0);
  const recent = useLocalList(RECENT_KEY);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Global shortcuts.
  useEffect(() => {
    const onKey = (ev: globalThis.KeyboardEvent) => {
      if ((ev.key === "k" || ev.key === "K") && (ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault();
        setOpen(!open);
        return;
      }
      if (open || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (ev.key === "/" && !typing) {
        ev.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Load the index when the dialog first opens; reset the query each time.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected(0);
    if (!index) {
      loadSearchIndex()
        .then(setIndex)
        .catch(() => setFailed(true));
    }
  }, [open, index]);

  // Close after navigating.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setOpen(false);
    }
  }, [pathname, setOpen]);

  const searching = query.trim().length > 0;
  const hits: SearchHit[] = index && searching ? search(index, query) : [];
  const idle: { heading: string; items: SearchEntry[] }[] = [];
  if (index && !searching) {
    const recentItems = recent
      .map((id) => index.byId.get(id))
      .filter((e): e is SearchEntry => !!e)
      .slice(0, 5);
    if (recentItems.length) idle.push({ heading: "Recently viewed", items: recentItems });
    const tries = tryWords
      .filter((id) => !recent.includes(id))
      .map((id) => index.byId.get(id))
      .filter((e): e is SearchEntry => !!e);
    if (tries.length) idle.push({ heading: "Try", items: tries });
  }
  const options: SearchEntry[] = searching
    ? hits.map((h) => h.entry)
    : idle.flatMap((g) => g.items);
  const current = Math.min(selected, Math.max(options.length - 1, 0));
  const optionId = (i: number) => `${listId}-${i}`;

  const go = (id: string) => {
    setOpen(false);
    router.push(entryPath(id));
  };

  const onKeyDown = (ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      if (!options.length) return;
      ev.preventDefault();
      const next =
        ev.key === "ArrowDown"
          ? Math.min(current + 1, options.length - 1)
          : Math.max(current - 1, 0);
      setSelected(next);
      document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
    } else if (ev.key === "Enter") {
      const id = options[current]?.id;
      if (id) {
        ev.preventDefault();
        go(id);
      }
    }
  };

  let count: string;
  if (!index) count = failed ? "Search is unavailable" : "Loading…";
  else if (!searching) count = `${nf(total)} entries`;
  else if (!hits.length) count = "No matches";
  else if (hits.length === 80) count = "Top 80 matches";
  else count = `${nf(hits.length)} ${hits.length === 1 ? "match" : "matches"}`;

  // Options are numbered across both the result list and the idle groups.
  let k = -1;
  const renderOption = (e: SearchEntry, via: string | null) => {
    k++;
    const i = k;
    return (
      <div
        key={e.id}
        role="option"
        tabIndex={-1}
        id={optionId(i)}
        aria-selected={i === current}
        onMouseMove={() => i !== current && setSelected(i)}
        className="aria-selected:bg-ink aria-selected:text-paper [&[aria-selected=true]_.m]:text-inherit [&[aria-selected=true]_.m]:opacity-80 [&[aria-selected=true]_.pl]:text-inherit [&[aria-selected=true]_.pl]:opacity-80"
      >
        <Link
          href={entryPath(e.id)}
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="grid gap-[3px] px-[var(--gut)] py-3 pb-[13px] no-underline sm:px-[18px]"
        >
          <span className="flex min-w-0 items-baseline gap-2.5">
            <span className="font-semibold text-[19px] leading-[1.25]">
              <Highlight text={e.t} query={query} />
            </span>
            <span className="m font-mono text-[12.5px] text-ink-3">{e.p}</span>
            <span className="m ml-auto max-w-[46%] overflow-hidden text-ellipsis whitespace-nowrap pl-3 font-mono text-[12.5px] text-ink-3">
              {domainNames[e.d] ?? e.d}
            </span>
          </span>
          {via && (
            <span className="m font-mono text-[12.5px] text-ink-3">
              also called “<Highlight text={via} query={query} />”
            </span>
          )}
          <span className="pl line-clamp-2 text-[15.5px] text-ink-2 leading-[1.45]">{e.pl}</span>
        </Link>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        initialFocus={inputRef}
        className="top-0 left-0 flex h-dvh max-h-none w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 border-0 bg-paper p-0 text-ink shadow-none ring-0 sm:top-[calc(env(safe-area-inset-top,0px)+9vh)] sm:left-1/2 sm:h-auto sm:max-h-[min(680px,80vh)] sm:w-[min(720px,calc(100%-32px))] sm:-translate-x-1/2 sm:border sm:border-line sm:shadow-panel"
      >
        <DialogTitle className="sr-only">Search the dictionary</DialogTitle>
        <div className="flex shrink-0 items-center gap-3 border-line border-b pl-[var(--gut)] sm:pl-[18px]">
          <Search className="size-[18px] shrink-0 text-ink-2" strokeWidth={1.6} />
          <label className="sr-only" htmlFor={`${listId}-input`}>
            Look up a word
          </label>
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            value={query}
            onChange={(ev) => {
              setQuery(ev.target.value);
              setSelected(0);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            placeholder="Look up a word"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={options.length ? optionId(current) : undefined}
            className="h-[62px] min-w-0 flex-1 border-0 bg-transparent font-serif text-[22px] text-ink outline-0 placeholder:text-ink-3 placeholder:italic [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="cursor-pointer self-stretch border-line border-l px-4 font-mono text-[13px] hover:bg-ink hover:text-paper"
          >
            esc
          </button>
        </div>
        <div
          id={listId}
          role="listbox"
          aria-label="Matching words"
          className="flex-1 overflow-y-auto overscroll-contain [&>div+div]:border-line-2 [&>div+div]:border-t"
        >
          {searching && hits.map((h) => renderOption(h.entry, h.via))}
          {searching && index && !hits.length && (
            <div className="px-[var(--gut)] py-[22px] text-ink-2 sm:px-[18px]">
              No entry for “{query}” yet. Try a shorter or more general word, or browse the{" "}
              <Link href="/a-z" onClick={() => setOpen(false)}>
                A–Z
              </Link>
              .
            </div>
          )}
          {!searching &&
            idle.map((group) => (
              <div key={group.heading} className="[&+div]:border-t-0">
                <div className="px-[var(--gut)] pt-4 pb-1.5 font-mono text-[12.5px] text-ink-3 sm:px-[18px]">
                  {group.heading}
                </div>
                <div className="[&>div+div]:border-line-2 [&>div+div]:border-t">
                  {group.items.map((e) => renderOption(e, null))}
                </div>
              </div>
            ))}
        </div>
        <div className="flex shrink-0 justify-between gap-3 border-line border-t px-[var(--gut)] py-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] font-mono text-[12.5px] text-ink-3 sm:px-[18px] sm:pb-2.5">
          <span className="hidden sm:inline">↑ ↓ to move · ↵ to open · esc to close</span>
          <span>{count}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
