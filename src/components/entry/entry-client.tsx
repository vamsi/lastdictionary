"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { pushRecent } from "@/hooks/use-local-list";
import { entryPath } from "@/lib/site";

/** Remembers the visit for the palette's "Recently viewed" and wires ← → to the neighbors. */
export function EntryClient({ id, prev, next }: { id: string; prev?: string; next?: string }) {
  const router = useRouter();
  useEffect(() => pushRecent(id), [id]);
  useEffect(() => {
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
  }, [router, prev, next]);
  return null;
}
