import { describe, expect, it } from "vitest";
import { compareEntries, fold, foldWords, letterOf, sortKey } from "../sort";

describe("filing rules", () => {
  it("folds case, diacritics, punctuation and Greek letters", () => {
    expect(fold("Karel Čapek")).toBe("karel capek");
    expect(fold("1-bit LLM")).toBe("1bit llm");
    expect(fold("λ-return")).toBe("lambdareturn");
    expect(fold("A* search")).toBe("a search");
  });
  it("treats punctuation between words as a space in foldWords", () => {
    expect(foldWords("hold-out set")).toBe(foldWords("hold out set"));
    expect(foldWords("c.ai")).not.toBe(foldWords("CAI"));
  });
  it("files people by surname through sort_as and digits under #", () => {
    expect(sortKey({ term: "Alan Turing", sort_as: "Turing Alan" })).toBe("turing alan");
    expect(letterOf(sortKey({ term: "3D parallelism" }))).toBe("#");
    expect(letterOf(sortKey({ term: "π0" }))).toBe("P");
  });
  it("orders entries by key then id", () => {
    const a = { id: "a3c", term: "A3C" };
    const b = { id: "a-b-testing", term: "A/B testing" };
    expect([b, a].sort(compareEntries).map((e) => e.id)).toEqual(["a3c", "a-b-testing"]);
  });
});
