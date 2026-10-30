---
name: weave-pr
description: "Filters pull request descriptions and code review comments that read as AI-generated: generic subjects, template body skeletons, chat leaks, self-congratulation, sycophantic or vague review comments, and over-apologizing. Use when writing or reviewing a PR. Load with weave-core and weave-commit."
---

# weave-pr

## How to use this skill

- Scope guardrail: this skill governs the description and the review words, never the diff.

## PR Descriptions

### Generic Subjects

- **Tell:** "Update", "Fix", "Add feature", "Changes", "PR for issue #123", with no named change.
- **Why:** the subject names no change, so the list of PRs is unreadable and unbisectable, the same failure as a slop commit.
- **Fix:** a specific imperative subject that names what changed: "Add: retry with backoff for the billing webhook", "Fix: stop duplicate event processing on Stripe retries".
- **Rule:** R-31, C-1.

### Template Body Skeleton

- **Tell:** a PR body built from the same headers every time: "## Summary", "## Changes", "## Testing", each followed by a line that restates the title or says nothing.
- **Why:** the skeleton exists because the template has it, not because the change needs it. Empty sections add length without information.
- **Fix:** write the body around what a reviewer needs: what changed and why, what to test, what is risky. Drop the headers that have nothing to say (C-3).
- **Rule:** R-05, C-3.

### Chat Leaks in Descriptions

- **Tell:** "Here's what I did in this PR.", "As requested, this handles the edge case.", "Let me explain the changes."
- **Why:** the description reads as one side of a chat, not as a record of the change.
- **Fix:** cut the preamble and state the change: "This PR moves retry logic into the webhook handler."
- **Rule:** R-02, R-36.

### Self-Congratulation

- **Tell:** "This PR is a major improvement.", "This is a much cleaner approach.", "A big step forward."
- **Why:** the praise is a claim with no evidence, and it is the model flattering its own work.
- **Fix:** let the change speak. State what changed and why it matters, without the grade.
- **Rule:** R-36.

## Code Review

### Sycophantic Comments

- **Tell:** "Great work!", "Excellent approach!", "This is a brilliant way to handle it!", "Love this."
- **Why:** praise without technical substance is noise. It reads as flattery, not review, and it tells the author nothing actionable.
- **Fix:** replace praise with a specific observation: "The factory decouples instantiation from the handler.", or approve with silence when there is nothing to say.
- **Rule:** R-31.

### Vague Feedback

- **Tell:** "LGTM.", "Consider refactoring.", "Maybe simplify this.", "This could be cleaner.", with no named change.
- **Why:** the comment names a feeling, not a task. The author cannot act on it.
- **Fix:** name the concrete change and why: "Split this 60-line function at the validation step so it can be tested alone."
- **Rule:** R-31.

### Over-Apologizing in Review

- **Tell:** "Sorry if I missed something.", "I might be wrong, but...", "Apologies for the nitpick."
- **Why:** hedging and apology in review soften the signal. A reviewer states the finding, not the apology.
- **Fix:** state the finding plainly: "This reads the file on every request; cache the result."
- **Rule:** R-02, R-36.

## PR Skill Checklist

Run these alongside the Delivery Gate in `weave-core`. Every line below must be true:

- [ ] The PR subject names a specific change, not a generic verb (R-31)
- [ ] The body describes what changed, why, and what to test, with no empty template sections (R-05, C-3)
- [ ] Testing notes name the commands or checks that ran, and say what was not tested (R-50)
- [ ] No chat leaks ("Here's what I did", "As requested") in the description (R-02)
- [ ] No self-congratulation or vague praise in the description or review (R-36)
- [ ] Review comments name a concrete change and why, with no "LGTM"-style filler (R-31)
- [ ] No over-apologizing or hedging in review feedback (R-02)
