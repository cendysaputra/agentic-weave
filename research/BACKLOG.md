# agentic-weave Research Backlog

Queue of research topics. Each session takes the highest-priority open item (`[ ]`), works on it until it is done or the session ends, and updates its status here.

**Rules:**

- One session produces one file, `YYYY-MM-DD-NN-<slug>.md` (NN is the sequence number for that day).
- A finished item gets `[x]` and the name of its result file. A half-done item gets `[~]` and a note on how far it got.
- New findings that need more research become new items in the right section. Do not work on them in the same session if they are off topic.
- Every result file labels its claims: FACT (with a primary source), RECOMMENDATION, or UNVERIFIED.
- Prefer official documentation, papers, and source repositories. Secondary sources only support.
- Write in English, without em dashes or decorative emoji.
- Research sessions only write files under `research/`.

Priority: **P1** blocks the next skill work, **P2** improves an existing skill, **P3** is proof, scale, or nice to have.

## Done

- [x] Initial cross-domain anti-slop research: `2026-10-29-01-riset-awal.md` (removed, see git history)
- [x] Gap analysis of the repository at commit `ebe7cfe`: `2026-10-29-02-gap-analysis.md` (removed)
- [x] Stage 1, web search version: `2026-10-29-03-tahap-1-websearch.md` (removed)
- [x] Stage 1, Research mode (agents, flow, conversion, tokens): `2026-10-29-04-stage-1-deep.md`
- [x] Anti-slop documentation (README, docstrings, ADR, runbook, client handoff, AGENTS.md, llms.txt, Indonesian docs under EYD V): `2026-10-30-01-anti-slop-documentation.md`, applied in `weave-docs`
- [x] Renaming `anti-ai` to `agentic-weave`: done in the repository (package `agentic-weave`, skills `weave-*`, plugin `agentic-weave`). `anti-ai-skills` was unpublished on 2026-10-30.
- [x] Deterministic text linter: `npx agentic-weave check` with the `weave-docs` and `weave-commit` cores, run in CI and in a commit-msg hook. Comparison with Vale, textlint, alex, proselint, and write-good is still open below.

## Moved to deflow

Items about project flow, CMS conversion, crawling, and design tokens moved with those skills to the [deflow](https://github.com/cendysaputra/deflow) repository on 2026-11-01: Elementor V4 schema, WordPress block themes and `theme.json`, cache plugin conflicts, WooCommerce blocks, Statamic 6, Astro View Transitions, DTCG 2025.10 details, Style Dictionary and Terrazzo, crawl tools, multi-page snapshots, DESIGN.md patterns, BMAD and Kiro specs, screenshot-to-code tools, and conversion to Shopify, Webflow, and Vue or Nuxt.

## Stage 2: execution quality

### Code and git

- [ ] **P1** `weave-code`: catalog of code slop tells (narrating comments, generic docblocks, over-engineering, defensive overdose, test slop, hallucinated imports). Sources: Code Slop, aislop, arXiv 2605.13280, other 2025 to 2026 studies. Result: Tell/Why/Fix entries ready to write, with PHP and Laravel, JavaScript, and WordPress examples.
- [ ] **P1** Comment labels (TODO, FIXME, HACK, NOTE, SECURITY, PERF): conventions in large projects, tools that read them (todo-tree, ESLint no-warning-comments, PHPCS), owner and issue formats.
- [ ] **P2** Git: branch naming, push gates (husky, lefthook, pre-commit), commitlint, a policy for `Co-Authored-By` trailers on AI-written commits.

### Text and messages

- [ ] **P2** Compare the `check` linter with Vale, textlint, alex, proselint, and write-good: rule coverage, Indonesian support, configuration format.
- [ ] **P2** Messages to clients (WhatsApp, Slack, short email): slop patterns, Bapak/Ibu versus kamu, length per channel, progress update structure. Resolve the conflict with "Register Mixing" in `weave-copywriting-id`.
- [ ] **P2** More Indonesian slop vocabulary: studies or corpora of AI-written Indonesian text (ACL and arXiv papers, IndoNLP), stiff phrases translated from English patterns.
- [ ] **P3** English marketing copy: slop patterns in landing pages, headlines, and CTAs, and copywriting research sources.

## Stage 3: proof and scale

- [ ] **P3** Skill evaluation: SkillsBench (arXiv 2610.08875), evals with and without the skill for UI, copy, and commits, metrics that can be automated.
- [ ] **P3** `skills-ref` and other validators in CI; which skill smells from arXiv 2607.01456 can be checked automatically.
- [ ] **P3** Cross-agent tests: how skill triggering differs in Claude Code, Codex, Cursor, Grok Build, Antigravity, OpenCode, Amp, and Hermes.
- [ ] **P3** An MCP server for `check`: the current MCP specification and similar servers.
- [ ] **P3** `npx skills add` and skills.sh details: flags, lockfile, updates.
- [ ] **P3** Unverified agents: Zed, Junie (global path), Hermes (project-level skills), whether Claude Code reads `.agents/skills`.

## Regular maintenance

- [ ] Every 30 days: recheck the skill paths in the agent matrix used by `bin/agentic-weave.mjs`, and record changes in a new research file.
