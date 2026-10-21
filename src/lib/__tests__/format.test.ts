import { describe, expect, it } from "vitest";
import { capitalize, numberWord } from "@/lib/format";

describe("numberWord", () => {
  it("spells small counts and keeps figures for large ones", () => {
    expect(numberWord(7)).toBe("seven");
    expect(numberWord(0)).toBe("zero");
    expect(numberWord(13)).toBe("13");
    expect(numberWord(2709)).toBe("2,709");
    expect(capitalize(numberWord(7))).toBe("Seven");
  });
});
