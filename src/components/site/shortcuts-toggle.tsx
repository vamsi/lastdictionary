"use client";

import { useSyncExternalStore } from "react";
import { SHORTCUTS_KEY, useSetting } from "@/hooks/use-setting";

const subscribe = () => () => {};

/** Lets readers turn single-key shortcuts off (WCAG 2.1.4); ⌘K and the buttons always work. */
export function ShortcutsToggle() {
  const [on, setOn] = useSetting(SHORTCUTS_KEY, true);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const checked = mounted ? on : true;
  return (
    <div>
      <span className="mb-2 block text-ink-3">Keyboard shortcuts</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setOn(!checked)}
        className="inline-flex min-h-11 cursor-pointer items-center gap-3 border border-line px-3.5 font-mono text-sm hover:bg-paper-2"
      >
        <span
          aria-hidden="true"
          className={`inline-block h-3 w-5 border border-ink ${checked ? "bg-ink" : ""}`}
        />
        Single-key shortcuts {checked ? "on" : "off"}
      </button>
      <span className="mt-2 block text-ink-3 text-sm">
        / to search · ← → to the neighboring words · ⌘K always opens search
      </span>
    </div>
  );
}
