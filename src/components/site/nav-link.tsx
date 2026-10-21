"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** A section link that marks itself current for its own page and the pages beneath it. */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="py-1.5 text-ink no-underline hover:underline hover:underline-offset-[0.3em] aria-[current=page]:underline aria-[current=page]:underline-offset-[0.3em]"
    >
      {children}
    </Link>
  );
}
