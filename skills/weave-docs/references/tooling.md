<!-- Detail for the weave-docs skill: automated checks. Sources: tool documentation cited in research 2026-10-30. -->

# Tooling

## Bundled linter

`scripts/lint-docs.mjs` (Node 18+, no dependencies) checks Markdown files for the deterministic tells in this skill: em dashes, stock phrases (English and Indonesian), stacked hedges, inconsistent "kamu"/"Anda", repeated "silakan", code fences without a language, vague link text, empty sections, badge walls, and pre-announcements. Errors exit with code 1, so it can run in CI or a pre-commit hook.

```bash
node <skill-dir>/scripts/lint-docs.mjs README.md docs/
node <skill-dir>/scripts/lint-docs.mjs docs/ --sapaan kamu
```

`--sapaan kamu|anda` turns inconsistent address into an error that names the expected form. Without it, mixing both in one file is a warning. Code blocks and inline code are skipped.

## Other tools

| Tool | Use | Notes |
| --- | --- | --- |
| Vale | Prose rules in YAML (existence, substitution, occurrence, and more) | Only `error`-level alerts fail CI. No official Indonesian style; regex rules work in any language. The configuration proposed in the research has not been tested here |
| markdownlint-cli2 | Markdown structure | MD040 requires a language on every code fence, which also makes samples testable |
| textlint + textlint-rule-prh | Term dictionaries with regex | Language-agnostic; useful for an Indonesian glossary |
| lychee | Broken links in Markdown and HTML | `--offline` checks local links only; has a GitHub Action |
| doctest, `pytest --doctest-glob`, `cargo test` | Run samples in Python and Rust docs | |

## Testing samples in PHP and JavaScript projects

These stacks have no doctest. Extract each fenced block by its language into a temporary file and run `php -l` or `node --check` in CI; run shell blocks in a container with the versions the doc states (R-44).
