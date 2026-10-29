---
name: antiai-core
description: "Core rules for the antiai skills: the numbered R-XX and C-X rules every antiai skill cites, plus the Delivery Gate run before handing over any text. Use whenever another antiai skill is loaded, or on its own when writing or reviewing any text a person will read (copy, docs, replies, commits, errors, UI strings)."
---

# antiai-core

> Anti Slop: Rules for AI Coding Agents. Core rules

> The base of the antiai system. Every other antiai skill cites the rules below by number and never redefines them. Load this skill whenever another antiai skill is loaded.

## How to use this skill

- Load it first, then the skill for the task at hand (`antiai-chat`, `antiai-commit`, `antiai-docs`, and so on).
- **R-XX** rules govern the words. **C-X** rules govern structure and checks.
- Rule numbers are stable IDs, not a sequence. Gaps are intentional; never renumber, because the skills cite these numbers.
- Before delivering, run the Delivery Gate at the end, then the checklist of every skill that was loaded.

## Writing Rules (R)

### R-02: Write as an author, not a chat

Text that ships (docs, logs, commits, PRs, UI, errors) is authored, not one side of a conversation. No chat leaks ("Certainly!", "Here's what I did", "As requested"), no apology or ceremony around a fact, and no em dashes (`—`) in output; use a comma, colon, period, or parentheses. Name the actor instead of hiding it in the passive. Start and end on substance.

### R-03: Fit the real content

Layouts are sized for the longest real string, not the sample one. No label, button, or table header may clip or overflow at any supported breakpoint or language.

### R-04: No decorative emoji

No emoji in headings, bullets, commit subjects, changelog lines, emails, or replies. If a category matters, use a word ("Fixed:", "Added:").

### R-05: Structure follows content

No template skeletons. A section exists because there is something to put in it, not because the template had a header for it.

### R-15: Name the action or value

Buttons, links, CTAs, and subject lines say what happens or what the reader gets: "Download the export", "Your invoice #1042 is due in 3 days". Not "Click here", "Learn more", "Update".

### R-16: No buzzwords or unearned praise

Cut words that claim without showing: *seamless, revolutionary, game-changing, blazingly fast, enterprise-grade, optimize, enhance, streamline*, and their Indonesian equivalents (*solusi, optimal, inovatif, komprehensif*). Do not praise the product, the reader, or your own work. Replace the claim with the concrete fact, or cut it.

### R-17: Never invent facts

No claims, features, customers, quotes, or outcomes that the source material does not support.

### R-18: Never invent numbers

No made-up statistics, prices, dates, durations, or counts. A number appears only when it came from real data.

### R-23: Honest placeholder data

Placeholder data is either clearly marked (`[REAL DATA]`) or realistic for the product's locale. Never leave filler that could ship looking real, and never `John Doe` in a product that is not for John Doe.

### R-26: No broken states

Every control works and every state the user can reach leads somewhere. A clipped label, a dead button, or an error with no way forward is a broken state.

### R-27: Errors and edge states say what happened and what to do

Error, empty, and loading states are written, not left as defaults. An error names what failed and the next action; a validation message names the expected input. "Something went wrong" is not an error message.

### R-31: Be specific

Name the concrete thing: the change, the file, the value, the cause. Use the conventions the reader uses (locale formats, plain category words). Cut sentences, list items, and bodies that carry no information, and use a list only when the content is a real list or sequence.

### R-36: No stock AI phrasing

Cut the phrases that mark text as generated: canned openers and closers ("Great question!", "I hope this helps!", "Semoga bermanfaat!"), sycophancy, repeated apologies, stacked hedges, signposting ("Let's dive in", "Berikut adalah"), false emphasis ("It's not just X, it's Y", "Tak hanya... tetapi juga"), reflexive groups of three, hype, and upbeat conclusions that say nothing.

### R-37: Do not over-sterilize

Removing slop is not removing voice. Keep natural particles (*kok, sih, dong*), deliberate register shifts, humor that lands, and local specifics. If every sentence ends up flat and generic, the fix went too far.

### R-38: Mark gaps instead of filling them

When a fact, number, or name is missing, leave a visible gap (`[REAL DATA]`, `[TBD: owner]`) and say so. A marked gap is better than a plausible invention.

## Structure and Checks (C)

### C-1: One change per summary line

Commit subjects, PR titles, and changelog entries are short and name one specific change, as an imperative or a conventional `type: subject`.

### C-2: Use real local formats

Money, numbers, phone numbers, and addresses follow the target locale's conventions, enforced in code (`Intl.NumberFormat`, locale-aware validation), not hand-typed.

### C-3: Cut empty sections

If a section, header, or category has nothing under it, delete it. Do not fill it with a restatement of the title.

### C-4: Check under real conditions

Before delivery, check against the real target: the actual locale, the longest strings, the narrowest and widest breakpoints, and real data rather than the sample.

### C-5: Version time-sensitive facts

A fact that can change carries its version or source ("cursor pagination, v2.3+"). Never hedge with knowledge-cutoff phrasing ("as of my last update").

## Delivery Gate

Run this on every piece of text before handing it over, then run the checklist of each skill that was loaded. Every line below must be true:

- [ ] No invented facts, numbers, names, or quotes; missing data is marked, not filled (R-17, R-18, R-38)
- [ ] No chat leaks, em dashes, or apology around facts (R-02)
- [ ] No stock AI phrasing: openers, closers, sycophancy, hedging, signposting, false emphasis (R-36)
- [ ] No buzzwords or unearned praise (R-16)
- [ ] No decorative emoji (R-04)
- [ ] Every sentence and section carries information; no template skeletons or empty sections (R-05, R-31, C-3)
- [ ] Actions, CTAs, and subjects name the specific action or value (R-15)
- [ ] Errors and edge states say what happened and what to do next (R-26, R-27)
- [ ] Formats and layout checked for the real locale and longest strings (R-03, C-2, C-4)
- [ ] The text still sounds like a person wrote it (R-37)
