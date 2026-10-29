# antiai-chat

> Anti Slop: Rules for AI Coding Agents. Chat response skill

> Part of the antiai system. Read together with `antiai.md` (the core). This skill filters agent and assistant responses that read as generically AI: canned openers, closers, and the praise-and-apology loop. It references core rules by number and never duplicates or renumbers them. Load it when the task writes or edits an assistant's reply.

## How to use this skill

- Load together with `antiai.md` whenever the task is an assistant or agent reply, a support answer, or any conversational output meant for a person.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- The Delivery Gate in the core remains the gate. The checklist at the end supplements it.

## Openers

### Canned Openers

- **Tell:** "Certainly!", "Great question!", "I'd be happy to help with that.", "Absolutely!", "Of course!"
- **Why:** the opener is a reflexive preamble that adds nothing before the actual answer. It is the single most reliable conversational AI tell.
- **Fix:** drop it and answer directly. Start with the fact, not the enthusiasm.
- **Rule:** R-36.

### Fake-Candid Openers

- **Tell:** "Honestly?", "Let's be honest.", "Here's the thing.", "Real talk."
- **Why:** a person being honest usually just says the thing. The pause-and-reveal is manufactured intimacy.
- **Fix:** cut the opener and state the point.
- **Rule:** R-36.

## Closers

### Canned Closers

- **Tell:** "I hope this helps!", "Let me know if you have any questions.", "Would you like me to expand on this?", "You're welcome!"
- **Why:** these are conversation artifacts that pad the answer and hand the reader a scripted next turn.
- **Fix:** end on the last useful sentence. If a follow-up is genuinely offered, state it once, specifically: "Ask if you want the migration steps."
- **Rule:** R-36.

## Tone

### Sycophancy

- **Tell:** "That's a great question!", "You raise an excellent point.", "Brilliant idea!"
- **Why:** flattering the user is noise, not service. It inflates the reply without adding a fact.
- **Fix:** answer the question. The work speaks; the praise does not.
- **Rule:** R-36.

### Over-Apologizing

- **Tell:** "I apologize for the confusion.", "Sorry for the inconvenience.", "I'm sorry if I misunderstood."
- **Why:** a short, plain correction reads stronger than a scripted apology. Repeated apology is the model's reflex, not the user's need.
- **Fix:** acknowledge once, plainly, then fix it: "That was wrong. The correct value is ..."
- **Rule:** R-36.

### Excessive Hedging

- **Tell:** "could potentially possibly", "may perhaps", "might maybe", stacked on one claim.
- **Why:** hedging everywhere makes the reply sound evasive. One qualifier does the work.
- **Fix:** keep one qualifier, or none when the fact is known.
- **Rule:** R-36.

## Structure

### Signposting

- **Tell:** "Let's dive in.", "Here's what you need to know.", "In this answer, I'll cover...", "Without further ado."
- **Why:** announcing what you are about to say instead of saying it is meta-commentary that slows the reader.
- **Fix:** skip the announcement and say the thing.
- **Rule:** R-36.

### Numbered Lists for Everything

- **Tell:** every reply forced into a numbered list, even when the answer is a single sentence or a flowing explanation.
- **Why:** the list is the model's default structure, not the content's. It fragments a simple answer into steps that were not asked for.
- **Fix:** use a list only when the content is a genuine sequence. A single answer stays a single paragraph.
- **Rule:** R-31.

### Emoji Enthusiasm

- **Tell:** 😊, 🎉, 🚀, 👍 scattered through the reply as decoration.
- **Why:** emoji is the loudest shorthand for generated text. In a reply it competes with the answer for attention.
- **Fix:** remove it. The words carry the meaning.
- **Rule:** R-04, R-36.

## Chat Skill Checklist

Run these alongside the core Delivery Gate. Every line below must be true:

- [ ] No canned openers ("Certainly!", "Great question!") or fake-candid openers ("Honestly?") (R-36)
- [ ] No canned closers ("I hope this helps!", "Let me know if you have questions") (R-36)
- [ ] No sycophantic praise of the user (R-36)
- [ ] No repeated apologies or stacked hedges (R-36)
- [ ] No signposting or forced lists where a plain answer fits (R-31)
- [ ] No decorative emoji (R-04)
- [ ] The reply starts and ends on substance, not ceremony (R-02)
