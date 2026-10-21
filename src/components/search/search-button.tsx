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
      aria-haspopup="dialog"
      className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 border-0 bg-ink px-3.5 font-mono text-paper text-sm hover:opacity-[0.88] sm:px-4"
    >
      <Search className="size-[15px]" strokeWidth={1.6} />
      Search
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: the key hint is decoration and is not focusable */}
      <kbd
        className="hidden border border-current px-[5px] font-mono text-sm sm:inline"
        aria-hidden="true"
      >
        /
      </kbd>
    </button>
  );
}
