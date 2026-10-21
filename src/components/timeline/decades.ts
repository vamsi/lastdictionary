import { type Decade, FIRST_DECADE } from "@/lib/derive";

/** Decade pages live at /timeline/1990s; everything before 1940 shares /timeline/before-1940. */
export const decadeSlug = (d: Decade) => (d.pre ? `before-${FIRST_DECADE}` : d.label);
export const decadePath = (d: Decade) => `/timeline/${decadeSlug(d)}`;

export function decadeOfYear(decades: Decade[], year: number): Decade | undefined {
  if (year < FIRST_DECADE) return decades.find((d) => d.pre);
  return decades.find((d) => !d.pre && d.start === Math.floor(year / 10) * 10);
}

/** The timeline URL for a year: its decade page, scrolled to the year. */
export function yearPath(decades: Decade[], year: number): string {
  const d = decadeOfYear(decades, year);
  return d ? `${decadePath(d)}#y${year}` : "/timeline";
}

export function yearsOf(d: Decade, allYears: number[]): number[] {
  return allYears.filter((y) => (d.pre ? y < FIRST_DECADE : y >= d.start && y < d.start + 10));
}
