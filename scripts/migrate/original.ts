import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The first edition's files (index.html, data/dictionary.json, data/dictionary.csv) live in the
 * repository's first commit. Read them from the working tree if present, else from git history.
 */
export function readOriginal(relativePath: string): string {
  const local = join(process.cwd(), relativePath);
  if (existsSync(local)) return readFileSync(local, "utf8");
  const root = execFileSync("git", ["rev-list", "--max-parents=0", "HEAD"], { encoding: "utf8" })
    .trim()
    .split("\n")[0];
  if (!root) throw new Error("no root commit found");
  return execFileSync("git", ["show", `${root}:${relativePath}`], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}
