---
name: antiai-docs
description: "Filters READMEs, wikis, and documentation that read as AI-generated: chat-leak openers, knowledge-cutoff disclaimers, sycophantic tone, template skeletons, emoji headings, buzzword feature lists, and actorless passive. Use when writing or editing documentation. Load with antiai-core."
---

# antiai-docs

> Anti Slop: Rules for AI Coding Agents. Documentation skill

> Part of the antiai system. Read together with `antiai-core`. This skill filters READMEs, wikis, and docs that read as generically AI: chat leaks, cutoff disclaimers, sycophantic tone, emoji, and template structure. It references core rules by number and never duplicates or renumbers them. Load it when the task writes or edits documentation.

## How to use this skill

- Load together with `antiai-core` whenever the task touches a README, docs page, or wiki.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- The Delivery Gate in `antiai-core` remains the gate. The checklist at the end supplements it.

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

## Structure

### Template README Skeleton

- **Tell:** a README built from the same skeleton every time: a badges row, a centered logo, "✨ Features", "🚀 Getting Started", "## Contributing", "## License", with placeholder text under each.
- **Why:** the skeleton exists because every generated README has it, not because the project needs it. Empty sections are content without purpose.
- **Fix:** build the README around what the reader actually needs: what it does, how to install, how to run, where the docs live. Cut the sections that have nothing to say (C-3).
- **Rule:** R-05, C-3.

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

## Docs Skill Checklist

Run these alongside the Delivery Gate in `antiai-core`. Every line below must be true:

- [ ] No conversational openers ("Certainly!", "Great question!", "Here's how") in the doc (R-02)
- [ ] No cutoff disclaimers or knowledge hedges; facts are versioned instead (R-36, C-5)
- [ ] No sycophantic praise of the product or reader (R-16)
- [ ] No template skeleton or empty sections; structure follows real content (R-05, C-3)
- [ ] No emoji decoration in headings or bullets (R-04)
- [ ] No buzzword feature lists; one concrete fact per feature (R-16)
- [ ] Sentences name their actor and stay short (R-02, R-31)
