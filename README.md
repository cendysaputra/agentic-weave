# anti-ai

Custom antislop skill collection, structured like the antislop system: one skill per concern, in `skills/<name>/SKILL.md`.

## Skills

- [`antislop-copywriting-id`](skills/antislop-copywriting-id/SKILL.md) — Bahasa Indonesia copywriting tells. Load with the antislop core and `antislop-copywriting`.
- [`antislop-ui-id`](skills/antislop-ui-id/SKILL.md) — Indonesian UI localization (Rupiah, numbers, dates, time, phone, address, translation overflow). Load with the antislop core and `antislop-ui`.
- [`antislop-commit`](skills/antislop-commit/SKILL.md) — anti-slop commit messages. Load with the antislop core.

These skills depend on the antislop core (`antislop.md`); they reference its rules by number and do not bundle it.

## Install

Copy a skill folder into your skills directory (for example `~/.agents/skills/<name>/`), or install via `npx skills add cendysaputra/anti-ai`.
