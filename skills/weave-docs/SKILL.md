---
name: weave-docs
description: "Write and review documentation that reads as authored, not generated: READMEs, how-tos, reference, docblocks, ADRs, runbooks, client handoff guides, AGENTS.md, and Indonesian docs. Requires samples that were run and APIs that exist; ships templates and lint-docs.mjs. Load with weave-core."
---

# weave-docs

> Agentic Weave: Rules for AI Coding Agents. Documentation skill

> Part of the Agentic Weave system. Read together with `weave-core`. The worst documentation slop is not its tone but what nobody checked: samples that were never run, packages that do not exist, versions that are missing. This skill covers both. It references core rules by number and never duplicates or renumbers them.

## How to use this skill

- Load together with `weave-core` whenever the task writes or edits a README, guide, reference page, docblock, decision record, runbook, client guide, or a file for agents. Commits, PRs, changelogs, errors, and emails have their own skills.
- Decide the document type first (below), then write only what that type needs.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- Run `scripts/lint-docs.mjs` on the files you wrote (`--sapaan kamu` or `--sapaan anda` for Indonesian docs). It catches the mechanical tells; the checklist catches the rest.
- The Delivery Gate in `weave-core` remains the gate. The checklist at the end supplements it.

## Pick the Document Type First

Each type answers a different need (Diátaxis, plus the agency documents). A page that tries to be several of them at once is the most common generated-README shape.

| Type | Reader wants | Read | Template |
| --- | --- | --- | --- |
| Tutorial | To learn by doing, start to finish | this file | |
| How-to | To reach one goal they already have | this file | |
| Reference | Exact facts while working; generate it from code where possible | `references/docstring.md` | |
| Explanation | Why it works this way | this file | |
| README | Orientation: what it is, how to run it, where things are | `references/readme.md` | `assets/templates/README.project.md` |
| Decision record (ADR) | Why a choice was made and what it cost | `references/decisions-and-runbooks.md` | `assets/templates/ADR.md` |
| Runbook | To fix an incident now | `references/decisions-and-runbooks.md` | `assets/templates/RUNBOOK.md` |
| Client handoff guide | To do a content task without a developer | `references/client-handoff.md` | `assets/templates/HANDOFF.md` |
| Agent instructions | Commands and conventions an agent cannot infer | `references/agent-docs.md` | |

Indonesian documentation: read `references/docs-id.md`. Linters and sample testing: `references/tooling.md`.

## Verification

### Unrun Code Samples

- **Tell:** a command or code block that was never executed: no output, no version, a `...` in the middle of a command, a flag nobody checked.
- **Why:** a wrong example is worse than none. Readers paste it, it fails, and they stop trusting the rest of the page.
- **Fix:** run every block in a clean environment and keep what you ran. Mark a block that cannot be run as illustration. Tag every fence with its language so it can be linted and tested.
- **Rule:** R-44, R-17.

### Hallucinated Packages and APIs

- **Tell:** `npm install gsap-scrolltrigger`, a WordPress hook or Laravel helper that does not exist, a CLI flag from a different version.
- **Why:** in one study, 5.2% (commercial models) to 21.7% (open models) of generated package names did not exist, and repeated fake names can be registered by attackers. Docs carry the same risk.
- **Fix:** check every name against the code or the registry (`npm view <name>`, `composer show`, the official docs) before it goes in. ScrollTrigger, for example, ships inside the `gsap` package (`gsap/ScrollTrigger`, checked in gsap 3.15.0).
- **Rule:** R-44, R-17.

### Version-less Instructions

- **Tell:** "Install the latest version", or setup steps with no PHP, WordPress, or Node version.
- **Why:** the steps go stale silently, and nobody can tell which part broke.
- **Fix:** state what it was tested with and when: "Tested with: PHP 8.3, WordPress 6.9, Node 22, 2026-10-30."
- **Rule:** C-5, R-44.

### False Precision

