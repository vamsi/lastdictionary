"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export interface Preview {
  term: string;
  pos: string;
  domain: string;
  year?: string;
  plain: string;
}

/** A link to an entry that shows its plain-words definition on hover or focus. */
export function PreviewLink({
  href,
  preview,
  className,
  children,
}: {
  href: string;
  preview: Preview;
  className?: string;
  children: ReactNode;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={250}
        closeDelay={80}
        render={<Link href={href} className={className} />}
      >
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-[min(360px,calc(100vw-32px))] border border-line bg-paper p-4 pb-[15px] text-[15.5px] text-ink leading-[1.45] shadow-panel ring-0"
      >
        <b className="block font-semibold text-[21px] leading-[1.2]">{preview.term}</b>
        <span className="mt-[3px] mb-2 block font-mono text-ink-3 text-xs">
          {preview.pos} · {preview.domain}
          {preview.year ? ` · born ${preview.year}` : ""}
        </span>
        {preview.plain}
      </HoverCardContent>
    </HoverCard>
  );
}
