import Link from "next/link";

export function Brand({
  title,
  subtitle,
  large = false,
}: {
  title: string;
  subtitle: string;
  large?: boolean;
}) {
  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-3.5 no-underline"
      aria-label={`${title}, home`}
    >
      <span className="size-6 shrink-0 bg-ink" aria-hidden="true" />
      <span className="grid min-w-0">
        <b
          className={`font-semibold leading-[1.15] tracking-[0.01em] ${large ? "text-[22px]" : "text-lg sm:text-xl"}`}
        >
          {title}
        </b>
        <i className="font-medium text-[14.5px] text-ink-2 leading-[1.3] sm:text-[15.5px]">
          {subtitle}.
        </i>
      </span>
    </Link>
  );
}
