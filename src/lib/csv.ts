/**
 * CSV writer matching Python's default `csv` dialect ("excel"): comma-separated, fields quoted only
 * when they contain a comma, a double quote or a line break, quotes doubled, rows ended with CRLF.
 * The published dictionary.csv was first produced by Python, and this keeps it byte-identical.
 */

function field(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(rows: readonly (readonly string[])[]): string {
  return rows.map((row) => row.map(field).join(",")).join("\r\n") + (rows.length ? "\r\n" : "");
}
