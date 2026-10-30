# Changelog

Each release lists only the categories that have entries. Versions match the `anti-ai-skills` package on npm.

## Unreleased

Added:

- `npx agentic-weave check`: scores Markdown files and commit messages out of 100 and names the three rules to fix first.
- `npx agentic-weave hook`: a commit-msg hook that rejects generic, emoji, or buzzword commit subjects.
- A GitHub Action (`action.yml`) that checks the PR title, its commits, and changed Markdown files.
- `examples/`: before/after pairs for every lint rule, run by `npm test`.
- `weave-slides`: tells for presentations and pitch decks, and rule R-49 (one slide, one point) in `weave-core`.
- `demo/index.html`: a page that runs the linters in the browser.

## 1.0.0 (2026-10-29)

Added:

- `antiai-core`: the numbered rules (R-02 to R-43, C-1 to C-6) and the Delivery Gate that every skill cites.
- Text skills: `antiai-chat`, `antiai-docs`, `antiai-email`, `antiai-error`, `antiai-commit`, `antiai-pr`, `antiai-changelog`.
- Indonesian skills: `antiai-copywriting-id` and `antiai-ui-id`.
- `antiai-ui`: generated-UI tells, the Awwwards rubric, and three Playwright scripts: `crawl-reference.mjs` for reference sites, plus `snapshot-site.mjs` and `compare-build.mjs` for the ATM workflow (Amati, Tiru, Modifikasi).
- `references/libraries.md`: animation, scroll, transition, 3D, and vector libraries with versions checked on npm.
- `npx anti-ai-skills` installer for Claude Code and `.agents/skills`, global or per project, with `list` and `remove`.
