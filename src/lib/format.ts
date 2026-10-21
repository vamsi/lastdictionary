const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function nf(n: number): string {
  return n.toLocaleString("en-US");
}

/** A year for display; negative years read as BC. */
export function yearLabel(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : String(year);
}

/** "2026-10" → "October 2026". */
export function monthLabel(asOf: string): string {
  const [year, month] = asOf.split("-");
  return `${MONTHS[(Number(month) || 1) - 1] ?? ""} ${year}`;
}

/** "20th October 2026", in UTC so the build and every visitor agree. */
export function ordinalDate(date: Date): string {
  const n = date.getUTCDate();
  const suffix =
    n % 10 === 1 && n !== 11
      ? "st"
      : n % 10 === 2 && n !== 12
        ? "nd"
        : n % 10 === 3 && n !== 13
          ? "rd"
          : "th";
  return `${n}${suffix} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${nf(n)} ${n === 1 ? one : many}`;
}
