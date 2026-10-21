"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface SearchState {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Open the palette, optionally with a query already typed. */
  openSearch: (query?: string) => void;
  /** The query requested by the last openSearch call, consumed by the palette. */
  takeRequestedQuery: () => string;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const requested = useRef("");
  const openSearch = useCallback((query = "") => {
    requested.current = query;
    setOpen(true);
  }, []);
  const takeRequestedQuery = useCallback(() => {
    const q = requested.current;
    requested.current = "";
    return q;
  }, []);
  const value = useMemo(
    () => ({ open, setOpen, openSearch, takeRequestedQuery }),
    [open, openSearch, takeRequestedQuery],
  );
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchState {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}
