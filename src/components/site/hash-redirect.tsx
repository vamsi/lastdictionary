"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";

const SECTIONS: Record<string, string> = {
  home: "/",
  about: "/about",
  guide: "/about",
  contents: "/contents",
  domains: "/contents",
  index: "/a-z",
  timeline: "/timeline",
  essentials: "/essentials",
};

/** The first edition lived at lastdictionary.com/#word. Old links still land on the right page. */
export function HashRedirect() {
  const router = useRouter();
  useLayoutEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash || hash === "home") return;
    const section = SECTIONS[hash];
    if (section) {
      router.replace(section);
      return;
    }
    if (hash.startsWith("domain-")) {
      router.replace(`/domain/${hash.slice(7)}`);
      return;
    }
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(hash)) router.replace(`/${hash}`);
  }, [router]);
  return null;
}
