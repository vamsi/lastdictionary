"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

interface SearchState {
  open: boolean;
  setOpen: (open: boolean) => void;
  openSearch: () => void;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ open, setOpen, openSearch }), [open, openSearch]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}
