"use client";

import { useCallback, useSyncExternalStore } from "react";

/** A boolean preference kept in localStorage and shared across components and tabs. */

const listeners = new Set<() => void>();

function read(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}

export function writeSetting(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // Storage may be blocked; listeners still update this tab.
  }
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

export function useSetting(key: string, fallback: boolean): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const set = useCallback((v: boolean) => writeSetting(key, v), [key]);
  return [value, set];
}

/** Single-key shortcuts (`/` to search, ← → between neighbors). Off, only ⌘K and the buttons work. */
export const SHORTCUTS_KEY = "tld-shortcuts";
