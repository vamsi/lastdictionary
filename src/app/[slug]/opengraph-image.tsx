import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { familyOfDomain } from "@/lib/derive";
import { getDictionary } from "@/lib/dictionary";
import { yearLabel } from "@/lib/format";

/** The social card for an entry: headword and plain-words line on the family's colours. */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getDictionary().entries.map((e) => ({ slug: e.id }));
}

const FAMILY_COLORS: Record<number, [string, string]> = {
  1: ["#dde5ee", "#132440"],
  2: ["#dce8da", "#163a25"],
  3: ["#ece4c3", "#1e205e"],
  4: ["#f5e0cf", "#4b1f12"],
  5: ["#e6deee", "#2e1b3d"],
  6: ["#f4dcdd", "#4d1a28"],
  7: ["#e8e3dd", "#2a2725"],
};

const toArrayBuffer = (b: Buffer) =>
  b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
// Static-weight WOFF files from the @fontsource packages: the same faces the site uses, in a form
// the card renderer (Satori) reads reliably.
const font = (pkg: string, file: string) =>
  readFile(join(process.cwd(), "node_modules/@fontsource", pkg, "files", file)).then(toArrayBuffer);
const fonts = Promise.all([
  font("newsreader", "newsreader-latin-400-normal.woff"),
  font("newsreader", "newsreader-latin-600-normal.woff"),
  font("dm-mono", "dm-mono-latin-400-normal.woff"),
]);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dict = getDictionary();
  const entry = dict.byId.get(slug);
  const [serif, serifSemibold, mono] = await fonts;
  const family = entry ? familyOfDomain(dict.taxonomy, entry.domain) : dict.taxonomy.families[0];
  const [bg, ink] = (family && FAMILY_COLORS[family.n]) ?? ["#fcf7f4", "#141112"];
  const term = entry?.term ?? dict.meta.title;
  const plain = entry?.plain ?? dict.meta.description;
  const domain = entry
    ? (dict.taxonomy.domains[entry.domain]?.name ?? entry.domain)
    : dict.meta.subtitle;
  const meta = entry
    ? `${dict.taxonomy.pos[entry.pos] ?? entry.pos}${entry.year !== undefined ? ` · born ${yearLabel(entry.year)}` : ""}`
    : dict.meta.edition;
  const headSize = term.length > 44 ? 54 : term.length > 26 ? 72 : 100;
  const host = dict.meta.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "52px 64px 48px",
        background: bg,
        color: ink,
        fontFamily: "Newsreader",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "DM Mono",
          fontSize: 22,
          borderBottom: `1px solid ${ink}`,
          paddingBottom: 18,
        }}
      >
        <span>{dict.meta.title}</span>
        <span>{domain}</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 26,
          paddingTop: 28,
          paddingBottom: 28,
        }}
      >
        <div
          style={{ fontSize: headSize, lineHeight: 1, letterSpacing: "-0.02em", fontWeight: 600 }}
        >
          {term}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.35, lineClamp: 3 }}>{plain}</div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "DM Mono",
          fontSize: 22,
          borderTop: `1px solid ${ink}`,
          paddingTop: 18,
        }}
      >
        <span>{meta}</span>
        <span>
          {host}/{slug}
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, weight: 400, style: "normal" },
        { name: "Newsreader", data: serifSemibold, weight: 600, style: "normal" },
        { name: "DM Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
