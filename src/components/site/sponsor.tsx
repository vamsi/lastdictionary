import { SPONSOR } from "@/lib/site";
import { PlaneLogo } from "./plane";

/** The masthead lockup: "Sponsored by" and the logo. */
export function SponsorMark() {
  return (
    <a
      href={SPONSOR.url}
      rel="sponsored noopener"
      className="flex min-h-11 shrink-0 items-center gap-3 no-underline hover:underline hover:underline-offset-[0.35em]"
    >
      <span className="hidden font-mono text-ink-3 text-sm sm:inline">Sponsored by</span>
      <span className="sr-only">{SPONSOR.name}</span>
      <PlaneLogo className="h-[18px] w-auto text-ink" />
    </a>
  );
}

/** The band at the top of the footer. */
export function SponsorBand() {
  return (
    <div className="wrap mt-[120px] grid gap-x-16 gap-y-5 border-line border-t pt-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
      <div>
        <a
          href={SPONSOR.url}
          rel="sponsored noopener"
          className="inline-flex min-h-11 w-fit items-center no-underline"
          aria-label={`${SPONSOR.name}, sponsor of The Last Dictionary`}
        >
          <PlaneLogo className="h-9 w-auto text-ink" />
        </a>
        <p className="kick mt-2 text-ink-3">{SPONSOR.pillars.join(" · ")}</p>
      </div>
      <p className="max-w-[44em] text-[17px] text-ink-2 leading-[1.55]">
        <b className="font-semibold text-ink">The Last Dictionary is sponsored by {SPONSOR.name}</b>
        , {SPONSOR.tagline.charAt(0).toLowerCase() + SPONSOR.tagline.slice(1)}.{" "}
        <a href={SPONSOR.url} rel="sponsored noopener" className="whitespace-nowrap text-ink">
          plane.so →
        </a>
      </p>
    </div>
  );
}
