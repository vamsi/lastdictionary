"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A list of ids kept in localStorage and shared across components and tabs: starred words,
 * recently viewed words. Reads are safe when storage is blocked; they just come back empty.
 */

const listeners = new Set<() => void>();
const EMPTY: readonly string[] = [];
const cache = new Map<string, readonly string[]>();

function read(key: string): readonly string[] {
  const hit = cache.get(key);
  if (hit) return hit;
  let value: readonly string[] = EMPTY;
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) value = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    value = EMPTY;
  }
  cache.set(key, value);
  return value;
}

export function writeLocalList(key: string, value: readonly string[]) {
  cache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable; the in-memory copy still updates this tab.
  }
  for (const fn of listeners) fn();
}

export function readLocalList(key: string): readonly string[] {
  return typeof window === "undefined" ? EMPTY : read(key);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key) cache.delete(e.key);
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLocalList(key: string): readonly string[] {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );
}

export const STARRED_KEY = "tld-starred";
export const RECENT_KEY = "tld-recent";

export function useStarred() {
  const starred = useLocalList(STARRED_KEY);
  const toggle = useCallback((id: string) => {
    const current = read(STARRED_KEY);
    writeLocalList(
      STARRED_KEY,
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);
  return { starred, toggle, isStarred: (id: string) => starred.includes(id) };
}

export function pushRecent(id: string, keep = 8) {
  const current = read(RECENT_KEY).filter((x) => x !== id);
  writeLocalList(RECENT_KEY, [id, ...current].slice(0, keep));
}
