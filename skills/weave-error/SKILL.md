---
name: weave-error
description: "Filters error messages, validation text, and log lines that read as AI-generated: apologetic or vague errors, errors with no next action, chat leaks in logs, and narrative log lines. Use when writing or editing error handling, exceptions, validation feedback, or log output. Load with weave-core."
---

# weave-error

> Agentic Weave: Rules for AI Coding Agents. Error message and log skill

> Part of the Agentic Weave system. Read together with `weave-core`. This skill filters error messages, log lines, and validation text that read as generically AI: apologetic, vague, or theatrical. It references core rules by number and never duplicates or renumbers them. Load it when the task writes or edits error handling.

## How to use this skill

- Load together with `weave-core` whenever the task touches error messages, exceptions, log output, or validation feedback.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- The Delivery Gate in `weave-core` remains the gate. The checklist at the end supplements it.

## Error Messages

### Apologetic Errors

- **Tell:** "Sorry for the confusion, but the config could not be loaded.", "I apologize for any inconvenience, but the input is invalid.", "We regret to inform you the connection failed."
- **Why:** an error is information, not a social interaction. The apology hides the diagnostic detail the user actually needs.
- **Fix:** drop the apology and state what failed and what to do: "Failed to load config from config.yaml: invalid YAML at line 12.", "Invalid input: expected an ISO 8601 date, got 'tomorrow'."
- **Rule:** R-02, R-36.

### Vague Errors

- **Tell:** "Something went wrong.", "An error occurred.", "Unexpected error.", "Operation failed."
- **Why:** the message names no cause and no next action, so the user is stuck. It is a placeholder, not an error.
- **Fix:** name what failed and the next step: "Could not reach the payment API. Check your connection and retry.", "Upload failed: the file is larger than 5 MB."
- **Rule:** R-26, R-27.

### Errors With No Action

- **Tell:** "Invalid input." with no statement of what was expected or how to fix it.
- **Why:** knowing it is invalid does not tell the user how to make it valid. The message is half of an answer.
- **Fix:** state the expectation: "Invalid input: expected an ISO 8601 date, got 'tomorrow'."
- **Rule:** R-27.

## Log Output

### Chat Leaks in Logs

- **Tell:** "Sure thing! Validating the token format.", "Here's the implementation for the retry logic." in log lines or comments.
- **Why:** log text and comments should read as authored, not as one side of a chat session.
- **Fix:** write plain, specific lines: "Validating token format.", "Retrying with exponential backoff, max 3 attempts."
- **Rule:** R-02, R-31.

### Verbose Log Lines

- **Tell:** a log message that narrates the whole flow in one line: "Starting the request, validating the payload, checking the cache, querying the database, and returning the response."
- **Why:** a log line should record one event with the fields needed to debug it, not a paragraph of narration.
- **Fix:** one event per line, with the values: `request=POST /orders status=201 duration_ms=84`.
- **Rule:** R-31.

## Error Skill Checklist

Run these alongside the Delivery Gate in `weave-core`. Every line below must be true:

- [ ] No apologetic or theatrical error messages (R-02)
- [ ] Every error names what failed and the next action, with no "Something went wrong" (R-26, R-27)
- [ ] Validation errors state the expected format, not just "invalid" (R-27)
- [ ] Log lines are one event with fields, not narrative paragraphs (R-31)
- [ ] No chat leaks in log text or comments (R-02)
