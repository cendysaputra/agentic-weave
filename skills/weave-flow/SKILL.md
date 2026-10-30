---
name: weave-flow
description: "Run a web project from brief to client handoff in fixed stages, each leaving a file in .weave/ and passing a gate that a script checks: brief, references, concept and tokens, copy, stack, build, QA, release, handoff. Use for new sites, ATM studies, rewrites, or audits. Load with weave-core and weave-ui."
---

# weave-flow

> Agentic Weave: Rules for AI Coding Agents. Project flow skill

> Part of the Agentic Weave system. Read together with `weave-core` and `weave-ui`. This skill orders the work on a website so that decisions are made before code and every stage leaves evidence on disk. It references core rules by number and never duplicates or renumbers them.

## How to use this skill

- State lives in files, not in the conversation. Any agent, in any session, continues from `.weave/state.json`.
- Every stage writes an artifact; every gate is checked by `scripts/flow.mjs`, not by your judgment. Run it from the project root.
- Never start a stage before the earlier gates pass. The script refuses, and so do you. Only the user can skip a gate, with `override`.
- The Delivery Gate in `weave-core` remains the gate for every piece of text. The checklist at the end supplements it.

## Modes

Pick the mode from the request and say it in the first line of your reply ("Mode: build").

| Mode | When | Gates |
| --- | --- | --- |
| `build` | A new site from a brief | G0 to G8 |
| `atm` | Study a reference without building a project | G0, G1, G2 |
| `rewrite` | Change copy or components on an existing site | G3, G5, G6 |
| `audit` | Review only. Change no files except `.weave/06-qa.json` | G6 |

```bash
node <skill-dir>/scripts/flow.mjs init --mode build
node <skill-dir>/scripts/flow.mjs check
node <skill-dir>/scripts/flow.mjs status
```

## Stages

| Gate | Stage | Artifact in `.weave/` | Passes when |
| --- | --- | --- | --- |
| G0 | Brief | `00-brief.md` | Goal, audience, three KPIs, the one thing to remember, deadline, budget, who edits content, and language are filled. Unknowns are `[TBD: who answers]`, never guesses (R-38) |
| G1 | Research | `01-research/refs.json` | Three references, each with URL, reason, and what to learn. Crawl them with the weave-ui crawler (crawl-reference.mjs) |
| G2 | Concept | `02-concept.md`, `DESIGN.md`, `tokens.tokens.json` | Concept statement, signature moment, anti-references; typography and color rows with reasons; valid project tokens. **Then the user approves** |
| G3 | Copy | `03-copy.md` | Copy for every section, checks ticked, no em dash |
| G4 | Stack | `04-stack.md` | Answers to `references/stack-decision.md`, the stack, and the libraries |
| G5 | Build | `05-build-log.md` | Sections mapped to components and data, files listed. Use weave-convert for CMS and framework targets |
| G6 | QA | `06-qa.json` | LCP 2.5 s or less, CLS 0.1 or less, INP 200 ms or less, measured with date and device; zero accessibility violations and keyboard checked; ATM gate passed if ATM was used; self-score with top fixes; Delivery Gate passed |
| G7 | Release | git | Working tree committed with weave-commit; PR written with weave-pr |
| G8 | Handoff | `07-handoff.md` | What was delivered, how to edit content, plugins and licenses, open items. No credentials in the file |

Commit `.weave/` with the project: it records decisions. Never commit `atm/` or `reference-crawl/`.

## Rules for the agent

### Code Before the Concept Is Approved

- **Tell:** markup, components, or a theme exist while G2 is not approved, or the agent says "the user will like this" and moves on.
- **Why:** the concept decides type, color, layout, and motion (R-40). Building first turns every later choice into a default.
- **Fix:** show the concept, `DESIGN.md`, and tokens to the user. Run `flow.mjs approve G2 --by "<name>" --note "<their words>"` only after they approve in their own words, and quote them.
- **Rule:** R-40.

### Filling Gaps With Guesses

- **Tell:** a brief with an invented budget, KPIs nobody stated, or a deadline "assumed" from context.
- **Why:** a filled-in guess looks like a decision and nobody checks it again (R-38).
- **Fix:** write `[TBD: who answers]`, list it to the user, and carry it to `07-handoff.md` under open items if it is still open.
- **Rule:** R-38, R-17.

### Retrying a Failing Gate

- **Tell:** running the same check or `compare-build` again and again, tweaking until it passes.
- **Why:** repeated verification loops are the most common way skills make agents slower without making the work better. The script stops after two failed checks of one gate (exit code 3).
- **Fix:** after the second failure, stop, report what fails and why, and ask the user how to proceed.
- **Rule:** C-6.

### Skipping a Gate Quietly

- **Tell:** marking a stage done in the reply while `flow.mjs status` shows it pending, or editing `state.json` by hand.
- **Why:** the next agent trusts the state file. A silent skip hides missing work.
- **Fix:** only `check`, `approve`, and `override` change state. Use `override G<n> --reason "<user's reason>"` only when the user asks to skip.
- **Rule:** R-17.

## Hand-offs between skills

- G1 and G2: weave-ui (crawler, ATM, its design-tokens reference, and build-tokens.mjs).
- G3: weave-copywriting-id for Indonesian copy; weave-core rules for any language.
- G5: weave-convert for WordPress, Elementor, WooCommerce, Statamic, Laravel, Astro, and React targets.
- G7: weave-commit and weave-pr.
- G8: weave-email for the handoff message.

## Flow Skill Checklist

Run these alongside the Delivery Gate in `weave-core`. Every line below must be true:

- [ ] The mode is stated, and `.weave/state.json` matches it
- [ ] No stage started before `flow.mjs` passed the earlier gates (R-40)
- [ ] G2 approval quotes the user's own words (R-17)
- [ ] Unknown facts are `[TBD]`, not guesses, and open ones are in the handoff (R-38)
- [ ] QA numbers were measured on a stated device, not estimated (C-6)
- [ ] No gate was retried more than twice without asking the user (C-6)
- [ ] `.weave/` is committed; `atm/` and `reference-crawl/` are not (R-43)
