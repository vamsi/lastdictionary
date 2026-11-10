"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";
import { legacyHashPath } from "@/lib/site";

/** The first edition lived at lastdictionary.com/#word. Old links still land on the right page. */
export function HashRedirect() {
  const router = useRouter();
  useLayoutEffect(() => {
    const path = legacyHashPath(window.location.hash);
    // The query string goes along, so campaign tags on an old link still reach Analytics.
    if (path) router.replace(path + window.location.search);
  }, [router]);
  return null;
}
