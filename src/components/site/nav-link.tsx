"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Link from "@/components/link";

/** A section link that marks itself current for its own page and the pages beneath it. */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="flex min-h-11 min-w-11 items-center justify-center px-2 text-ink no-underline hover:underline hover:underline-offset-[0.3em] aria-[current=page]:underline aria-[current=page]:underline-offset-[0.3em]"
    >
      {children}
    </Link>
  );
}
