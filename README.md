# anti-ai

Custom skill collection for filtering AI slop. One skill per concern, in `skills/<name>/SKILL.md`.

## Skills

- [`antiai-copywriting-id`](skills/antiai-copywriting-id/SKILL.md): Bahasa Indonesia copywriting tells. Load with the core and `antiai-copywriting`.
- [`antiai-ui-id`](skills/antiai-ui-id/SKILL.md): Indonesian UI localization (Rupiah, numbers, dates, time, phone, address, translation overflow). Load with the core and `antiai-ui`.
- [`antiai-commit`](skills/antiai-commit/SKILL.md): anti-slop commit messages.
- [`antiai-docs`](skills/antiai-docs/SKILL.md): anti-slop README and documentation (chat leaks, cutoff disclaimers, sycophantic tone, emoji).
- [`antiai-pr`](skills/antiai-pr/SKILL.md): anti-slop PR descriptions and code review.
- [`antiai-chat`](skills/antiai-chat/SKILL.md): anti-slop chat and assistant responses.
- [`antiai-error`](skills/antiai-error/SKILL.md): anti-slop error messages and logs.
- [`antiai-email`](skills/antiai-email/SKILL.md): anti-slop email and notification copy.
- [`antiai-changelog`](skills/antiai-changelog/SKILL.md): anti-slop changelogs and release notes.

These skills depend on the antiai core (`antiai.md`); they reference its rules by number and do not bundle it.

## Install

Copy a skill folder into your skills directory (for example `~/.agents/skills/<name>/`), or install via `npx skills add cendysaputra/anti-ai`.
