"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { loadSearchIndex } from "@/lib/search-client";
import { useSearch } from "./search-provider";

/** The palette's code loads the first time it is opened, not with every page. */
const SearchPalette = dynamic(() => import("./search-palette").then((m) => m.SearchPalette), {
  ssr: false,
});

export interface SearchRootProps {
  domainNames: Record<string, string>;
  tryWords: string[];
  total: number;
}

/** Warm the palette's code and index when a search looks likely (hovering the button). */
export function preloadSearch() {
  void import("./search-palette");
  void loadSearchIndex();
}

/** Global shortcuts (`/`, ⌘K) and the lazily mounted palette. Lives once, in the layout. */
export function SearchRoot(props: SearchRootProps) {
  const { open, setOpen } = useSearch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
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

  return mounted ? <SearchPalette {...props} /> : null;
}
