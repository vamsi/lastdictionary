"use client";

import { Search } from "lucide-react";
import { useSearch } from "@/components/search/search-provider";
import { preloadSearch } from "@/components/search/search-root";

export function HeroSearch() {
  const { openSearch } = useSearch();
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      onPointerEnter={preloadSearch}
      aria-haspopup="dialog"
      className="flex min-h-16 w-full cursor-text items-stretch border border-line bg-paper p-0 text-left shadow-[0_1px_0_var(--line)] hover:shadow-[0_2px_0_var(--line)]"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3.5 px-5 py-3 font-serif text-[19px] text-ink-3 italic sm:text-[21px]">
        <Search className="size-[18px] shrink-0 not-italic" strokeWidth={1.6} />
        Look up a word
      </span>
      <span className="flex items-center gap-2.5 bg-ink px-5 font-mono text-paper text-sm sm:px-6">
        Search
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: the key hint is decoration and is not focusable */}
        <kbd
          className="hidden border border-current px-[5px] font-mono text-xs sm:inline"
          aria-hidden="true"
        >
          /
        </kbd>
      </span>
    </button>
  );
}
