import { describe, expect, it } from "vitest";
import { toCsv } from "../csv";

describe("toCsv (Python csv 'excel' dialect)", () => {
  it("quotes only fields that need it and ends rows with CRLF", () => {
    expect(toCsv([["a", "b,c", 'say "hi"', ""]])).toBe('a,"b,c","say ""hi""",\r\n');
  });
  it("quotes fields containing line breaks", () => {
    expect(toCsv([["x\ny"]])).toBe('"x\ny"\r\n');
  });
  it("writes nothing for no rows", () => {
    expect(toCsv([])).toBe("");
  });
});
