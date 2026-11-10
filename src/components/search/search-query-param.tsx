"use client";

import { useEffect } from "react";
import { useSearch } from "./search-provider";

/** lastdictionary.com/?q=word opens the search with the word typed, so a search box elsewhere can link here. */
export function SearchQueryParam() {
  const { openSearch } = useSearch();
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q");
    if (!q) return;
    openSearch(q);
    // Drop only q: campaign tags (utm_*) stay in the address for Analytics to read.
    url.searchParams.delete("q");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [openSearch]);
  return null;
}
