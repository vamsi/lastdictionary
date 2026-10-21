import type { Decade } from "@/lib/derive";
import { decadePath } from "./decades";

/** The row of decades across the top of a decade page. */
export function DecadeBar({ decades, current }: { decades: Decade[]; current?: Decade }) {
  return (
    <nav
      className="sticky-bar top-[calc(env(safe-area-inset-top,0px)+var(--navh))] z-[6] flex flex-wrap border-line border-b bg-paper font-mono text-sm"
      aria-label="Jump to decade"
    >
      {decades.map((d) => (
        <a
          key={d.label}
          href={decadePath(d)}
          aria-current={d.label === current?.label ? "page" : undefined}
          className="grid min-h-11 place-items-center px-3 no-underline hover:bg-ink hover:text-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper"
        >
          {d.short}
        </a>
      ))}
    </nav>
  );
}
