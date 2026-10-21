import type { ReactNode } from "react";

/** The ruled heading block at the top of every section page. */
export function PageHeader({
  kicker,
  title,
  children,
  className = "",
  panel = false,
}: {
  kicker: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  panel?: boolean;
}) {
  return (
    <header
      className={
        panel
          ? `mb-9 bg-fam px-5 py-[26px] text-fam-ink sm:px-10 sm:pt-9 sm:pb-[38px] ${className}`
          : `mb-9 border-line border-b pb-[30px] ${className}`
      }
    >
      <span
        className={`kick inline-block border-b pb-[9px] ${panel ? "border-current" : "border-line"}`}
      >
        {kicker}
      </span>
      <h1 className="mt-4 text-[clamp(40px,6vw,68px)] leading-[1.04] tracking-[-0.012em]">
        {title}
      </h1>
      {children && (
        <p
          className={`mt-[18px] max-w-[32em] font-normal text-[clamp(21px,2.4vw,29px)] leading-[1.3] ${panel ? "" : "text-ink-2"}`}
        >
          {children}
        </p>
      )}
    </header>
  );
}

export function SectionHeading({
  title,
  count,
  swatch = false,
}: {
  title: ReactNode;
  count?: ReactNode;
  swatch?: boolean;
}) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-3 border-line border-b pb-3">
      <h2 className="flex items-center gap-3 text-[27px] leading-[1.15]">
        {swatch && <span className="inline-block size-3 shrink-0 bg-fam-ink" aria-hidden="true" />}
        {title}
      </h2>
      {count !== undefined && <span className="kick whitespace-nowrap text-ink-2">{count}</span>}
    </div>
  );
}
