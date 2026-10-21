"use client";

import { useEffect, useSyncExternalStore } from "react";

/** A single unobtrusive status message, e.g. "Citation copied". */

let current: { id: number; message: string } | null = null;
const listeners = new Set<() => void>();
let counter = 0;

export function toast(message: string) {
  current = { id: ++counter, message };
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function Toaster() {
  const state = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => {
      if (current?.id === state.id) {
        current = null;
        for (const fn of listeners) fn();
      }
    }, 1800);
    return () => clearTimeout(t);
  }, [state]);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] left-1/2 z-60 -translate-x-1/2 whitespace-nowrap bg-ink px-4 py-2.5 font-mono text-[13px] text-paper transition-opacity data-[hidden=true]:opacity-0"
      data-hidden={!state}
    >
      {state?.message}
    </div>
  );
}
