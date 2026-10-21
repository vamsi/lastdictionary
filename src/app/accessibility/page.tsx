import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import Link from "@/components/link";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/dictionary";
import { breadcrumbs, pageGraph, webPageNode } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "How The Last Dictionary meets WCAG 2.2 at level AAA, what was tested, the documented exceptions, and how to report a problem.",
  alternates: { canonical: "/accessibility" },
};

const TESTED = "20 October 2026";

export default function AccessibilityPage() {
  const dict = getDictionary();
  return (
    <div className="wrap fade-in">
      <JsonLd
        data={pageGraph(
          dict,
          webPageNode(dict, {
            path: "/accessibility",
            name: "Accessibility statement",
            description: metadata.description as string,
            breadcrumb: breadcrumbs(dict, [{ name: "Accessibility", path: "/accessibility" }]),
          }),
        )}
      />
      <PageHeader kicker="Accessibility statement" title="Built to be read by everyone">
        A dictionary is only useful if every reader can use it. This page says what the site does
        for accessibility, how it was tested, where it falls short on purpose, and how to tell us
        when it falls short by accident.
      </PageHeader>
      <div className="max-w-[700px] [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:border-line [&_h2]:border-t [&_h2]:pt-4 [&_h2]:text-[28px] [&_h2]:leading-[1.15] [&_h2:first-child]:mt-0 [&_h2:first-child]:border-t-0 [&_h2:first-child]:pt-0 [&_li]:mb-2 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:pl-5">
        <h2>Conformance</h2>
        <p>
          The Last Dictionary is designed to meet the{" "}
          <a href="https://www.w3.org/TR/WCAG22/">Web Content Accessibility Guidelines 2.2</a> at
          level <b>AAA</b>, with the exceptions listed below. Every text colour has at least a 7:1
          contrast ratio against its background in both the light and dark themes, no text is
          smaller than 14 pixels, body text is 18 pixels with generous line spacing, and standalone
          controls are at least 44 by 44 pixels.
        </p>

        <h2>What the site does</h2>
        <ul>
          <li>
            <b>Keyboard.</b> Everything works without a mouse. The search opens with ⌘K or Ctrl+K
            and is navigated with the arrow keys; the ← and → keys move between neighboring words on
            an entry page. Focus is always visible.
          </li>
          <li>
            <b>Single-key shortcuts can be turned off.</b> The <kbd>/</kbd> shortcut and the arrow
            keys can be switched off in the footer, for people who use speech input or who prefer
            not to have them.
          </li>
          <li>
            <b>Screen readers.</b> Pages use landmarks and headings; lists are lists; the part of
            speech and labels are spelled out; cross-links inside a definition carry the plain-words
            definition of the word they point to, so it is announced on focus; filter and search
            result counts are announced as they change.
          </li>
          <li>
            <b>Themes and contrast.</b> Light, dark and system themes; a higher-contrast palette
            when the system asks for more contrast; Windows High Contrast and other forced-colour
            modes keep the chart, the level meter and selected rows visible.
          </li>
          <li>
            <b>Zoom and spacing.</b> The layout reflows to 320 pixels wide and to 400% zoom without
            horizontal scrolling, and text can be given wider line, letter and word spacing without
            anything being cut off.
          </li>
          <li>
            <b>Motion.</b> Animations are removed when the system prefers reduced motion. Nothing
            flashes, autoplays or moves on its own.
          </li>
          <li>
            <b>Plain words first.</b> Every entry opens with a definition anyone can follow before
            the precise one. Unusual terms are linked to their own entries, and abbreviations are
            explained on the <Link href="/about#labels">About page</Link>.
          </li>
          <li>
            <b>Other languages.</b> Names in other scripts, such as Chinese or Russian, are marked
            with their language so screen readers switch voice.
          </li>
        </ul>

        <h2>Documented exceptions</h2>
        <ul>
          <li>
            <b>Target size (2.5.5, AAA).</b> Dense indexes such as the A–Z letter pages and the
            timeline years list hundreds of words per page. Their links are spaced to the AA
            requirement (2.5.8) rather than enlarged to 44 pixels each, which would make the pages
            several times longer and harder to scan. Every one of those words can also be reached
            through the search, whose results are large targets. On small screens the bars of the
            decade chart are narrower than 44 pixels too; the timeline page lists the same decades
            as full-size links.
          </li>
          <li>
            <b>Reading level (3.1.5, AAA).</b> The precise definitions are technical by nature. The
            plain-words line at the top of every entry is the lower-reading-level version.
          </li>
          <li>
            <b>Formulas.</b> Mathematical formulas are rendered as MathML, which most screen readers
            now read, but some older ones do not.
          </li>
        </ul>

        <h2>How it was tested</h2>
        <p>
          Automated checks run on every change: the colour palette is checked for 7:1 contrast in
          both themes, and axe-core runs with the WCAG 2.2 A, AA and AAA rule sets on every kind of
          page, in light and dark themes, on desktop and phone sizes, including the open search
          dialog. A change that introduces a violation cannot be merged. Keyboard navigation, screen
          reader output, zoom, text spacing, reduced motion and forced colours were checked by hand.
          Last full review: {TESTED}.
        </p>

        <h2>Tell us</h2>
        <p>
          If something on this site does not work for you, please{" "}
          <a href="https://github.com/vamsi/lastdictionary/issues/new/choose">open an issue</a> on
          GitHub, or edit the page directly; the site and every entry are open source. We aim to
          answer within a week.
        </p>
      </div>
    </div>
  );
}
