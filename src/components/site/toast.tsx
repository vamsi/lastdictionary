"use client";

import { useEffect, useSyncExternalStore } from "react";

/** A single unobtrusive status message, e.g. "Citation copied". Dismissed by click, Escape, or time. */

let current: { id: number; message: string } | null = null;
const listeners = new Set<() => void>();
let counter = 0;
const DURATION = 4000;

export function toast(message: string) {
  current = { id: ++counter, message };
  for (const fn of listeners) fn();
}

function dismiss() {
  current = null;
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
      if (current?.id === state.id) dismiss();
    }, DURATION);
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && dismiss();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [state]);
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] left-1/2 z-60 -translate-x-1/2 transition-opacity data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0"
      data-hidden={!state}
    >
      {state && (
        <button
          type="button"
          onClick={dismiss}
          className="min-h-11 cursor-pointer whitespace-nowrap bg-ink px-4 font-mono text-[13px] text-paper"
          title="Dismiss"
        >
          {state.message}
        </button>
      )}
    </div>
  );
}
