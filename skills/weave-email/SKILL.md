---
name: weave-email
description: "Filters email and notification copy that reads as AI-generated: generic or clickbait subjects, signposting openers, buzzword bodies, empty CTAs, canned closers, and emoji. Use when writing or editing emails, in-app notifications, or transactional messages. Load with weave-core."
---

# weave-email

> Agentic Weave: Rules for AI Coding Agents. Email and notification skill

> Part of the Agentic Weave system. Read together with `weave-core`. This skill filters email and notification copy that reads as generically AI. It references core rules by number and never duplicates or renumbers them. Load it when the task writes or edits emails or in-app notifications.

## How to use this skill

- Load together with `weave-core` whenever the task is an email, notification, or transactional message.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- The Delivery Gate in `weave-core` remains the gate. The checklist at the end supplements it.

## Subject Lines

### Generic Subjects

- **Tell:** "Update", "Important information", "Your account", "Notification", "Newsletter".
- **Why:** the subject names nothing, so the reader cannot decide whether to open it.
- **Fix:** name the specific event or value: "Your invoice #1042 is due in 3 days", "Your export is ready".
- **Rule:** R-15, R-31.

### Clickbait Subjects

- **Tell:** "You won't believe this update!", "This changes everything.", "A must-read."
- **Why:** the subject promises drama the body does not deliver, and it reads as spam.
- **Fix:** state the value plainly: "New: batch editing is here."
- **Rule:** R-36.

## Body

### Signposting Openers

- **Tell:** "I wanted to reach out to...", "I hope this email finds you well.", "Just writing to let you know..."
- **Why:** the opener delays the point and reads as a template. The reader wants the reason, not the ceremony.
- **Fix:** open with the reason: "Your subscription renews on 17 August."
- **Rule:** R-36.

### Buzzword Body

- **Tell:** "We're excited to announce our revolutionary new platform.", "This seamless update unlocks the next level of productivity."
- **Why:** the words are ceremony where content should be. They inflate without informing.
- **Fix:** say what changed and why it matters: "You can now edit files with two other people at the same time."
- **Rule:** R-16, R-36.

### Empty CTAs

- **Tell:** "Click here", "Learn more", "Get started", with no statement of what the button does.
- **Why:** the CTA names no action, so the reader cannot decide whether to click.
- **Fix:** name the action: "Download the export", "Renew now", "See the 3 changes to your plan."
- **Rule:** R-15.

## Notification Copy

### Canned Closers

- **Tell:** "If you have any questions, feel free to reach out.", "Thank you for being a valued customer.", "We appreciate your business."
- **Why:** the closer is boilerplate that adds nothing after the message is done.
- **Fix:** end on the last useful sentence, or keep one specific line only when there is a real next step.
- **Rule:** R-36.

### Emoji Decoration

- **Tell:** 🎉, ✨, 🚀, ✅ decorating subject lines and body copy.
- **Why:** emoji in email is the same decorative noise as elsewhere, and it reads as a marketing template.
- **Fix:** remove it. The words carry the message.
- **Rule:** R-04.

## Email Skill Checklist

Run these alongside the Delivery Gate in `weave-core`. Every line below must be true:

- [ ] The subject names the specific event or value, not a generic label (R-15)
- [ ] No clickbait or drama subjects (R-36)
- [ ] The body opens with the reason, not a signposting preamble (R-36)
- [ ] No buzzword claims; one concrete fact per sentence (R-16)
- [ ] CTAs name the specific action (R-15)
- [ ] No canned closers or decorative emoji (R-04, R-36)
