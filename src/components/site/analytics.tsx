"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA_MEASUREMENT_ID, installGtag, track } from "@/lib/analytics";
import { legacyHashPath } from "@/lib/site";

/**
 * Loads the Google tag once the page is interactive, on the production host only (`host`, from
 * the edition's URL): local development, the CI accessibility run and Vercel previews send nothing.
 * Page views and the standard interactions are measured by the tag itself; see lib/analytics.ts.
 */
export function Analytics({ host }: { host: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (window.location.hostname !== host || window.gtag) return;
    // An old #word link on the home page is about to redirect to its entry. Load once it has
    // landed, so the visit counts once, as a view of the entry, and not also of the home page.
    if (pathname === "/" && legacyHashPath(window.location.hash)) return;
    installGtag();
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    document.addEventListener("click", reportLinkClick, true);
  }, [host, pathname]);
  return null;
}

/** Sponsor links and .json downloads, for which the tag has no event of its own. */
function reportLinkClick(event: MouseEvent) {
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(link instanceof HTMLAnchorElement)) return;
  if (link.relList.contains("sponsored")) {
    const placement = link.closest("header")
      ? "header"
      : link.closest("footer")
        ? "footer"
        : "page";
    track("sponsor_click", { placement, link_url: link.href });
    return;
  }
  const url = new URL(link.href);
  if (url.origin === window.location.origin && url.pathname.endsWith(".json")) {
    track("file_download", {
      file_extension: "json",
      file_name: url.pathname,
      link_url: url.href,
      link_text: link.textContent?.trim() ?? "",
    });
  }
}
