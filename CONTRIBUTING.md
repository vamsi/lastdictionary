# Contributing to The Last Dictionary

Thank you for helping keep the vocabulary of AI accurate. There are three ways to contribute, all welcome:

1. **Correct an entry.** Edit its file under `data/entries/` and open a pull request. Say what was wrong and point to a source.
2. **Add a word.** Run `pnpm new-entry "your term"`, fill in the file, open a pull request.
3. **Report something** you cannot fix yourself: [open an issue](https://github.com/vamsi/lastdictionary/issues/new/choose).

Small, focused pull requests are easiest to review: one word, or one correction, per PR.

## Setting up

```sh
git clone https://github.com/vamsi/lastdictionary.git
cd lastdictionary
pnpm install        # Node 24 and pnpm 10; `corepack enable` installs the pinned pnpm
pnpm dev            # http://localhost:3000
```

You can also edit a single YAML file in GitHub's web editor and open the pull request from there. The checks run automatically.

## Anatomy of an entry

Each entry is one YAML file, `data/entries/<id>.yaml`. The first line points editors at the JSON Schema, which gives autocompletion and validation in VS Code with the YAML extension.

| Field | Required | What goes there |
|---|---|---|
| `term` | yes | The headword, as it is most often written. |
| `id` | yes | URL slug and file name: lowercase letters, digits and hyphens. Never changes once published. |
| `sort_as` | people | How to file the word alphabetically when that differs from the headword. People are filed by surname: `Turing Alan`. |
| `pos` | yes | Part of speech: `n.`, `v.`, `adj.`, `adv.`, `abbr.`, `phr.`, `prop. n.` |
| `also` | | Other names, spellings and abbreviations. They appear in the A–Z and work in search. |
| `pronunciation` | | A simple respelling, e.g. `AY-star`, only when the reading is not obvious. |
| `domain` | yes | The home domain code (see `data/taxonomy.yaml`). |
| `domains` | | Up to three neighboring domain codes. |
| `labels` | | Usage labels for the whole entry: `emerging`, `contested`, `legal`, `trademark`, `historical`, `informal`, `slang`, `figurative`, `deprecated`. |
| `level` | yes | `essential` (a newcomer needs it), `core` (working vocabulary) or `specialist`. |
| `dates` | people | Life dates: `1912–1954` or `b. 1977`. |
| `plain` | yes | One or two sentences anyone can follow. The reader starts here. |
| `senses` | yes | One or more senses, each with `definition`, and optionally `context`, `example` and `labels`. |
| `formula_latex` | | A defining formula in LaTeX, rendered as MathML. |
| `origin` | | Who introduced the word, when and where. |
| `year` | | First known use in this sense (founding year for organizations). Places the word on the timeline. |
| `note` | | Usage note: confusions, disputes, advice. |
| `see_also` | | Related entries, named by headword or alias (not by id). |
| `contrast` | | Opposites and easily confused neighbors. |
| `sources` | | Primary sources, each with `text` (the citation) and optionally `url`. |
| `standards` | | Where a statute or standard defines the term: the instrument and article, paraphrased. |
| `as_of` | | For time-sensitive entries, the month the facts were last checked: `2026-10`. |

Prose fields (`plain`, `definition`, `example`, `origin`, `note`, `standards`) are written as folded blocks (`>-`) so long text wraps and diffs stay readable:

```yaml
plain: >-
  The software around an AI model that gives it instructions and tools, carries out its
  actions and decides when it stops. The model is the engine; the harness is the rest of the car.
```

### Cross-links

Inside prose, `[[id|text]]` links `text` to the entry with that `id`; the site shows a hover preview. Link the first mention of another dictionary word in a definition, not every mention, and only when the link helps the reader. `` `code` `` renders as code.

```yaml
definition: >-
  The runtime that turns a [[large-language-model|large language model]] into an [[ai-agent|AI agent]].
```

`see_also` and `contrast` use headwords or aliases, not ids: `see_also: [agent loop, AI agent]`.

## Style

The dictionary's editorial principles are on the [About page](https://lastdictionary.com/about#principles). The ones that matter most when writing:

- **Plain words first.** The `plain` line is for someone who has never heard the word. No jargon in it, and no circular definitions.
- **Then precise.** A `definition` says what the thing is, how it works, where it is used, and what its limits are. Give numbers and dates where they exist. Several meanings get several senses, each with a `context`.
- **Birth certificate.** Say *coined by* only when the evidence shows first use; otherwise *introduced*, *popularized* or *earliest known use*. The `year` is the first known use *in this sense*.
- **Sources.** Every origin claim and every fact that could be disputed needs a primary source: the paper, the post, the law. Prefer links that will still work in ten years.
- **Original writing.** Write fresh. Do not paste from Wikipedia, documentation, abstracts or legal texts, and do not follow their wording closely.
- **Describe disagreements; do not settle them.** On contested terms, set out the positions and who holds them. Use the `contested` label.
- **Safety.** Entries on attacks and misuse explain concepts and defenses, never procedures.
- **Date what moves.** Anything that can change (leaders, versions, prices, law) carries an `as_of` month.
- **Neutral register.** British or American spelling is fine; be consistent within an entry. Typographic quotes and dashes are welcome.

## Checking your work

```sh
pnpm validate     # schema, ids, cross-references, placeholders
pnpm dev          # look at the page
```

`pnpm validate` fails on: invalid YAML, unknown fields, a file whose name differs from its `id`, a `see_also` that matches no headword or alias, a `[[link]]` to a missing entry, a reserved id, a person without `sort_as`, a leftover `TODO:` placeholder. It warns about things worth a second look.

CI runs `pnpm check` (validate, typecheck, lint, tests) and a full build on every pull request, and a bot comment lists the entries you changed.

## Pull request checklist

- [ ] One topic per PR: a new word or a correction to one or a few related entries.
- [ ] `pnpm validate` passes.
- [ ] New facts have sources with links.
- [ ] Prose is written fresh, not copied.
- [ ] For a new word: `plain` first, a `definition`, an `example`, an `origin` with `year`, at least two `see_also`, a `source`.
- [ ] For a correction: the PR description says what was wrong and cites the source.

## Changing the taxonomy or the code

Domains, labels and levels live in `data/taxonomy.yaml`; changing them is an editorial decision, so open an issue first. Code changes are welcome too: the site is a Next.js static export (see the README). Keep it simple, typed and formatted (`pnpm format`), and add a test under `src/lib/__tests__` when you touch the data layer.

## License

By contributing you agree that dictionary text you submit is licensed under [CC BY 4.0](data/LICENSE) and code under [MIT](LICENSE).
