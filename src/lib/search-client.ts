"use client";

import { type PreparedIndex, prepareIndex } from "./search";
import type { SearchIndex } from "./search-index";

/** Downloads and prepares the search index once per page load. */
let pending: Promise<PreparedIndex> | undefined;

export function loadSearchIndex(): Promise<PreparedIndex> {
  pending ??= fetch("/search.json")
    .then((r) => {
      if (!r.ok) throw new Error(`search index: HTTP ${r.status}`);
      return r.json() as Promise<SearchIndex>;
    })
    .then(prepareIndex)
    .catch((error) => {
      pending = undefined;
      throw error;
    });
  return pending;
}