- **Tell:** "40% faster", "compatible with every theme", "zero downtime" with no method behind it.
- **Why:** a number with no measurement is invented (R-18).
- **Fix:** state the conditions it was measured under, or drop the number.
- **Rule:** R-18.

### Drifted Docs

- **Tell:** option names, ACF fields, routes, or screenshots in the docs that no longer match the code or the dashboard.
- **Why:** incorrect documentation is worse than missing documentation.
- **Fix:** keep docs in the same repository and change them in the same commit or PR as the behavior. Date every screenshot.
- **Rule:** R-46.

## Chat Leaks

### Conversational Openers

- **Tell:** docs that open like one side of a chat: "Certainly! Here's how to configure the database.", "Great question! The middleware processes requests in order.", "I'd be happy to explain the flow."
- **Why:** a README is authored text, not a reply. The opener is a leftover from the chat session it was generated in, and it signals the doc was pasted, not written.
- **Fix:** delete the opener and start at the fact: "Configure the database with these environment variables.", "The middleware processes requests in order."
- **Rule:** R-02, R-36.

### Cutoff Disclaimers

- **Tell:** "As of my last update, the API supports cursor pagination.", "Based on current knowledge, PostgreSQL 16 introduced merge joins.", "I cannot guarantee this behavior will stay consistent."
- **Why:** the disclaimer exposes the model's training cutoff and erodes confidence in the doc. A reader wants the version, not the hedge.
- **Fix:** replace the hedge with a versioned fact: "The API supports cursor pagination (v2.3+).", "PostgreSQL 16 introduced merge joins (see release notes)." Pin versions instead of apologizing for knowledge.
- **Rule:** R-36, C-5.

### Sycophantic Tone

- **Tell:** docs that praise the product or the reader: "This elegant architecture is truly impressive.", "Our powerful, world-class platform."
- **Why:** praise in docs reads as marketing, not information. It inflates without adding a fact.
- **Fix:** state what it does, not how great it is: "The cache sits in front of the database.", "The platform stores and queries invoices."
- **Rule:** R-16, R-36.

### Walkthrough Preamble

- **Tell:** "This guide will walk you through...", "Dalam panduan ini kita akan belajar...".
- **Why:** a how-to reader arrives with a goal; the preamble delays step one.
- **Fix:** open with the end result and the prerequisites, then step 1: "Hasil akhir: field `hero_title` tampil di beranda. Kamu butuh ACF Pro dan akses admin."
- **Rule:** R-36.

## Structure

### Mode Mixing

- **Tell:** one README holding a tutorial, a full API table, a design essay, and an FAQ.
- **Why:** each type serves a different moment; mixed together, none of them is findable.
- **Fix:** split by type. The README orients and links; the rest lives in its own file.
- **Rule:** R-05.

### Template README Skeleton

- **Tell:** a README built from the same skeleton every time: a badges row, a centered logo, "✨ Features", "🚀 Getting Started", "## Contributing", "## License", with placeholder text under each.
- **Why:** the skeleton exists because every generated README has it, not because the project needs it. Empty sections are content without purpose.
- **Fix:** build the README around what the reader actually needs: what it does, how to install, how to run, where the docs live. Cut the sections that have nothing to say (C-3).
- **Rule:** R-05, C-3.

### Badge Walls and Placeholder Sections

- **Tell:** eight badges on an internal repository; "Contributing: PRs welcome!" or "License: MIT" with no license file; "Roadmap: coming soon".
- **Why:** each one signals something that is not true or not there.
- **Fix:** keep badges that show live status (CI, released version). Delete empty sections or link the real file. Plans go in the issue tracker, not the docs.
- **Rule:** R-05, C-3, C-5.

### Recap Echo

- **Tell:** "In summary" or "Kesimpulannya" closing a short page by repeating it.
- **Why:** repetition that helps (prerequisites repeated in each how-to) is fine; a recap of the page the reader just read is filler.
- **Fix:** end on the last step or a "Next steps" link.
- **Rule:** R-36, C-3.

### Emoji Decoration

