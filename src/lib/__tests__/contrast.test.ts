import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The palette must stay at WCAG AAA: 7:1 for every text colour on every background it sits on,
 * 3:1 for borders that outline controls. Parsed straight from globals.css so a token edit that
 * drops below the line fails the test suite.
 */

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function tokens(selector: string): Record<string, string> {
  const m = css.match(new RegExp(`${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`));
  if (!m?.[1]) throw new Error(`no ${selector} block`);
  return Object.fromEntries(
    [...m[1].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((x) => [x[1], x[2]]),
  );
}

function luminance(hex: string): number {
  const c = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * c(n >> 16) + 0.7152 * c((n >> 8) & 255) + 0.0722 * c(n & 255);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const AAA = 7;
const NON_TEXT = 3;

for (const theme of [":root", ".dark"]) {
  describe(`${theme} palette`, () => {
    const t = tokens(theme);
    const textPairs: [string, string][] = [
      ["ink", "paper"],
      ["ink-2", "paper"],
      ["ink-3", "paper"],
      ["ink", "paper-2"],
      ["ink-2", "paper-2"],
      ["ink-3", "paper-2"],
      ["paper", "ink"],
      ["hl-ink", "hl"],
      ...([1, 2, 3, 4, 5, 6, 7] as const).flatMap((n): [string, string][] => [
        [`f${n}-ink`, `f${n}-bg`],
        [`f${n}-bg`, `f${n}-ink`],
      ]),
    ];
    for (const [fg, bg] of textPairs) {
      it(`${fg} on ${bg} is at least ${AAA}:1`, () => {
        expect(contrast(t[fg] as string, t[bg] as string)).toBeGreaterThanOrEqual(AAA);
      });
    }
    it(`line against paper is at least ${NON_TEXT}:1 (control borders)`, () => {
      expect(contrast(t.line as string, t.paper as string)).toBeGreaterThanOrEqual(NON_TEXT);
    });
  });
}
