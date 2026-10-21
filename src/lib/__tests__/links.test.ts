import { describe, expect, it } from "vitest";
import { linkTargets, parseRich, stripLinks } from "../links";

describe("cross-link markup", () => {
  const text = "A [[best-first-search|best-first search]] algorithm with `f(n)` and [[heuristic]].";
  it("parses text, links and code", () => {
    expect(parseRich(text)).toEqual([
      { type: "text", text: "A " },
      { type: "link", id: "best-first-search", text: "best-first search" },
      { type: "text", text: " algorithm with " },
      { type: "code", text: "f(n)" },
      { type: "text", text: " and " },
      { type: "link", id: "heuristic", text: null },
      { type: "text", text: "." },
    ]);
  });
  it("strips to the visible text, resolving bare ids to headwords", () => {
    expect(stripLinks(text, (id) => (id === "heuristic" ? "heuristic" : undefined))).toBe(
      "A best-first search algorithm with `f(n)` and heuristic.",
    );
  });
  it("lists link targets once each", () => {
    expect(linkTargets("[[a|x]] [[b|y]] [[a|z]]")).toEqual(["a", "b"]);
  });
});
