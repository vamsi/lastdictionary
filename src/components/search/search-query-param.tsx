"use client";

import { useEffect } from "react";
import { useSearch } from "./search-provider";

/** lastdictionary.com/?q=word opens the search with the word typed, so a search box elsewhere can link here. */
export function SearchQueryParam() {
  const { openSearch } = useSearch();
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;
    openSearch(q);
    window.history.replaceState(null, "", window.location.pathname + window.location.hash);
  }, [openSearch]);
  return null;
}
