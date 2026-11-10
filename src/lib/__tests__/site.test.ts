import { describe, expect, it } from "vitest";
import { legacyHashPath } from "../site";

describe("first-edition #word links", () => {
  it("send words to their entries", () => {
    expect(legacyHashPath("#harness")).toBe("/harness");
    expect(legacyHashPath("p-doom")).toBe("/p-doom");
  });
  it("send sections and domains to the pages that replaced them", () => {
    expect(legacyHashPath("#index")).toBe("/a-z");
    expect(legacyHashPath("#guide")).toBe("/about");
    expect(legacyHashPath("#domain-agents")).toBe("/domain/agents");
  });
  it("leave the home page and anything that is not a word alone", () => {
    expect(legacyHashPath("")).toBeNull();
    expect(legacyHashPath("#")).toBeNull();
    expect(legacyHashPath("#home")).toBeNull();
    expect(legacyHashPath("#Not a word")).toBeNull();
    expect(legacyHashPath("#%E0%A4%A")).toBeNull();
  });
});
