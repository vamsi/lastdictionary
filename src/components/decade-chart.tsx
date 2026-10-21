import type { Decade } from "@/lib/derive";
import { nf } from "@/lib/format";
import { decadePath } from "./timeline/decades";

/** Bars of words born per decade. Each bar is a link into that decade of the timeline. */
export function DecadeChart({
  decades,
  compact = false,
}: {
  decades: Decade[];
  compact?: boolean;
}) {
  const max = Math.max(...decades.map((d) => d.n), 1);
  const W = 640;
  const H = compact ? 230 : 250;
  const padL = compact ? 44 : 36;
  const padB = compact ? 30 : 26;
  const padT = 22;
  const bw = (W - padL - 6) / decades.length;
  const step = max > 400 ? 200 : max > 200 ? 100 : max > 80 ? 40 : 20;
  const ticks: number[] = [];
  for (let t = 0; t <= max; t += step) ticks.push(t);
  const y = (v: number) => H - padB - (v / max) * (H - padB - padT);
  const scrolls = !compact;
  return (
    <figure className={`m-0 w-full ${compact ? "" : "max-w-[900px]"}`}>
      <figcaption className="sr-only">
        Number of dictionary words first used in each decade. Each bar opens that decade of the
        timeline.
      </figcaption>
      {/* The full-size chart scrolls sideways on narrow screens, so it must be reachable by keyboard. */}
      <div
        className="w-full overflow-x-auto"
        {...(scrolls
          ? { role: "region", tabIndex: 0, "aria-label": "Words born per decade, chart" }
          : {})}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={`block h-auto w-full ${compact ? "" : "min-w-[520px]"} [&_text]:fill-ink-3 [&_text]:font-mono ${compact ? "[&_text]:text-sm" : "[&_text]:text-xs"}`}
        >
          <title>Words born per decade</title>
          {ticks.map((t) => (
            // biome-ignore lint/a11y/noAriaHiddenOnFocusable: axis ticks are decoration; SVG groups are not focusable
            <g key={t} aria-hidden="true">
              <line
                x1={padL}
                x2={W}
                y1={y(t)}
                y2={y(t)}
                className={t === 0 ? "stroke-line" : "stroke-line-2"}
                strokeWidth={1}
              />
              <text x={padL - 8} y={y(t) + 4} textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          {decades.map((d, i) => {
            const x = padL + i * bw + 3;
            const h = Math.max(0, H - padB - y(d.n));
            const w = Math.max(2, bw - 6);
            const name = `${d.label}: ${nf(d.n)} words`;
            return (
              <g key={d.label}>
                <a href={decadePath(d)} className="group" aria-label={name}>
                  {/* The whole column is the hit area, so the target is far larger than the bar. */}
                  <rect
                    x={x - 3}
                    y={padT - 8}
                    width={bw}
                    height={H - padT - padB + 8}
                    fill="transparent"
                  />
                  <rect
                    x={x}
                    y={y(d.n)}
                    width={w}
                    height={h}
                    className={`${d.pre ? "chart-bar-dim fill-ink-3" : "chart-bar fill-ink"} group-hover:fill-ink-2 group-focus-visible:fill-ink-2`}
                  >
                    <title>{name}</title>
                  </rect>
                </a>
                {d.n === max && (
                  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: the bar's name carries the number; SVG text is not focusable
                  <text
                    x={x + w / 2}
                    y={y(d.n) - 6}
                    textAnchor="middle"
                    className="[&]:fill-ink"
                    aria-hidden="true"
                  >
                    {d.n}
                  </text>
                )}
                {(i % (compact ? 2 : 1) === 0 || i === decades.length - 1) && (
                  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: axis labels are decoration; SVG text is not focusable
                  <text x={x + w / 2} y={H - 8} textAnchor="middle" aria-hidden="true">
                    {d.short}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
