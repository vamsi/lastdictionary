# The Last Dictionary

**Intelligence, human and otherwise.** 2,709 words of AI, from Bayes' theorem to superintelligence, each defined in plain words first, then precisely, with the year it was born.

Live site: **https://lastdictionary.com**

Every entry is one small YAML file in [`data/entries/`](data/entries). Fixing a definition or adding a word is a one-file pull request. The site is built from those files into plain static pages.

## Browse

- Every word has its own page: `lastdictionary.com/harness`
- [Contents](https://lastdictionary.com/contents) · [A–Z](https://lastdictionary.com/a-z) · [Timeline](https://lastdictionary.com/timeline) · [Essentials](https://lastdictionary.com/essentials) · [About](https://lastdictionary.com/about)
- Press `/` anywhere to search. `←` `→` move between neighboring entries.
- Downloads: [dictionary.json](https://lastdictionary.com/data/dictionary.json) · [dictionary.csv](https://lastdictionary.com/data/dictionary.csv)

## Contribute

See **[CONTRIBUTING.md](CONTRIBUTING.md)**. In short:

```sh
pnpm install
pnpm new-entry "your term" --domain llm --level core   # scaffolds data/entries/your-term.yaml
pnpm validate                                          # checks every entry file
pnpm dev                                               # http://localhost:3000
```

Corrections: edit the entry's file under `data/entries/` and open a pull request, or [open an issue](https://github.com/vamsi/lastdictionary/issues/new/choose) with a source.

## How the data is organized

```
data/
  entries/<id>.yaml     one file per word — the source of truth
  meta.yaml             edition facts: title, edition, editor, suggested words
  taxonomy.yaml         the 7 families, 28 domains, labels, levels and parts of speech
  schema/entry.schema.json   JSON Schema generated from src/lib/schema.ts (editor autocompletion)
  LICENSE               CC BY 4.0 for the text
```

An entry looks like this (abridged):

```yaml
term: harness
id: harness
pos: n.
also: [agent harness, test harness]
domain: agents
domains: [eval, eng]
level: core
plain: >-
  The software around an AI model that gives it instructions and tools, carries out its
  actions and decides when it stops. The model is the engine; the harness is the rest of the car.
senses:
  - context: Agents
    definition: >-
      The runtime that turns a [[large-language-model|large language model]] into an
      [[ai-agent|AI agent]]. ...
    example: We kept the model fixed and rewrote the harness, and task success nearly doubled.
    labels: [emerging]
origin: >-
  The lineage runs from horse tack to the software test harness ...
year: 2025
see_also: [scaffolding, agent loop, AI agent]
sources:
  - text: Paniego, S. & Roy Gosthipaty, A. (2026). Harness, Scaffold, and the AI Agent Terms Worth Getting Right.
    url: https://huggingface.co/blog/agent-glossary
as_of: 2026-10
```

`[[id|text]]` inside prose links to another entry and shows a hover preview on the site. `see_also` and `contrast` name entries by headword or alias. Everything the site derives — backlinks, the A–Z index, the timeline, the search index, the downloads — is computed from these files at build time; nothing derived is checked in.

## Development

Requires Node 24 and pnpm 10 (`corepack enable` picks the pinned pnpm).

| Command | What it does |
|---|---|
| `pnpm dev` | Generates derived data, then starts Next.js at http://localhost:3000 |
| `pnpm build` | Generates derived data and builds the static site into `out/` |
| `pnpm validate` | Validates every entry file and cross-reference |
| `pnpm check` | `validate` + `typecheck` + `lint` + `test` (what CI runs before `build`) |
| `pnpm new-entry "term"` | Scaffolds a new entry file |
| `pnpm build:data` | Regenerates `public/data/*`, `public/search.json`, `public/pool.json` and the JSON Schema |
| `pnpm format` | Formats code with Biome |

### Architecture

- **Next.js 16** (App Router, `output: "export"`): every page is pre-rendered HTML, so the site runs on any static host and needs no server. Deployed on Vercel.
- **Data layer** in `src/lib/`: `schema.ts` (Zod schema, the one definition of an entry), `load.ts` (reads and validates `data/`), `derive.ts` (backlinks, A–Z rows, decades, essentials, word-of-the-day pool), `canonical.ts` (the JSON/CSV downloads), `search.ts` (ranking shared by the palette and tests).
- **Styling**: Tailwind CSS 4 with the editorial palette as design tokens in `src/app/globals.css`; shadcn primitives on Base UI for the dialog, hover cards and toggles.
- **Scripts** in `scripts/`: `build-data.ts`, `validate.ts`, `new-entry.ts`, and the one-time `migrate/` scripts that split the first edition into entry files and prove the split was lossless.

### Repository layout

```
src/app/            routes: /, /[slug], /domain/[slug], /contents, /a-z, /timeline, /essentials, /about
src/components/     entry page parts, search palette, hover previews, site chrome, shadcn ui/
src/lib/            schema, loading, derivation, search, formatting
scripts/            data build, validation, scaffolding, migration
data/               the dictionary (see above)
public/             favicon, social image; generated files land here at build and are git-ignored
```

## Search engines and answer engines

Every page is static HTML with a canonical URL, a title and description written for the snippet, Open Graph and Twitter cards (each entry has a generated card), and a typed Schema.org graph: `WebSite` with a `SearchAction` (`/?q=word` opens the search with the word typed), `DefinedTerm` and breadcrumbs on entries, `CollectionPage` lists on domain and letter pages, and a `Dataset` describing the downloads. `sitemap.xml` and `robots.txt` are generated; `llms.txt` and `llms-full.txt` give AI crawlers a map of the site and every definition. Security headers and cache rules live in `vercel.json`. `pnpm build` then Lighthouse on `out/` is the check: 100 in every category on desktop and, with CDN-like latency, on mobile.

## License

Code: [MIT](LICENSE). Dictionary text: [CC BY 4.0](data/LICENSE). Cite an entry as:

> *The Last Dictionary*, 1st ed. (October 2026), s.v. "harness," lastdictionary.com/harness.

Edited by Vamsi Kurama · Compiled with Claude.
