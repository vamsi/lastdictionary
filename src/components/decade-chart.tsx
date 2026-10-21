import type { Decade } from "@/lib/derive";
import { nf } from "@/lib/format";

/** Bars of words born per decade. Each bar links into the timeline. */
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
  return (
    <div className={`w-full overflow-x-auto ${compact ? "" : "max-w-[900px]"}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Number of dictionary words first used in each decade"
        className={`block h-auto w-full ${compact ? "" : "min-w-[520px]"} [&_text]:fill-ink-3 [&_text]:font-mono ${compact ? "[&_text]:text-sm" : "[&_text]:text-[11px]"}`}
      >
        {ticks.map((t) => (
          <g key={t}>
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
          const anchor = d.pre ? "before" : d.label;
          return (
            <g key={d.label}>
              <a href={`/timeline#dec-${anchor}`} className="group">
                <rect
                  x={x}
                  y={y(d.n)}
                  width={w}
                  height={h}
                  className={`${d.pre ? "fill-ink-3" : "fill-ink"} group-hover:fill-ink-2`}
                >
                  <title>{`${d.label}: ${nf(d.n)} words`}</title>
                </rect>
              </a>
              {d.n === max && (
                <text x={x + w / 2} y={y(d.n) - 6} textAnchor="middle" className="[&]:fill-ink">
                  {d.n}
                </text>
              )}
              {(i % (compact ? 2 : 1) === 0 || i === decades.length - 1) && (
                <text x={x + w / 2} y={H - 8} textAnchor="middle">
                  {d.short}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
