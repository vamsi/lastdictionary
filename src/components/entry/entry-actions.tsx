"use client";

import { toast } from "@/components/site/toast";
import { useStarred } from "@/hooks/use-local-list";
import { track } from "@/lib/analytics";
import { copyText } from "@/lib/clipboard";

interface Props {
  id: string;
  citation: string;
  url: string;
  text: string;
}

const copy = async (
  id: string,
  method: "copy_citation" | "copy_link" | "copy_entry",
  value: string,
  done: string,
) => {
  const copied = await copyText(value);
  if (copied) track("share", { method, content_type: "entry", content_id: id });
  toast(copied ? done : "Copy was blocked here. Select the text and copy it yourself.");
};

export function EntryActions({ id, citation, url, text }: Props) {
  const { isStarred, toggle } = useStarred();
  const starred = isStarred(id);
  const button =
    "flex min-h-11 w-full cursor-pointer items-center justify-start border-0 bg-paper px-4 text-left font-mono text-sm leading-none hover:bg-ink hover:text-paper aria-pressed:bg-ink aria-pressed:text-paper";
  return (
    <div className="grid gap-px border border-line bg-line">
      <button
        type="button"
        className={button}
        onClick={() => copy(id, "copy_citation", citation, "Citation copied")}
      >
        Copy citation
      </button>
      <button
        type="button"
        className={button}
        onClick={() => copy(id, "copy_link", url, "Link copied")}
      >
        Copy link
      </button>
      <button
        type="button"
        className={button}
        onClick={() => copy(id, "copy_entry", text, "Entry copied")}
      >
        Copy entry
      </button>
      <button
        type="button"
        className={button}
        aria-pressed={starred}
        onClick={() => {
          toggle(id);
          track(starred ? "unstar_entry" : "star_entry", { content_type: "entry", content_id: id });
          toast(starred ? "Removed from starred" : "Starred. Find it in the A–Z under ★ starred.");
        }}
      >
        {starred ? "★ Starred" : "☆ Star"}
      </button>
    </div>
  );
}
