# AGENTS.md

Instructions for AI agents working on this repository: the agentic-weave skills, published on npm as `anti-ai-skills` and as the `anti-ai` Claude Code plugin.

## Commands

- `npm test`: lint every skill (`scripts/lint-skills.mjs`). It must pass before every commit.
- `node bin/anti-ai.mjs list`: list skills the way the installer reads them.
- `claude plugin validate .`: check `.claude-plugin/` when it changes.
- Scripts in `skills/antiai-ui/scripts/` need Playwright: `npm i -D playwright && npx playwright install chromium`.

## Repository map

- `skills/<name>/SKILL.md`: one skill per concern. Detail lives in `skills/<name>/references/`, runnable helpers in `scripts/`, templates in `assets/`.
- `skills/antiai-core/`: the numbered rules and the Delivery Gate. Every other skill depends on it.
- `bin/anti-ai.mjs`: the installer behind `npx anti-ai-skills`.
- `scripts/`: repo tooling (linter, version sync). Not shipped to npm.
- `.claude-plugin/`: Claude Code marketplace and plugin manifests.
- `research/`: research notes behind the skills. Read `research/README.md` first; the newest file is the reference.

## Writing a skill

- Frontmatter has `name` and `description` only. `name` matches the folder. `description` stays under 350 characters, says what the skill does and when to use it, and ends with `Load with antiai-core.` plus any other skill it needs. The installer reads that sentence to add dependencies.
- Keep the body under 500 lines and about 5,000 tokens. Move long procedures and tables into `references/`, one level below `SKILL.md`, and name the file in the body.
- Entries use **Tell** / **Why** / **Fix** / **Rule**. The Indonesian copy skill uses **The pattern** / **Why it reads as AI** / **Before** / **After** instead.
- Cite rules by ID (R-02, C-3). Never renumber or reuse an ID. A new rule gets the next free number in `antiai-core`.
- Refer to another skill by name ("load antiai-core"), never by a `../` path: skills are installed one folder at a time.
- No em dash and no decorative emoji in skill text (R-02, R-04). The only exception is a quoted "Before" example of the tell itself, written as an indented blockquote.
- Mark anything not verified against a primary source, and never write it into a skill as fact. Put the verification date next to version numbers and tool behavior.
- Every skill ends with a checklist that supplements the Delivery Gate.

## Using the skills on a task

Load `antiai-core` first, then the skill for the task:

| Task | Skill |
| --- | --- |
| A web project from brief to handoff | `antiai-flow` (stages and gates in `.antiai/`) |
| Web or app UI, reference sites, ATM, design tokens | `antiai-ui` (`antiai-ui-id` for Indonesian products) |
| Converting a static build to WordPress, Elementor, WooCommerce, Statamic, Laravel, Astro, or React | `antiai-convert` |
| Indonesian copy | `antiai-copywriting-id` |
| README or docs | `antiai-docs` |
| Commit messages | `antiai-commit` |
| Pull requests and review comments | `antiai-pr` |
| Changelogs and release notes | `antiai-changelog` |
| Error messages and logs | `antiai-error` |
| Email and notifications | `antiai-email` |
| Chat or assistant replies | `antiai-chat` |

Run the Delivery Gate in `antiai-core` before handing over any text, UI, commit, or PR.

## Git and releases

- Write commits and PRs with `antiai-commit` and `antiai-pr`. Commit subjects use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`) and name the change.
- Never commit `atm/` or `reference-crawl/`. They hold third-party copies.
- Research sessions write only to `research/`. Skill changes go in their own commits.
- Release: add a `CHANGELOG.md` entry with the version and date, run `npm version <patch|minor|major>` (the version hook copies the version into `.claude-plugin/plugin.json`), then `npm publish` and `git push --follow-tags`.
