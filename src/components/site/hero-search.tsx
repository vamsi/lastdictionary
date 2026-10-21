"use client";

import { Search } from "lucide-react";
import { useSearch } from "@/components/search/search-provider";
import { loadSearchIndex } from "@/lib/search-client";

export function HeroSearch() {
  const { openSearch } = useSearch();
  return (
    <button
      type="button"
      onClick={openSearch}
      onPointerEnter={() => void loadSearchIndex()}
      aria-label="Look up a word"
      className="mt-2 flex h-14 w-full cursor-text items-stretch border border-line bg-paper p-0 text-left"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden whitespace-nowrap px-4 font-mono text-[15px] text-ink-3">
        <Search className="size-4 shrink-0" strokeWidth={1.6} />
        Look up a word
      </span>
      <span className="flex items-center bg-ink px-[22px] font-mono text-paper text-sm">
        Search
      </span>
    </button>
  );
}
