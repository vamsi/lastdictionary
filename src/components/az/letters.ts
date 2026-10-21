/** Letter pages live at /a-z/a … /a-z/z; words that start with a digit file under /a-z/0-9. */
export const letterSlug = (letter: string) => (letter === "#" ? "0-9" : letter.toLowerCase());
export const letterFromSlug = (slug: string) => (slug === "0-9" ? "#" : slug.toUpperCase());
export const letterPath = (letter: string) => `/a-z/${letterSlug(letter)}`;
