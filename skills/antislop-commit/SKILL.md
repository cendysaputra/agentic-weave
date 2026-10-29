# antislop-commit

> Anti Slop: Rules for AI Coding Agents. Commit message skill

> Part of the antislop system. Read together with `antislop.md` (the core). This skill filters commit messages that read as generically AI, and preserves a history you can actually read and bisect. It references core rules by number and never duplicates or renumbers them. Load it when the task writes or reviews commit messages.

## How to use this skill

- Load together with `antislop.md` whenever the task touches commit messages.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- Scope guardrail: this skill governs the message, never the diff.
- The Delivery Gate in the core remains the gate. The checklist at the end supplements it.

## Commit Messages

Commit messages are user-facing text the same way copy is. A commit that reads like an AI wrote it ("Update code", "Fix bug", "Minor changes") is slop with the same tells as a generic CTA, and it destroys the history's usefulness.

### Generic Commit Subjects

- **Tell:** `Update code`, `Fix bug`, `Improve performance`, `Add feature`, `Refactor`, `WIP`, `Fix issue`, `Update dependencies`, `Clean up code`, `Minor changes`.
- **Why:** the subject names no change. Ten commits that all say "Update code" are a history you cannot read or bisect.
- **Fix:** write the subject as a specific imperative that names what changed: `Fix: stop duplicate webhook processing on Stripe retry`, `Add: rate-limit the login endpoint to 5/min`, `Remove: dead billing report query`.
- **Rule:** R-31, C-1.

### Emoji and Decorative Prefixes

- **Tell:** `✨ feat: ...`, `🐛 fix: ...`, `🔥 ...`, `🚀 ...` leading every commit.
- **Why:** emoji is the same decorative noise in commits as it is in code comments and UI text; it carries no information the type line already carries.
- **Fix:** drop the emoji. If a type prefix helps, use a plain conventional-commit type (`fix:`, `feat:`, `docs:`, `test:`, `chore:`) and put the meaning in the words, not the glyph.

### Buzzword Subjects

- **Tell:** `optimize`, `enhance`, `streamline`, `refactor code for better performance`, `improve UX`, `make it more robust`, with no detail.
- **Why:** these are the commit-message form of AI buzzwords: a claim with no named change, so the reader cannot tell what happened.
- **Fix:** name the concrete change and, when it matters, why: `fix: cache the report query so the dashboard loads under 1s`.

### Vague and Over-Explained Bodies

- **Tell:** on one end, a body that only repeats the subject ("This commit updates the code."); on the other, a multi-paragraph body narrating every edit with reasons, history, and issue numbers.
- **Why:** both are filler. A body earns its place when it carries information the subject does not: the non-obvious why, a migration note, a breaking change.
- **Fix:** keep the body to one or two lines only when they add a real fact. Drop the rest. If the subject already says it, no body.

## Commit Skill Checklist

Run these alongside the core Delivery Gate. Every line below must be true:

- [ ] Every subject names a specific change, not a generic verb (R-31)
- [ ] No emoji or decorative prefixes (R-31)
- [ ] The subject is a short imperative (or conventional `type: subject`), not a sentence (C-1)
- [ ] The body adds a fact the subject does not already carry, in one or two lines at most (R-31)
