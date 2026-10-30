# Agentic Weave

Agent skills that catch AI slop in the text and UI an agent produces, published on npm as `agentic-weave`. One skill per concern, in `skills/<name>/SKILL.md`. Each entry names a tell, why it reads as generated, and the fix, and each skill ends with a checklist.

## Skills

Start with [`weave-core`](skills/weave-core/SKILL.md). It defines the numbered rules (R-XX for wording, C-X for structure and checks) and the Delivery Gate that every other skill cites. Load it alongside whichever skill fits the task.

Projects:

- [`weave-flow`](skills/weave-flow/SKILL.md): a web project from brief to client handoff in nine stages. Each stage writes a file in `.weave/` and passes a gate that `scripts/flow.mjs` checks, so any agent can pick up where another stopped. Modes: build, atm, rewrite, audit.
- [`weave-convert`](skills/weave-convert/SKILL.md): turn a static build or ATM rebuild into WordPress with ACF, Elementor V4 JSON (checked by `validate-elementor.mjs` against a real export), WooCommerce, Statamic, Laravel Blade, Astro, or React, with tokens from one file, motion that cleans up on page transitions, and a similarity check against the static build.

Interfaces:

- [`weave-ui`](skills/weave-ui/SKILL.md): web and app UI that looks generated (default fonts, purple gradients, stock landing-page layout, preset motion), raised to Awwwards jury craft: concept, signature moment, Core Web Vitals, accessibility, and a rubric self-score. Its scripts need Playwright (`npm i -D playwright && npx playwright install chromium`):
  - `crawl-reference.mjs` reports a reference site's type, palette, motion stack, performance, and accessibility, with screenshots.
  - `snapshot-site.mjs` and `compare-build.mjs` run ATM (Amati, Tiru, Modifikasi). They save a raw local copy of a page, score a rebuild's similarity, then gate the modified version on originality: no reused text, assets, or brand.
  - `references/libraries.md` is a vetted shortlist of animation, scroll, transition, 3D, and vector libraries (GSAP, Lenis, Swup, Barba.js, Three.js, Rive, and more).

Writing for people:

- [`weave-chat`](skills/weave-chat/SKILL.md): assistant and agent replies (canned openers and closers, sycophancy, over-apologizing, hedging).
- [`weave-docs`](skills/weave-docs/SKILL.md): READMEs, how-tos, reference, docblocks, ADRs, runbooks, client handoff guides, and AGENTS.md. Requires samples that were run and APIs that exist, ships templates, and includes `lint-docs.mjs` for English and Indonesian Markdown.
- [`weave-email`](skills/weave-email/SKILL.md): emails and notifications (generic subjects, signposting, empty CTAs).
- [`weave-error`](skills/weave-error/SKILL.md): error messages, validation text, and logs.

Version control:

- [`weave-commit`](skills/weave-commit/SKILL.md): commit messages.
- [`weave-pr`](skills/weave-pr/SKILL.md): PR descriptions and code review comments. Load with `weave-commit`.
- [`weave-changelog`](skills/weave-changelog/SKILL.md): changelogs and release notes.

Bahasa Indonesia:

- [`weave-copywriting-id`](skills/weave-copywriting-id/SKILL.md): Indonesian copywriting tells.
- [`weave-ui-id`](skills/weave-ui-id/SKILL.md): Indonesian UI localization (Rupiah, numbers, dates, time, phone, address, translation overflow). Load with `weave-ui`.

## Install

```bash
npx agentic-weave
```

The installer asks which agents to install for, whether to install globally or into the current project, and which skills to add. Each skill's dependencies, such as `weave-core`, are added automatically. For a project install it can also add a short agentic-weave block to `./AGENTS.md`, between markers it updates on later installs.

| Target (`-t`) | Global folder | Project folder | Also read by |
| --- | --- | --- | --- |
| `claude` | `~/.claude/skills` | `.claude/skills` | OpenCode, Amp, Grok; Cline per project |
| `agents` | `~/.agents/skills` | `.agents/skills` | Codex, Cursor, GitHub Copilot, OpenCode, Amp, Grok; Antigravity per project |
| `antigravity` | `~/.gemini/antigravity-cli/skills`, `~/.gemini/config/skills` | `.agents/skills` | |
| `hermes` | `~/.hermes/skills` | none documented | |
| `cline` | `~/.cline/skills` | `.cline/skills` | |
| `kiro` | `~/.kiro/skills` | `.kiro/skills` | |
| `windsurf` | `~/.codeium/windsurf/skills` | `.devin/skills` | |
| `junie` | none documented | `.junie/skills` | |
| `grok`, `opencode` | `~/.grok/skills`, `~/.config/opencode/skills` | `.grok/skills`, `.opencode/skills` | Only needed without `claude` or `agents`; both agents already read those folders |

Paths come from each agent's documentation as of 2026-10-29 (`research/2026-10-29-04-tahap-1-deep.md`).

Without prompts:

```bash
npx agentic-weave install ui ui-id -t claude -y
npx agentic-weave install -t claude,agents,antigravity -y
npx agentic-weave install -t both -p --with-agents-md -y
npx agentic-weave list
npx agentic-weave remove -y
```

After a global install (`npm i -g agentic-weave`) Update with `npx agentic-weave@latest`.

In Claude Code 2.1.275 or later, the repository also installs as a plugin, which updates with the repo:

```text
/plugin install agentic-weave --marketplace cendysaputra/agentic-weave
```

On older versions, run `/plugin marketplace add cendysaputra/agentic-weave`, then `/plugin install agentic-weave@imajiner-agentic-weave`.

Contributors and agents working on this repository: read [`AGENTS.md`](AGENTS.md). The same skills also install through the skills CLI (`npx skills add cendysaputra/agentic-weave`), or by copying `weave-core` plus the folders you need into `~/.claude/skills/` or `~/.agents/skills/`.

## Upgrading from anti-ai-skills

Version 1.0.0 shipped as the npm package `anti-ai-skills` with skills named `antiai-*`. The project is now Agentic Weave: the package is `agentic-weave`, the skills are `weave-*` (for example `antiai-ui` became `weave-ui`), the Claude Code plugin is `agentic-weave`, and the flow keeps its state in `.weave/` instead of `.antiai/`. Rule IDs (R-XX, C-X) are unchanged. Running `npx agentic-weave` removes the old `antiai-*` folders it replaces.

## Publishing

```bash
npm login
npm version patch
npm publish
git push --follow-tags
```

`npm version` bumps `package.json` and creates a git tag. Publishing needs npm two-factor authentication.
