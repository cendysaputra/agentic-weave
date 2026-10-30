# Changelog

Each release lists only the categories that have entries. Version numbers are those of the `agentic-weave` package on npm. Release 1.0.0 shipped as `anti-ai-skills`, which was unpublished on 2026-10-30.

## 1.1.0 (2026-10-30)

Added:

- `npx agentic-weave check`: lints Markdown files (`.md`, `.markdown`, `.mdx`) and commit messages, prints each finding, and names the three rules to fix first. Each file or message scores out of 100, the run shows their average, and any error exits with 1. A missing path is reported by name.
- `npx agentic-weave hook`: a commit-msg hook that rejects commit subjects with errors (generic subjects, emoji) and prints warnings. It runs the installed package without network access and falls back to a copy in `.git/hooks/agentic-weave/` when the package is missing.
- A GitHub Action (`action.yml`) that checks the PR title, its commits, and the Markdown files a PR or push changed, with line annotations and the score in the job summary.
- `label-title` warning in the Markdown linter for headings that are only labels (Introduction, Overview, Conclusion, Q&A, and similar).
- `examples/`: before/after pairs for every lint rule, including a `weave-slides` outline, run by `npm test`.
- `weave-slides`: tells for presentations and pitch decks, and rule R-49 (one slide, one point) in `weave-core`.
- `weave-core` rules R-50 (report only what was checked) and R-51 (one name per thing). The Delivery Gate now also covers placeholders, versioned facts, summary lines, and docs that change with the code, and points at `npx agentic-weave check`.
- `demo/index.html`: a page that runs the linters in the browser.

Changed:

- Skill bodies are about 10,000 characters shorter in total: the repeated intro in every skill is gone, so each load costs fewer tokens.

## 1.0.0 (2026-10-29)

Added:

- `antiai-core`: the numbered rules (R-02 to R-43, C-1 to C-6) and the Delivery Gate that every skill cites.
- Text skills: `antiai-chat`, `antiai-docs`, `antiai-email`, `antiai-error`, `antiai-commit`, `antiai-pr`, `antiai-changelog`.
- Indonesian skills: `antiai-copywriting-id` and `antiai-ui-id`.
- `antiai-ui`: generated-UI tells, the Awwwards rubric, and three Playwright scripts: `crawl-reference.mjs` for reference sites, plus `snapshot-site.mjs` and `compare-build.mjs` for the ATM workflow (Amati, Tiru, Modifikasi).
- `references/libraries.md`: animation, scroll, transition, 3D, and vector libraries with versions checked on npm.
- `npx anti-ai-skills` installer for Claude Code and `.agents/skills`, global or per project, with `list` and `remove`.
