import Link from "@/components/link";

export function Brand({ title, large = false }: { title: string; large?: boolean }) {
  return (
    <Link href="/" className="flex min-h-11 min-w-0 items-center gap-3.5 no-underline">
      <span className="size-6 shrink-0 bg-ink" aria-hidden="true" />
      <b
        className={`min-w-0 font-semibold leading-[1.15] tracking-[0.01em] ${large ? "text-[22px]" : "text-lg sm:text-xl"}`}
      >
        {title}
      </b>
    </Link>
  );
}
