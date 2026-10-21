import { describe, expect, it } from "vitest";
import { highlightRange, normalize, prepareIndex, search } from "../search";
import type { SearchIndex } from "../search-index";

const index: SearchIndex = {
  version: 1,
  entries: [
    {
      id: "transformer",
      t: "transformer",
      p: "n.",
      d: "llm",
      v: 1,
      pl: "A neural network built from attention.",
      k: "T",
    },
    {
      id: "vision-transformer",
      t: "vision transformer",
      a: ["ViT"],
      p: "n.",
      d: "percep",
      v: 2,
      pl: "A transformer for images.",
      k: "V",
    },
    {
      id: "attention",
      t: "attention",
      p: "n.",
      d: "llm",
      v: 1,
      pl: "Weighting parts of the input.",
      k: "A",
    },
  ],
};

describe("search ranking", () => {
  const prepared = prepareIndex(index);
  it("ranks an exact headword first, then prefixes, then body matches", () => {
    expect(search(prepared, "transformer").map((h) => h.entry.id)).toEqual([
      "transformer",
      "vision-transformer",
    ]);
  });
  it("finds aliases and reports them", () => {
    const [hit] = search(prepared, "vit");
    expect(hit?.entry.id).toBe("vision-transformer");
    expect(hit?.via).toBe("ViT");
  });
  it("falls back to the plain-words text", () => {
    expect(search(prepared, "weighting")[0]?.entry.id).toBe("attention");
  });
  it("normalizes dashes, quotes and accents", () => {
    expect(normalize("Fréchet–inception ’distance’")).toBe("frechet-inception 'distance'");
  });
  it("highlights the matching range", () => {
    expect(highlightRange("vision transformer", "trans")).toEqual(["vision ", "trans", "former"]);
  });
});
