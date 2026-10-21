import type { Dictionary } from "@/lib/dictionary";
import { entryPath } from "@/lib/site";

/** The standard two-column list of words with their plain-words line. */
export function WordList({ dict, ids }: { dict: Dictionary; ids: readonly string[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {ids.map((id) => {
        const e = dict.byId.get(id);
        if (!e) return null;
        return (
          <li
            key={id}
            className="grid gap-x-9 gap-y-1 border-line-2 border-b py-2.5 [contain-intrinsic-size:auto_72px] [content-visibility:auto] sm:grid-cols-[minmax(0,290px)_minmax(0,1fr)]"
          >
            <a
              href={entryPath(id)}
              className="link-quiet flex min-h-11 items-center font-semibold text-xl leading-[1.3] [overflow-wrap:anywhere]"
            >
              {e.term}
            </a>
            <span className="max-w-[62ch] self-center text-[16.5px] text-ink-2 leading-normal">
              {e.plain}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
