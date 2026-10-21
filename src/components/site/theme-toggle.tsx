"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** One button that flips between light and dark; the footer offers the full system/light/dark choice. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid a hydration mismatch: the theme is unknown until the client reads it.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title="Switch theme"
      className="grid size-10 shrink-0 cursor-pointer place-items-center border border-line bg-transparent hover:bg-ink hover:text-paper"
    >
      {dark ? (
        <Sun className="size-[18px]" strokeWidth={1.5} />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.5} />
      )}
    </button>
  );
}

const CHOICES = ["system", "light", "dark"] as const;

export function ThemeSegment() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = mounted ? (theme ?? "system") : "system";
  return (
    <fieldset className="inline-flex border border-line">
      <legend className="sr-only">Theme</legend>
      {CHOICES.map((choice) => (
        <button
          key={choice}
          type="button"
          onClick={() => setTheme(choice)}
          aria-pressed={current === choice}
          className="cursor-pointer border-line px-3 pt-2 pb-[7px] font-mono text-[13px] capitalize not-first:border-l hover:bg-paper-2 aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:hover:bg-ink"
        >
          {choice}
        </button>
      ))}
    </fieldset>
  );
}
