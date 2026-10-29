# anti-ai

Custom antiai skill collection, structured like the antiai system: one skill per concern, in `skills/<name>/SKILL.md`.

## Skills

- [`antiai-copywriting-id`](skills/antiai-copywriting-id/SKILL.md) — Bahasa Indonesia copywriting tells. Load with the antiai core and `antiai-copywriting`.
- [`antiai-ui-id`](skills/antiai-ui-id/SKILL.md) — Indonesian UI localization (Rupiah, numbers, dates, time, phone, address, translation overflow). Load with the antiai core and `antiai-ui`.
- [`antiai-commit`](skills/antiai-commit/SKILL.md) — anti-slop commit messages. Load with the antiai core.

These skills depend on the antiai core (`antiai.md`); they reference its rules by number and do not bundle it.

## Install

Copy a skill folder into your skills directory (for example `~/.agents/skills/<name>/`), or install via `npx skills add cendysaputra/anti-ai`.
