# agentic-weave

Agent skills that catch AI slop in the text and UI an agent produces, published on npm as `anti-ai-skills`. One skill per concern, in `skills/<name>/SKILL.md`. Each entry names a tell, why it reads as generated, and the fix, and each skill ends with a checklist.

## Skills

Start with [`antiai-core`](skills/antiai-core/SKILL.md). It defines the numbered rules (R-XX for wording, C-X for structure and checks) and the Delivery Gate that every other skill cites. Load it alongside whichever skill fits the task.

Projects:

- [`antiai-flow`](skills/antiai-flow/SKILL.md): a web project from brief to client handoff in nine stages. Each stage writes a file in `.antiai/` and passes a gate that `scripts/flow.mjs` checks, so any agent can pick up where another stopped. Modes: build, atm, rewrite, audit.
- [`antiai-convert`](skills/antiai-convert/SKILL.md): turn a static build or ATM rebuild into WordPress with ACF, Elementor V4 JSON (checked by `validate-elementor.mjs` against a real export), WooCommerce, Statamic, Laravel Blade, Astro, or React, with tokens from one file, motion that cleans up on page transitions, and a similarity check against the static build.

Interfaces:

- [`antiai-ui`](skills/antiai-ui/SKILL.md): web and app UI that looks generated (default fonts, purple gradients, stock landing-page layout, preset motion), raised to Awwwards jury craft: concept, signature moment, Core Web Vitals, accessibility, and a rubric self-score. Its scripts need Playwright (`npm i -D playwright && npx playwright install chromium`):
  - `crawl-reference.mjs` reports a reference site's type, palette, motion stack, performance, and accessibility, with screenshots.
  - `snapshot-site.mjs` and `compare-build.mjs` run ATM (Amati, Tiru, Modifikasi). They save a raw local copy of a page, score a rebuild's similarity, then gate the modified version on originality: no reused text, assets, or brand.
  - `references/libraries.md` is a vetted shortlist of animation, scroll, transition, 3D, and vector libraries (GSAP, Lenis, Swup, Barba.js, Three.js, Rive, and more).

Writing for people:

- [`antiai-chat`](skills/antiai-chat/SKILL.md): assistant and agent replies (canned openers and closers, sycophancy, over-apologizing, hedging).
- [`antiai-docs`](skills/antiai-docs/SKILL.md): READMEs and documentation (chat leaks, cutoff disclaimers, template skeletons, emoji headings).
- [`antiai-email`](skills/antiai-email/SKILL.md): emails and notifications (generic subjects, signposting, empty CTAs).
- [`antiai-error`](skills/antiai-error/SKILL.md): error messages, validation text, and logs.

Version control:

- [`antiai-commit`](skills/antiai-commit/SKILL.md): commit messages.
- [`antiai-pr`](skills/antiai-pr/SKILL.md): PR descriptions and code review comments. Load with `antiai-commit`.
- [`antiai-changelog`](skills/antiai-changelog/SKILL.md): changelogs and release notes.

Bahasa Indonesia:

- [`antiai-copywriting-id`](skills/antiai-copywriting-id/SKILL.md): Indonesian copywriting tells.
- [`antiai-ui-id`](skills/antiai-ui-id/SKILL.md): Indonesian UI localization (Rupiah, numbers, dates, time, phone, address, translation overflow). Load with `antiai-ui`.

## Install

```bash
npx anti-ai-skills
```

The installer asks which agents to install for, whether to install globally or into the current project, and which skills to add. Each skill's dependencies, such as `antiai-core`, are added automatically. For a project install it can also add a short agentic-weave block to `./AGENTS.md`, between markers it updates on later installs.

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
npx anti-ai-skills install ui ui-id -t claude -y
npx anti-ai-skills install -t claude,agents,antigravity -y
npx anti-ai-skills install -t both -p --with-agents-md -y
npx anti-ai-skills list
npx anti-ai-skills remove -y
```

After a global install (`npm i -g anti-ai-skills`) the command is also available as `anti-ai`. Update with `npx anti-ai-skills@latest`.

In Claude Code 2.1.275 or later, the repository also installs as a plugin, which updates with the repo:

```text
/plugin install anti-ai --marketplace cendysaputra/agentic-weave
```

On older versions, run `/plugin marketplace add cendysaputra/agentic-weave`, then `/plugin install anti-ai@imajiner-agentic-weave`.

Contributors and agents working on this repository: read [`AGENTS.md`](AGENTS.md). The same skills also install through the skills CLI (`npx skills add cendysaputra/agentic-weave`), or by copying `antiai-core` plus the folders you need into `~/.claude/skills/` or `~/.agents/skills/`.

## Publishing

```bash
npm login
npm version patch
npm publish
git push --follow-tags
```

`npm version` bumps `package.json` and creates a git tag. Publishing needs npm two-factor authentication.
