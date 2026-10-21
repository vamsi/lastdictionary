import Link from "next/link";
import type { ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionary";
import { yearLabel } from "@/lib/format";
import { parseRich } from "@/lib/links";
import type { Entry } from "@/lib/schema";
import { entryPath } from "@/lib/site";
import { type Preview, PreviewLink } from "./preview-link";

export function previewOf(dict: Dictionary, entry: Entry): Preview {
  return {
    term: entry.term,
    pos: entry.pos,
    domain: dict.taxonomy.domains[entry.domain]?.name ?? entry.domain,
    year: entry.year === undefined ? undefined : yearLabel(entry.year),
    plain: entry.plain,
  };
}

/** A link to an entry with a hover preview, used wherever a word is mentioned. */
export function EntryLink({
  dict,
  id,
  className,
  children,
  preview = true,
}: {
  dict: Dictionary;
  id: string;
  className?: string;
  children?: ReactNode;
  preview?: boolean;
}) {
  const target = dict.byId.get(id);
  if (!target) return <>{children ?? id}</>;
  const label = children ?? target.term;
  if (!preview) {
    return (
      <Link href={entryPath(id)} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <PreviewLink href={entryPath(id)} preview={previewOf(dict, target)} className={className}>
      {label}
    </PreviewLink>
  );
}

/** Dictionary prose: plain text with `[[id|text]]` cross-links and `code` spans. */
export function RichText({
  dict,
  text,
  linkClassName,
}: {
  dict: Dictionary;
  text: string;
  linkClassName?: string;
}) {
  return (
    <>
      {parseRich(text).map((seg, i) => {
        if (seg.type === "text") return seg.text;
        if (seg.type === "code") {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: segments never reorder
            <code key={`${i}-${seg.text}`} className="bg-paper-2 px-1 font-mono text-[0.84em]">
              {seg.text}
            </code>
          );
        }
        const target = dict.byId.get(seg.id);
        if (!target) return seg.text ?? seg.id;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: segments never reorder
          <EntryLink key={`${i}-${seg.id}`} dict={dict} id={seg.id} className={linkClassName}>
            {seg.text ?? target.term}
          </EntryLink>
        );
      })}
    </>
  );
}
