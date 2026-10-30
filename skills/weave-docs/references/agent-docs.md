<!-- Detail for the weave-docs skill: AGENTS.md, CLAUDE.md, llms.txt. Sources: arXiv 2602.11988, arXiv 2511.12884, code.claude.com/docs/en/memory, llmstxt.org (research 2026-10-30). -->

# Documentation for Agents

## What the evidence says

- Gloaguen et al. (arXiv 2602.11988) found that context files, whether written by an LLM or by developers, generally did not raise task success, while inference cost rose by more than 20% on average. Agents follow the instructions they are given, and repository overviews did not help. Context files are useful for non-standard practices. The effects were small and not all significant, so cite the direction, not a verdict.
- A study of 2,303 agent context files (arXiv 2511.12884) found they evolve like configuration, through small frequent edits; most describe testing, implementation details, and architecture, and few cover security or performance.
- Claude Code's documentation asks for concrete, verifiable instructions ("Use 2-space indentation", not "Format code properly"), targets CLAUDE.md under 200 lines, and reads AGENTS.md only when there is no CLAUDE.md or CLAUDE.local.md (v2.1.277 or later).

## Rules

- Write the file by hand. A generated file left unedited is the main tell.
- Keep only what an agent cannot learn from the code: exact build, test, and lint commands; non-standard conventions (function prefixes, where ACF fields live); specific prohibitions; pointers to files (R-47).
- One source of truth: CLAUDE.md contains `@AGENTS.md` and Claude-specific notes, never a copy.
- Delete rules that conflict, and any repository tour.

Before:

```markdown
- Write clean, maintainable code
- Follow WordPress best practices
```

After:

```markdown
- Prefix every theme function with `imj_`.
- Run `vendor/bin/phpcs --standard=WordPress` before committing.
- Do not edit `wp-content/plugins/`; Composer manages plugins.
```

## llms.txt

A proposal by Jeremy Howard (first published 3 September 2024), not an IETF or W3C standard. Format: an H1 with the project name (the only required part), a blockquote summary, optional paragraphs or lists, then H2 sections of links written as `[name](url): note`. A section named `Optional` holds links that can be skipped. Add one only when the project publishes documentation for others to consume.
