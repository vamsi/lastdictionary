"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { pushRecent } from "@/hooks/use-local-list";
import { SHORTCUTS_KEY, useSetting } from "@/hooks/use-setting";
import { entryPath } from "@/lib/site";

/** Remembers the visit for the palette's "Recently viewed" and wires ← → to the neighbors, unless shortcuts are off. */
export function EntryClient({ id, prev, next }: { id: string; prev?: string; next?: string }) {
  const router = useRouter();
  const [shortcuts] = useSetting(SHORTCUTS_KEY, true);
  useEffect(() => pushRecent(id), [id]);
  useEffect(() => {
    if (!shortcuts) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      if (document.querySelector("[role=dialog]")) return;
      if (ev.key === "ArrowLeft" && prev) router.push(entryPath(prev));
      if (ev.key === "ArrowRight" && next) router.push(entryPath(next));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, prev, next, shortcuts]);
  return null;
}
