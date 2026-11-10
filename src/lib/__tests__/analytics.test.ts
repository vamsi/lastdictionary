import { afterEach, describe, expect, it, vi } from "vitest";
import { installGtag, reportableSearchTerm, track } from "../analytics";

describe("search terms sent to Analytics", () => {
  it("trims, collapses spaces and lower-cases", () => {
    expect(reportableSearchTerm("  Agent   Loop ")).toBe("agent loop");
  });
  it("sends nothing for an empty query", () => {
    expect(reportableSearchTerm("   ")).toBeNull();
  });
  it("keeps words with numbers, such as model names and years", () => {
    expect(reportableSearchTerm("GPT-4o")).toBe("gpt-4o");
    expect(reportableSearchTerm("2001: a space odyssey")).toBe("2001: a space odyssey");
  });
  it("drops what looks like an email address or a phone number", () => {
    expect(reportableSearchTerm("someone@example.com")).toBeNull();
    expect(reportableSearchTerm("+1 (415) 555-0123")).toBeNull();
  });
  it("cuts to Analytics' 100-character limit", () => {
    expect(reportableSearchTerm("a".repeat(150))).toHaveLength(100);
  });
});

describe("the gtag queue", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends nothing before the tag is installed", () => {
    vi.stubGlobal("window", {});
    expect(() =>
      track("random_entry", { content_type: "entry", content_id: "harness" }),
    ).not.toThrow();
    expect((globalThis.window as Window).dataLayer).toBeUndefined();
  });

  it("queues commands as arguments objects, the form the Google tag reads", () => {
    vi.stubGlobal("window", {});
    installGtag();
    track("search", { search_term: "harness", search_results: 1 });
    const queue = (globalThis.window as Window).dataLayer ?? [];
    expect(queue).toHaveLength(2);
    const [js, event] = queue as IArguments[];
    expect(Array.isArray(js)).toBe(false);
    expect(Array.from(js as IArguments)[0]).toBe("js");
    expect(Array.from(event as IArguments)).toEqual([
      "event",
      "search",
      { search_term: "harness", search_results: 1 },
    ]);
  });
});
