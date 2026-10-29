# anti-ai

Skills that catch AI slop in text an agent writes. One skill per concern, in `skills/<name>/SKILL.md`. Each entry names a tell, why it reads as generated, and the fix, and each skill ends with a checklist.

## Skills

Start with [`antiai-core`](skills/antiai-core/SKILL.md). It defines the numbered rules (R-XX for wording, C-X for structure and checks) and the Delivery Gate that every other skill cites. Load it alongside whichever skill fits the task.

Interfaces:

- [`antiai-ui`](skills/antiai-ui/SKILL.md): web and app UI that looks generated (default fonts, purple gradients, stock landing-page layout, preset motion), raised to Awwwards jury craft: concept, signature moment, Core Web Vitals, accessibility, and a rubric self-score. Includes a reference-site crawler (`scripts/crawl-reference.mjs`, needs Playwright) that reports a site's type, palette, motion stack, performance, and accessibility, with screenshots.

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
npx skills add cendysaputra/anti-ai
```

Or copy `antiai-core` plus the skill folders you need into your skills directory, for example `~/.claude/skills/<name>/` or `~/.agents/skills/<name>/`.
