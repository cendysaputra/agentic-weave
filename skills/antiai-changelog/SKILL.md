---
name: antiai-changelog
description: "Filters changelogs and release notes that read as AI-generated: generic entries, emoji category markers, marketing-speak, missing version/date, and empty template sections. Use when writing or editing a CHANGELOG, release notes, or version history. Load with antiai-core."
---

# antiai-changelog

> Anti Slop: Rules for AI Coding Agents. Changelog skill

> Part of the antiai system. Read together with `antiai-core`. This skill filters changelogs and release notes that read as generically AI. It references core rules by number and never duplicates or renumbers them. Load it when the task writes or edits a changelog or release notes.

## How to use this skill

- Load together with `antiai-core` whenever the task is a changelog, release notes, or version history.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- The Delivery Gate in `antiai-core` remains the gate. The checklist at the end supplements it.

## Entries

### Generic Entries

- **Tell:** "Bug fixes and improvements.", "Performance improvements.", "Various fixes.", "General updates."
- **Why:** the entry names no change, so the changelog tells the reader nothing and is unbisectable.
- **Fix:** name the specific change and, when it matters, who it affects: "Fixed: exports no longer drop rows when a cell is empty.", "Faster: the dashboard loads in under one second."
- **Rule:** R-31, C-1.

### Emoji Categories

- **Tell:** ✨, 🐛, 🚀, 💥 leading every changelog line as a category marker.
- **Why:** emoji is decorative noise; the category is already in the words ("Fixed:", "Added:").
- **Fix:** drop the emoji and use plain category words: "Added:", "Fixed:", "Changed:", "Removed:".
- **Rule:** R-04.

### Marketing-Speak

- **Tell:** "This revolutionary release redefines productivity.", "A game-changing update.", "Unlock the next level."
- **Why:** release notes are a record of what changed, not an ad. The hype buries the facts.
- **Fix:** state the change plainly: "Added: bulk export to CSV."
- **Rule:** R-16, R-36.

## Structure

### Missing Version and Date

- **Tell:** a changelog entry with no version number or date, or "Latest" / "Upcoming" instead of a real release.
- **Why:** without the version and date, the reader cannot map a change to a release or bisect a regression.
- **Fix:** every release block carries the version and date: "## 1.4.0 (2025-08-17)".
- **Rule:** R-31.

### Empty Template Sections

- **Tell:** "## Added", "## Changed", "## Fixed" headers with nothing under one or more of them.
- **Why:** an empty section is a template artifact, not content. It adds length without information.
- **Fix:** list only the categories that have entries, and drop the empty headers (C-3).
- **Rule:** R-05, C-3.

## Changelog Skill Checklist

Run these alongside the Delivery Gate in `antiai-core`. Every line below must be true:

- [ ] Every entry names a specific change, with no "bug fixes and improvements" (R-31)
- [ ] No emoji category markers (R-04)
- [ ] No marketing-speak or hype (R-16)
- [ ] Every release carries a version and date (R-31)
- [ ] No empty category sections (R-05, C-3)
