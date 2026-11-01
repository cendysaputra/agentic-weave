# agentic-weave Research

This folder holds the research behind the agentic-weave skills. None of it is installed with the skills (the installer only copies `skills/`), so it can grow long.

## How to read it

Start with the newest file. Facts that a skill relies on are copied into that skill's `references/` with a verification date; the research file keeps the full sources and the reasoning.

| File | Contents | Status |
|---|---|---|
| [`2026-10-30-01-anti-slop-documentation.md`](2026-10-30-01-anti-slop-documentation.md) | Anti-slop documentation: evidence (hallucinated packages, AGENTS.md evaluation), Diátaxis, docstrings, ADRs, runbooks, client handoff, llms.txt, EYD V, Vale and markdownlint | Applied in `weave-docs` and rules R-44 to R-48 |
| [`2026-10-29-04-stage-1-deep.md`](2026-10-29-04-stage-1-deep.md) | Agent compatibility matrix, the agentskills.io specification, skill-smell research, AGENTS.md, Claude Code plugin marketplaces | Basis for the installer targets |
| [`BACKLOG.md`](BACKLOG.md) | Queue of research topics | Updated each session |

Earlier files (the initial cross-domain research, the gap analysis of commit `ebe7cfe`, and the first web-search version of stage 1) were superseded and removed on 2026-11-01. They are in git history at commit `dbda9c9`. Research on the project flow, CMS conversion, crawling, and design tokens now belongs to the [deflow](https://github.com/cendysaputra/deflow) repository.

## Conventions

- **File names:** `YYYY-MM-DD-NN-<slug>.md`, where NN is the sequence number for that day.
- **Claim labels:** FACT (with a primary source), RECOMMENDATION (a proposed design), UNVERIFIED (do not put it in a skill before checking).
- **Sources:** every section lists URLs. Prefer official documentation, papers, and source repositories.
- **Verification date:** facts about tools and agents change quickly, so the date in the file name is the verification date.
- **Style:** English, no em dashes (R-02), no decorative emoji (R-04).

## From research to skill

1. Pick a topic from `BACKLOG.md`.
2. Write the result to a new file in this folder.
3. Copy verified facts into `skills/<name>/references/` with their verification date.
4. Mark the backlog item done and point it at the result file.
