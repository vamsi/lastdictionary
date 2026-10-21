/**
 * Accessibility gate: serves the built site from out/, opens every kind of page in light and dark
 * themes, on desktop and phone sizes (and the search dialog), and runs axe-core with the WCAG 2.2
 * A, AA and AAA rule sets. Exits non-zero on any violation. Run `pnpm build` first.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, type Page } from "playwright";

const OUT = join(process.cwd(), "out");
const PORT = 4175;
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};
const PAGES = [
  "/",
  "/harness",
  "/alan-turing",
  "/domain/agents",
  "/a-z",
  "/a-z/h",
  "/timeline",
  "/timeline/1990s",
  "/essentials",
  "/contents",
  "/about",
  "/accessibility",
  "/no-such-word",
];
const TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag2aaa",
  "wcag21a",
  "wcag21aa",
  "wcag21aaa",
  "wcag22aa",
  "best-practice",
];

if (!existsSync(join(OUT, "index.html"))) {
  console.error("out/ is missing; run `pnpm build` first");
  process.exit(2);
}

function resolve(url: string): { file: string; status: number } {
  const path = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
  for (const candidate of [
    join(OUT, safe),
    join(OUT, `${safe}.html`),
    join(OUT, safe, "index.html"),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile())
      return { file: candidate, status: 200 };
  }
  return { file: join(OUT, "404.html"), status: 404 };
}

const server = createServer((req, res) => {
  const { file, status } = resolve(req.url ?? "/");
  res.writeHead(status, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise<void>((done) => server.listen(PORT, done));

let violations = 0;
const byRule = new Map<string, { n: number; views: Set<string>; example: string }>();

async function audit(page: Page, label: string) {
  const result = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  if (!result.violations.length) {
    console.log(`✓ ${label}`);
    return;
  }
  for (const v of result.violations) {
    violations += v.nodes.length;
    const rule = byRule.get(v.id) ?? {
      n: 0,
      views: new Set<string>(),
      example: `${v.nodes[0]?.target.join(" ") ?? ""} — ${(v.nodes[0]?.failureSummary ?? "").split("\n").slice(1, 2).join("").trim()}`,
    };
    rule.n += v.nodes.length;
    rule.views.add(label);
    byRule.set(v.id, rule);
    console.log(`✗ ${label}: ${v.id} (${v.impact}) ×${v.nodes.length}: ${v.help}`);
    for (const node of v.nodes.slice(0, 2)) console.log(`    ${node.target.join(" ")}`);
  }
}

const browser = await chromium.launch();
for (const colorScheme of ["light", "dark"] as const) {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 360, height: 740 },
  ]) {
    const context = await browser.newContext({ colorScheme, viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const where = `${colorScheme}, ${viewport.width}px`;
    for (const path of PAGES) {
      await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "load" });
      await audit(page, `${path} (${where})`);
      if (path === "/") {
        await page.keyboard.press("Control+k");
        const box = page.getByRole("combobox");
        await box.waitFor({ state: "visible", timeout: 10_000 });
        await box.fill("trans");
        await page.getByRole("option").first().waitFor({ state: "visible", timeout: 10_000 });
        await audit(page, `search dialog (${where})`);
        await page.keyboard.press("Escape");
      }
    }
    await context.close();
  }
}
await browser.close();
server.close();

if (byRule.size) {
  console.log("\nBy rule:");
  for (const [id, r] of [...byRule].sort((a, b) => b[1].n - a[1].n)) {
    console.log(
      `  ${id}: ${r.n} node(s) on ${r.views.size} view(s); e.g. ${r.example.slice(0, 160)}`,
    );
  }
}
console.log(
  violations ? `\n${violations} accessibility violation(s)` : "\nno accessibility violations",
);
process.exit(violations ? 1 : 0);
