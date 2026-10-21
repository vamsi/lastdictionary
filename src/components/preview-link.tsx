"use client";

import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "@/components/link";

export interface Preview {
  term: string;
  pos: string;
  domain: string;
  year?: string;
  plain: string;
}

const OPEN_DELAY = 250;
const CLOSE_DELAY = 150;
const MARGIN = 16;

/**
 * A link to an entry that shows its plain-words definition on hover or keyboard focus.
 * The pointer may travel onto the card; Escape, scrolling or leaving both closes it. Screen readers
 * get the same words through a permanent description, so focus announces them without waiting.
 */
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
  const id = useId();
  const anchor = useRef<HTMLAnchorElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<{ top: number; left: number; width: number }>();

  const show = (immediate = false) => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), immediate ? 0 : OPEN_DELAY);
  };
  const hide = (immediate = false) => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    if (immediate) setOpen(false);
    else closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  // Place the card under the link, or above it when there is no room below.
  useLayoutEffect(() => {
    if (!open || !anchor.current || !card.current) return;
    const r = anchor.current.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - MARGIN * 2);
    const left = Math.min(Math.max(MARGIN, r.left), window.innerWidth - width - MARGIN);
    const height = card.current.offsetHeight;
    const below = r.bottom + 8;
    const top = below + height > window.innerHeight - 12 ? Math.max(12, r.top - height - 8) : below;
    setStyle({ top, left, width });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && close();
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    [],
  );

  const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const descriptionId = `${id}-d`;

  return (
    <>
      <Link
        ref={anchor}
        href={href}
        className={className}
        aria-describedby={descriptionId}
        onMouseEnter={() => fine() && show()}
        onMouseLeave={() => hide()}
        onFocus={() => show(true)}
        onBlur={() => hide(true)}
      >
        {children}
      </Link>
      <span id={descriptionId} className="sr-only">
        {preview.term}, {preview.pos}: {preview.plain}
      </span>
      {open &&
        createPortal(
          <div
            ref={card}
            role="tooltip"
            aria-hidden="true"
            onMouseEnter={() => show(true)}
            onMouseLeave={() => hide()}
            style={
              style
                ? { top: style.top, left: style.left, width: style.width }
                : { top: -9999, left: 0 }
            }
            className="fixed z-40 border border-line bg-paper p-4 pb-[15px] text-[15.5px] text-ink leading-[1.5] shadow-panel"
          >
            <b className="block font-semibold text-[21px] leading-[1.2]">{preview.term}</b>
            <span className="mt-[3px] mb-2 block font-mono text-ink-3 text-sm">
              {preview.pos} · {preview.domain}
              {preview.year ? ` · born ${preview.year}` : ""}
            </span>
            {preview.plain}
          </div>,
          document.body,
        )}
    </>
  );
}
