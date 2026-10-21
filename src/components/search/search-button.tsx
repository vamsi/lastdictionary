"use client";

import { Search } from "lucide-react";
import { preloadSearch } from "@/components/search/search-root";
import { useSearch } from "./search-provider";

export function SearchButton() {
  const { openSearch } = useSearch();
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      onPointerEnter={preloadSearch}
      aria-label="Search the dictionary"
      className="flex shrink-0 cursor-pointer items-center gap-2.5 border-0 bg-ink px-3.5 font-mono text-sm text-paper hover:opacity-[0.88] sm:px-4"
    >
      <Search className="size-[15px]" strokeWidth={1.6} />
      Search
      <kbd className="hidden border border-current px-[5px] font-mono text-xs opacity-70 sm:inline">
        /
      </kbd>
    </button>
  );
}
