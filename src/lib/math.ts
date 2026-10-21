import katex from "katex";

/** Renders a LaTeX formula to MathML at build time. Never throws on bad input; shows the source instead. */
export function renderFormula(latex: string): string {
  return katex.renderToString(latex, {
    output: "mathml",
    displayMode: true,
    throwOnError: false,
    strict: "ignore",
  });
}
