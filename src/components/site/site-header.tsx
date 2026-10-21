import Link from "@/components/link";
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
        className="gutter sticky-bar top-0 z-20 border-line border-y bg-paper"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
        aria-label="Sections"
      >
        <div className="wrap flex min-h-[calc(var(--navh)-2px)] items-stretch gap-4">
          <div className="nav-scroll -ml-2 flex min-w-0 flex-1 items-stretch overflow-x-auto whitespace-nowrap font-mono text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((s, i) => (
              <span key={s.href} className="flex items-stretch">
                {i > 0 && <Pipe />}
                <NavLink href={s.href}>{s.label}</NavLink>
              </span>
            ))}
            <Pipe />
            <RandomButton className="min-h-11 cursor-pointer border-0 bg-transparent px-2 font-mono text-ink text-sm hover:underline hover:underline-offset-[0.3em]" />
          </div>
          <span className="hidden self-center whitespace-nowrap font-mono text-sm text-ink-3 lg:inline">
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
    <span className="mx-px self-center text-ink-3 sm:mx-1" aria-hidden="true">
      |
    </span>
  );
}

export function FooterNav() {
  return (
    <nav className="grid content-start" aria-label="Footer">
      <span className="mb-2 block text-ink-3">Browse</span>
      {SECTIONS.map((s) => (
        <Link key={s.href} href={s.href} className="link-quiet flex min-h-11 items-center">
          {s.label === "About" ? "About this dictionary" : s.label}
        </Link>
      ))}
      <Link href="/accessibility" className="link-quiet flex min-h-11 items-center">
        Accessibility
      </Link>
    </nav>
  );
}
