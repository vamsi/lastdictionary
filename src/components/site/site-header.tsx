import Link from "next/link";
import { SearchButton } from "@/components/search/search-button";
import type { Dictionary } from "@/lib/dictionary";
import { nf } from "@/lib/format";
import { Brand } from "./brand";
import { NavLink } from "./nav-link";
import { RandomButton } from "./random-button";
import { ThemeToggle } from "./theme-toggle";

export const SECTIONS = [
  { href: "/contents", label: "Contents" },
  { href: "/a-z", label: "A–Z" },
  { href: "/timeline", label: "Timeline" },
  { href: "/essentials", label: "Essentials" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader({ dict }: { dict: Dictionary }) {
  const { meta, entries } = dict;
  return (
    <>
      <header className="gutter">
        <div className="wrap flex items-center justify-between gap-4 pt-4 pb-3.5 sm:pt-5 sm:pb-[18px]">
          <Brand title={meta.title} subtitle={meta.subtitle} />
          <ThemeToggle />
        </div>
      </header>
      <nav
        className="gutter sticky top-0 z-20 border-line border-y bg-paper"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
        aria-label="Sections"
      >
        <div className="wrap flex h-[calc(var(--navh)-2px)] items-stretch gap-4">
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap font-mono text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((s, i) => (
              <span key={s.href} className="flex items-center">
                {i > 0 && <Pipe />}
                <NavLink href={s.href}>{s.label}</NavLink>
              </span>
            ))}
            <Pipe />
            <RandomButton className="cursor-pointer border-0 bg-transparent py-1.5 font-mono text-sm text-ink hover:underline hover:underline-offset-[0.3em]" />
          </div>
          <span className="hidden self-center whitespace-nowrap font-mono text-[13px] text-ink-3 min-[900px]:inline">
            First Edition · {meta.editionDate} · {nf(entries.length)} entries
          </span>
          <SearchButton />
        </div>
      </nav>
    </>
  );
}

function Pipe() {
  return (
    <span className="mx-[9px] text-ink-3 sm:mx-3" aria-hidden="true">
      |
    </span>
  );
}

export function FooterNav() {
  return (
    <nav className="grid content-start gap-1" aria-label="Footer">
      <span className="mb-2 block text-ink-3">Browse</span>
      {SECTIONS.map((s) => (
        <Link key={s.href} href={s.href} className="link-quiet">
          {s.label === "About" ? "About this dictionary" : s.label}
        </Link>
      ))}
    </nav>
  );
}