- **Tell:** 🚀, ✨, 💡, ✅ leading every heading: "🚀 Features", "✨ Highlights", "💡 Tips".
- **Why:** the emoji carries no information. It decorates instead of communicates.
- **Fix:** remove the emoji. A plain heading reads stronger than a decorated one.
- **Rule:** R-04, R-36.

### Buzzword Feature Lists

- **Tell:** a features list made of AI buzzwords: "Fast, secure, and scalable.", "Blazingly fast.", "Enterprise-grade."
- **Why:** the words are claims with no evidence. They fill the list without telling the reader what the tool does.
- **Fix:** one concrete sentence per feature, with the real capability: "Runs the test suite in under two seconds.", "Encrypts data at rest with AES-256."
- **Rule:** R-16, R-36.

## Wording

### Over-Explained Sentences

- **Tell:** a one-line fact stretched into a paragraph with reasoning chains, history, and issue numbers.
- **Why:** padding a fact into a paragraph buries the one line that matters under the lines that do not.
- **Fix:** cut to the fact. One line, two at most. A doc earns length only when each sentence adds information.
- **Rule:** R-31.

### Actorless Passive

- **Tell:** "The decision was made to deprecate the v1 API.", "The config file is updated automatically."
- **Why:** deleting the actor hides who does what, and it is the corporate default the model copies.
- **Fix:** name the actor: "We deprecated the v1 API.", "The CLI updates the config file on each run."
- **Rule:** R-02.

### Hedge Stacks and Vague Links

- **Tell:** "may potentially", "mungkin saja bisa"; links named "click here" or "di sini".
- **Why:** stacked hedges leave the reader unsure what is true; vague links cannot be scanned.
- **Fix:** one claim with one condition ("If X, then Y"). Link the name of the destination: "see the deployment guide".
- **Rule:** R-31.

### Signature Echo and Narration

- **Tell:** `@param int $product_id The product ID.`, "This function gets the user." above `getUser()`, `// loop through items`.
- **Why:** it repeats what the name and types already say and adds reading without information.
- **Fix:** write what the code cannot say (units, ranges, null cases, side effects, the reason), or nothing. See `references/docstring.md`.
- **Rule:** R-45.

## Decisions and Agent Docs

### Decisions Without Downsides

- **Tell:** an ADR that lists only benefits, with no rejected option and a context like "we need a scalable solution".
- **Why:** a decision record exists so the next person knows what the choice cost.
- **Fix:** name the alternatives and why they lost, and at least one negative consequence.
- **Rule:** R-48.

### Generic or Bloated Agent Instructions

- **Tell:** "Write clean code", "Follow best practices", a repository tour, or an AGENTS.md generated once and never edited.
- **Why:** one evaluation found context files generally did not raise task success while raising inference cost by more than 20%; agents follow them, so vague or wrong rules cost twice.
- **Fix:** keep only exact commands, non-standard conventions, and specific prohibitions. CLAUDE.md imports AGENTS.md instead of copying it. See `references/agent-docs.md`.
- **Rule:** R-47.

## Docs Skill Checklist

Run these alongside the Delivery Gate in `weave-core`. Every line below must be true:

- [ ] The document is one type, and its first sentence says what it is and for whom (R-05)
- [ ] Every code block has a language and was run, or is marked as illustration (R-44)
- [ ] Every package, function, hook, flag, and field exists in the code or registry (R-44, R-17)
- [ ] Install and setup steps name the versions and date they were tested with (C-5)
- [ ] No number without its measurement, no placeholder section, no pre-announcement (R-18, C-3)
- [ ] No chat openers, cutoff disclaimers, praise, walkthrough preambles, or recaps (R-02, R-36)
- [ ] Docblocks add what the types do not say (R-45)
- [ ] Decision records name rejected options and a downside (R-48)
- [ ] Agent files hold only concrete, non-standard instructions (R-47)
- [ ] Indonesian docs: one form of address, UI labels exactly as on screen, terms from the glossary
- [ ] `lint-docs.mjs` reports no errors (R-02)
