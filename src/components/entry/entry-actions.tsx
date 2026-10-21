"use client";

import { toast } from "@/components/site/toast";
import { useStarred } from "@/hooks/use-local-list";
import { copyText } from "@/lib/clipboard";

interface Props {
  id: string;
  citation: string;
  url: string;
  text: string;
}

const copy = async (value: string, done: string) => {
  toast(
    (await copyText(value)) ? done : "Copy was blocked here. Select the text and copy it yourself.",
  );
};

export function EntryActions({ id, citation, url, text }: Props) {
  const { isStarred, toggle } = useStarred();
  const starred = isStarred(id);
  const button =
    "flex min-h-11 w-full cursor-pointer items-center justify-start border-0 bg-paper px-4 text-left font-mono text-sm leading-none hover:bg-ink hover:text-paper aria-pressed:bg-ink aria-pressed:text-paper";
  return (
    <div className="grid gap-px border border-line bg-line">
      <button type="button" className={button} onClick={() => copy(citation, "Citation copied")}>
        Copy citation
      </button>
      <button type="button" className={button} onClick={() => copy(url, "Link copied")}>
        Copy link
      </button>
      <button type="button" className={button} onClick={() => copy(text, "Entry copied")}>
        Copy entry
      </button>
      <button
        type="button"
        className={button}
        aria-pressed={starred}
        onClick={() => {
          toggle(id);
          toast(starred ? "Removed from starred" : "Starred. Find it in the A–Z under ★ starred.");
        }}
      >
        {starred ? "★ Starred" : "☆ Star"}
      </button>
    </div>
  );
}
