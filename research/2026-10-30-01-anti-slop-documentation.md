# Research: Documentation That Does Not Read as "AI Slop" (Input for Expanding the Docs Skill)

> Translated from the original Indonesian on 2026-11-01. Skill names are as they were when the research was written (`antiai-docs` is now `weave-docs`). The findings were applied in `weave-docs` and rules R-44 to R-48 of `weave-core`.

For documentation not to read as "AI slop", the docs skill has to stop being only a list of style bans. It has to require three things that can be checked: code samples that were actually run, versions and context written down, and a structure that follows what the reader needs (Diátaxis). Style patterns such as emoji, buzzwords, and chat openers are surface symptoms. The strongest evidence of real harm is in unverified content: hallucinated packages, agent context files that do not raise task success but do raise cost, and "slop" reports that eat maintainer time.

## TL;DR

- **The main problem with slop docs is unverified content, not style.** Spracklen et al. (USENIX Security 2025) found an average hallucinated-package rate of at least 5.2% for commercial models and 21.7% for open-source models, with 205,474 unique hallucinated package names. The AGENTS.md evaluation by Gloaguen et al. (arXiv 2602.11988) found that context files, whether written by an LLM or by developers, generally do not raise task success, while inference cost rises by more than 20% on average. So the skill needs entries for "samples must be run", "APIs must exist", and "agent docs must be minimal and specific".
- **Replace part of the blacklist with a positive framework.** Diátaxis (four document types), the principles of the Google developer documentation style guide (second person, active voice, condition before instruction), PEP 257 and the WordPress PHP Documentation Standards for docblocks, Nygard-style ADRs, and the four principles of ISO 24495-1 (relevant, findable, understandable, usable). All of them translate into concrete Tell/Why/Fix entries.
- **Split the docs skill into a short SKILL.md (about 150 to 250 lines) plus six `references/` files, and add Vale and markdownlint.** There is no official Vale style or textlint rule for Indonesian, so the Indonesian rules (Anda/kamu, "silakan", em dash, stock phrases) have to be written as Vale `existence`/`substitution` rules or a textlint `prh` dictionary.

## Contents

1. How to read the labels
2. Key findings: evidence about documentation slop
3. A positive framework to replace the blacklist
4. Catalog of new slop patterns (ready for SKILL.md)
5. Structure per document type
6. Indonesian documentation
7. Automated tools and starter configuration
8. Verification and docs drift
9. Proposed structure for the updated docs skill
10. Short templates
11. Unverified items and further research

## 1. How to Read the Labels

| Label | Meaning |
|---|---|
| **[FACT]** | Supported by a primary source (official style guide, paper, tool documentation, standard) read during this research. |
| **[RECOMMENDATION]** | A conclusion or proposal from the researcher, based on the facts. You may reject it. |
| **[UNVERIFIED]** | General knowledge or a claim from a secondary source not checked against a primary source in this research. Do not quote it in a SKILL.md before checking. |

This research does not invent versions, numbers, or quotes. When a number exists only in a secondary source, it is labeled UNVERIFIED.

## 2. Key Findings: Evidence About Documentation Slop

### 2.1 Hallucinated APIs and packages in code samples

- **[FACT]** Spracklen et al. generated 576,000 code samples from 16 LLMs in two languages (Python and JavaScript). They found an average hallucinated-package rate of at least 5.2% for commercial models and 21.7% for open-source models, with 205,474 unique hallucinated package names. The paper appeared at the USENIX Security Symposium 2025.
- **[FACT]** The same paper found JavaScript has a higher package hallucination rate than Python, and hallucinated names often repeat, so attackers can register them ("slopsquatting").
- **[RECOMMENDATION]** For docs, this means every `npm install`, `composer require`, `pip install`, or `wp plugin install` in a README must be checked against the registry before commit. Cendi uses the npm ecosystem heavily (GSAP, Three.js, Tailwind), so the risk is directly relevant.
- Sources: arxiv.org/abs/2406.10279, usenix.org/system/files/usenixsecurity25-spracklen.pdf

### 2.2 Documentation for agents (AGENTS.md, CLAUDE.md)

- **[FACT]** Gloaguen et al. ("Evaluating AGENTS.md", arXiv 2602.11988) tested two settings: SWE-bench tasks from popular repositories with LLM-written context files, and a set of new issues from repositories that have developer-written context files. Context files generally did not raise task success, while inference cost rose by more than 20% on average, for both LLM-written and developer-written files. Context files encourage broader exploration (more tests and file traversal), and agents tend to follow their instructions. The paper also says repository overviews do not help, even though they are popular and recommended by model providers.
- **[FACT]** The paper concludes that context files are useful for setting non-standard coding practices, but any attempt to improve performance through a context file should be evaluated before use.
- **[FACT]** The empirical study "Agent READMEs" (arXiv 2511.12884) analyzed 2,303 agent context files from 1,925 repositories. The files evolve like configuration code, through small, frequent additions. The most common content: test procedures (75.9%), implementation details (70.8%), architecture (68.1%). The least common: security (14.8%) and performance (14.5%).
- **[FACT]** The official Claude Code documentation recommends concrete, verifiable instructions, with "Use 2-space indentation" as an example in place of "Format code properly". The 200-line or 25KB limit named on that page applies to MEMORY.md (auto memory), not automatically to CLAUDE.md.
- **[FACT]** The Claude Code memory page also targets CLAUDE.md files under 200 lines each, because longer files take more context and can lower adherence. Claude Code reads AGENTS.md when there is no CLAUDE.md or CLAUDE.local.md in the working directory or above it; reading AGENTS.md directly needs Claude Code v2.1.277 or later.
- **[RECOMMENDATION]** Typical agent-doc slop: generic instructions ("write clean code", "follow best practices"), architecture summaries the agent could find itself, conflicting rules, and files generated once and never edited.
- Sources: arxiv.org/abs/2602.11988, arxiv.org/abs/2511.12884, arxiv.org/abs/2601.20404, code.claude.com/docs/en/memory

### 2.3 Open source project policies on AI content

| Project | Policy | Label |
|---|---|---|
| curl | Since May 2025 bans reporters who send "AI slop" security reports. The official bug bounty ended on 31 January 2026 (Stenberg, 26 January 2026; change merged in curl PR #20312). | [FACT] (Daniel Stenberg's blog) |
| curl | April 2026: Stenberg wrote that slop reports had disappeared, replaced by good reports that are almost all AI-assisted. The maintainer load shifted to verifying plausible-looking reports. | [FACT] (quoted by The Register; the original social media post was not read) |
| Gentoo | A Council vote on 14 April 2024 banned contributions made with natural-language AI tools, citing copyright, quality, and ethics. | [FACT] (via The Register and builtplain; the Gentoo wiki was not read directly) |
| NetBSD | Code from an LLM is "presumed to be tainted" and may not be committed without written approval from core. | [FACT] (quoted by several outlets; the commit guidelines were not read directly) |
| QEMU | Policy: DECLINE contributions believed to contain or derive from AI content. A v2 patch on qemu-devel (May 2026) proposes relaxing it. | Old policy [FACT]; patch status [UNVERIFIED] |
| OpenJDK | An interim policy bans model output in code, email, wiki pages, and issues. | [UNVERIFIED] (secondary sources only) |
| FreeBSD | Core is drafting a policy on "generative AI created code and documentation" (Q2 2025 status report). | [FACT] (via heise) |

- **[RECOMMENDATION]** Lesson for the docs skill: maintainers reject text that sounds technical but cannot be reproduced. The only durable defense is checkable evidence: the command that was run, the real output, and the version written down. More "human" wording alone is not enough.
- Sources: daniel.haxx.se/blog/2026/01/26/the-end-of-the-curl-bug-bounty/, theregister.com/2024/05/18/distros_ai_code/, theregister.com/software/2026/04/06/ai-slop-got-better-so-now-maintainers-have-more-work/5223172, heise.de/en/news/FreeBSD-policy-AI-generated-source-code-No-thanks-10634141.html

### 2.4 Research on LLM-written docstring quality

- **[FACT]** DocAgent (arXiv 2504.08725) defines a helpful docstring as one that does not merely repeat code elements. It explains purpose, usage context, design rationale, and limits.
- **[FACT]** RepoAgent (arXiv 2402.16667) reports a human preference test. On the Transformers repository, the model's documentation won 105 of 150 comparisons (win rate 0.70) against human-written documentation.
- **[RECOMMENDATION]** So LLM-written docs are not automatically worse. The problems are specific: repeating the signature, explaining the obvious, and unchecked claims. The skill should target these patterns, not an "AI tone" in general. This matches R-37 (do not over-sterilize).
- Sources: arxiv.org/abs/2504.08725, arxiv.org/abs/2402.16667

## 3. A Positive Framework to Replace the Blacklist

### 3.1 Diátaxis

- **[FACT]** Diátaxis divides documentation into four types that answer four different needs: tutorial, how-to guide, reference, and explanation. Its two axes are action versus cognition, and acquiring skill (learning) versus applying it (working).
- **[FACT]** According to Diátaxis, reference holds accurate, complete technical description, free of interpretation. Reference serves the user while they work.
- **[RECOMMENDATION]** New entry "Mode Mixing": a single page that mixes tutorial, reference, and essay is the most common slop sign in AI-written READMEs.
- Sources: diataxis.fr/start-here/, diataxis.fr

### 3.2 Google developer documentation style guide

- **[FACT]** The Highlights page says: use second person, active voice that makes the actor clear, condition before instruction, descriptive link text, and do not pre-announce features. The guide also has pages on excessive claims, timeless documentation, code samples, and API reference code comments.
- **[RECOMMENDATION]** Each point above maps directly to a Fix. Example: "To delete the document, click Delete" (condition first), not "Click Delete if you want to delete the document".
- Source: developers.google.com/style/highlights

### 3.3 Write the Docs: Documentation principles

- **[FACT]** The Write the Docs content principles include ARID ("Accept (some) Repetition In Documentation"), Skimmable, Exemplary (include some examples and tutorials), Consistent, and Current. For Current, the principle is: "Consider incorrect documentation to be worse than missing documentation."
- **[FACT]** The source principles include Nearby (docs close to the code) and Unique. The skimmable guidance says titles should be descriptive and link text must not be "click here".
- **[RECOMMENDATION]** ARID matters as a counterweight. Repetition that helps (for example, prerequisites repeated in each how-to) is not slop. Slop is a summary that repeats the previous paragraph and adds nothing.
- Source: writethedocs.org/guide/writing/docs-principles/

### 3.4 Plain language: ISO 24495-1:2023

- **[FACT]** ISO 24495-1:2023 defines plain language as communication whose words, structure, and design are clear enough that the intended readers can easily find, understand, and use the information. It has four principles: relevant, findable, understandable, and usable.
- **[FACT]** The guidance for Principle 1 asks for content that is accurate, not misleading, and does not hide information readers need.
- **[RECOMMENDATION]** Use the four principles as a review order: (1) is the content relevant for this reader, (2) can it be found from the headings, (3) can it be understood, (4) can the steps be carried out.
- Source: cdn.standards.iteh.ai/samples/78907/d194fac21d6a45f38bfcfec9657f7498/ISO-24495-1-2023.pdf

### 3.5 Other frameworks requested but not verified

- **[UNVERIFIED]** The Microsoft Writing Style Guide, the GitLab documentation style guide, the Divio documentation system (the precursor of Diátaxis), John Carroll's minimalism (The Nurnberg Funnel, 1990), plainlanguage.gov, docs-as-code, and Make a README were not read directly in this research. They are listed for further research (section 11).

## 4. Catalog of New Slop Patterns (Ready for SKILL.md)

The entries below were not in the docs skill at the time. The Rule column cites an existing core rule, or a proposed new rule with a temporary ID `RN-x` (final numbers to be chosen so they do not clash with existing R-XX IDs).

### 4.1 Summary table

| Entry | Tell | Why | Fix | Rule |
|---|---|---|---|---|
| Unrun Code Samples | Code blocks with no output, no version, never run; `...` in the middle of a command | A wrong sample is worse than no sample (WtD: Current) | Run every block; paste real output; mark illustrative blocks as "not runnable" | R-17, proposed RN-1 Verified Examples |
| Hallucinated API/Package | Functions, hooks, CLI flags, or packages that do not exist in the code or the registry | Hallucinated package rate of 5.2% to 21.7% (Spracklen et al.); slopsquatting risk | Check each name against the code, `composer show`, `npm view`, or the official docs; write the version | R-17, RN-1 |
| Version-less Instructions | "Install the latest version", no PHP/WP/Node version | Instructions go stale silently | State the tested version and the test date | C-5 |
| Signature Echo Docblock | `@param string $name The name.` or a docstring that repeats the parameters | PEP 257 forbids one-line docstrings that repeat the signature | Write what the types do not show: units, ranges, side effects, when it returns null, related hooks | R-31, proposed RN-2 |
| Obvious Narration | "This function gets the user" above `getUser()`; a `// loop through items` comment | Adds reading without information (DocAgent: helpfulness) | Delete it, or replace it with the reason (why) | R-31, C-3 |
| Walkthrough Preamble | "This guide will walk you through...", "Di panduan ini kita akan belajar..." | A how-to reader arrives with a goal; the preamble delays step one | Start with the end result and the prerequisites, then step 1 | R-36 |
| Mode Mixing | A README holding a tutorial, a full API table, a philosophy essay, and a FAQ at once | Diátaxis: each type serves a different need | Split into one file per type; the README holds only orientation and links | R-05 |
| Recap Echo | "In summary", "Kesimpulannya" at the end of a short page, repeating the points | Not helpful repetition (ARID), just filler | Delete summaries on pages under about one screen; on long pages, replace with "Next steps" | R-36, C-3 |
| Badge Wall | Eight or more badges (build, coverage, downloads, license, PRs welcome) on an internal repository | Badges without real data are decoration | Keep badges that show real status (CI, release version); remove the rest | R-05, C-3 |
| Placeholder Sections | "Contributing: PRs are welcome!", "License: MIT" with no LICENSE file | Empty sections send false signals | Delete them or fill them with real links | C-3 |
| Pre-announcement | "Coming soon", "Roadmap: dark mode, AI features" | Google: do not pre-announce features | Move it to the issue tracker | C-5, R-17 |
| False Precision | "Improves performance by 40%", "compatible with all themes" | A number without a method is invented | Write the test conditions, or delete the number | R-18 |
| Hedge Stack | "may potentially", "mungkin bisa saja", "biasanya umumnya" | It is unclear what is true | One claim, one condition: "If X, then Y" | R-31 |
| Drifted Docs | Option names or ACF fields in the docs differ from the code | Wrong docs are worse than none | Docs in the same repository, reviewed in the same PR, checked automatically | proposed RN-3 Docs Near Code |
| Generic Agent Rules | "Write clean code", "Follow best practices" in AGENTS.md | Claude Code docs: instructions must be concrete and verifiable | Replace with real commands: "Run `composer test` before committing" | R-31, proposed RN-4 |
| Context Bloat | An AGENTS.md left as generated by `/init`; long architecture summaries | Gloaguen et al.: context files generally do not raise success, cost rises by more than 20%, and repository overviews do not help | Keep only non-standard things the agent cannot find itself | RN-4 |
| Vague Link Text | "click here", "see this link" | Google and WtD: link text must be descriptive | Link the name of the destination: "see the installation guide" | R-31 |
| ADR Without Downsides | An ADR that lists only benefits | Nygard: record every consequence, positive, negative, and neutral | Require at least one negative consequence or trade-off | R-17, proposed RN-5 |
| Stiff Translation | "Silakan klik tombol Simpan untuk menyimpan perubahan Anda" | Filler words plus English sentence structure | "Klik **Simpan**." | R-36, see section 6 |

### 4.2 Bad versus good examples

**Unrun Code Samples + Version-less Instructions**

Bad:

```bash
npm install gsap-scrolltrigger
# Then initialize it in your app
```

Good:

````markdown
Tested with Node 20 and GSAP 3.x (check the version in package.json).

```bash
npm install gsap
```

ScrollTrigger ships in the `gsap` package; register it with:

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```
````

Label note: the package name `gsap-scrolltrigger` in the bad example is deliberately a plausible-sounding name. That ScrollTrigger ships in the `gsap` package is **[UNVERIFIED]** in this research, so check the GSAP docs before using this example in a SKILL.md.

**Signature Echo Docblock (PHP/WordPress)**

Bad:

```php
/**
 * Get the price.
 *
 * @param int $product_id The product ID.
 * @return float The price.
 */
```

Good:

```php
/**
 * Calculate a product's final price after the member discount.
 *
 * Returns the regular price when the user is not logged in. The result
 * is cached per request through wp_cache, so repeated calls run no query.
 *
 * @since 1.4.0
 *
 * @param int $product_id WooCommerce product ID.
 * @return float Price in the store currency, before tax.
 */
```

**Walkthrough Preamble**

Bad: "In this guide, we will walk you step by step through configuring ACF quickly and easily."

Good: "End result: the `hero_title` field shows on the home page. You need ACF Pro and admin access. 1. Open **ACF > Field Groups**..."

**Generic Agent Rules**

Bad:

```markdown
- Write clean, maintainable code
- Follow WordPress best practices
```

Good:

```markdown
- Prefix every theme function with `imj_`.
- Run `vendor/bin/phpcs --standard=WordPress` before committing.
- Do not edit `wp-content/plugins/`; plugins are managed by Composer.
```

- Sources for this section: peps.python.org/pep-0257/, developer.wordpress.org/coding-standards/inline-documentation-standards/php/, developers.google.com/style/highlights, writethedocs.org/guide/writing/docs-principles/, code.claude.com/docs/en/memory, arxiv.org/abs/2406.10279, arxiv.org/abs/2602.11988

## 5. Structure per Document Type

### 5.1 Project README and skill or package README

- **[FACT]** standard-readme is designed for open source libraries. Required sections appear in a fixed order: Title, Short Description, Table of Contents (optional when the README is under 100 lines), Install, Usage, Contributing, License. Optional sections: Security, Background, API, Maintainers. A remark-lint preset checks the section order.
- **[RECOMMENDATION]** For agency client projects (not libraries), the standard-readme order is too heavy. Use: one sentence on what this is, how to run it locally, how to deploy, where the configuration lives, and who to contact. Template in section 10.
- **[RECOMMENDATION]** A skill README (folder `skills/<name>`): one sentence on when the skill triggers, the file list, a real input and output example, and limits. Do not copy the SKILL.md.
- Typical slop: Badge Wall, Placeholder Sections, emoji "Features" (already covered), a Getting Started section that repeats Install.
- Sources: github.com/RichardLitt/standard-readme/blob/main/spec.md, github.com/RichardLitt/standard-readme-preset

### 5.2 Tutorials and how-tos

- **[FACT]** Diátaxis: a tutorial is learning-oriented; a how-to is goal-oriented and may assume the reader is competent.
- **[FACT]** Google style guide: condition before instruction, second person, active voice.
- **[RECOMMENDATION]** How-to: a task as the title ("Adding an ACF field to a Blade template"), prerequisites, numbered steps with one action each, and how to verify the result. No preamble, no history.
- Sources: diataxis.fr/start-here/, developers.google.com/style/highlights

### 5.3 API and reference docs

- **[FACT]** Diátaxis: reference is description, not instruction or explanation. Google has dedicated pages on "API reference code comments" and "Verbs in reference documents".
- **[RECOMMENDATION]** Generate reference from the code (phpDocumentor, TypeDoc) so it does not drift. Hand-written prose only for what the signature does not show.
- Sources: diataxis.fr/start-here/, developers.google.com/style/highlights

### 5.4 Docstrings and documentation comments

| Standard | Status and key content | Label |
|---|---|---|
| PEP 257 (Python) | A one-line docstring is a command ("Return..."), not a description ("Returns..."), and must not repeat a signature available through introspection | [FACT] |
| WordPress PHP Documentation Standards | A PHPDoc-derived scheme: Summary, Description, `@since x.x.x` (three digits), `@param`, `@return`. Hooks (actions and filters) must be documented. A duplicate hook only needs a one-line comment pointing to the file where it is documented | [FACT] |
| PSR-5 (PHPDoc) and PSR-19 (PHPDoc tags) | Both are still **Draft** at PHP-FIG, editor Chuck Burgess | [FACT] |
| JSDoc/TSDoc, Laravel docblocks | Not read in this research | [UNVERIFIED] |

- PEP 257 quote: a one-line docstring "should NOT be a “signature” reiterating the function/method parameters".
- **[RECOMMENDATION]** A practical rule for when a docblock is worth writing. If PHP 8 already has complete type hints, `@param int $id` without a description only repeats them. Write a docblock when it adds one of: units or format (cents versus rupiah), value ranges, when it returns null or false, side effects (queries, caches, hooks fired), `@since`, or an array type PHP cannot express (`array<int, WP_Post>`). For WordPress themes and plugins that follow WPCS, `@since` and hook documentation stay mandatory.
- Sources: peps.python.org/pep-0257/, developer.wordpress.org/coding-standards/inline-documentation-standards/php/, php-fig.org/psr/

### 5.5 Architecture Decision Record (ADR)

- **[FACT]** Michael Nygard's format (2011): Title, Status (proposed, accepted, deprecated, superseded), Context, Decision (active voice, "We will..."), Consequences (all of them: positive, negative, and neutral).
- **[UNVERIFIED]** MADR adds sections such as the options considered and pros and cons per option. Check adr.github.io/madr before quoting.
- **[RECOMMENDATION]** Typical ADR slop: generic context ("we need a scalable solution"), no rejected alternative, no negative consequence. For an agency, ADRs help with decisions like "Elementor versus Gutenberg for client X" or "Statamic flat-file versus database".
- Sources: docs.arc42.org/tips/9-5/ (quoting Nygard), cognitect.com/blog/2011/11/15/documenting-architecture-decisions

### 5.6 Runbooks and operational docs

- **[RECOMMENDATION]** No primary source was read in this research. Proposed structure: symptom, impact, how to check (exact commands), fix steps, how to verify recovery, escalation, history. Typical slop: "Check the logs" with no log path, "restart the service" with no command, no verification step.

### 5.7 Changelog

- **[RECOMMENDATION]** There is already a separate skill. The docs skill only needs one line: changelogs follow the changelog skill and the Keep a Changelog convention. **[UNVERIFIED]** The Keep a Changelog categories (Added, Changed, Deprecated, Removed, Fixed, Security) were not rechecked in this research.

### 5.8 Agency client handoff documentation

- **[FACT]** ISO 24495-1: a document must be usable by its intended readers, taking their literacy, background, and knowledge into account.
- **[RECOMMENDATION]** Non-technical clients look for tasks, not features. Organize by task ("Replacing the banner photo", "Adding a WooCommerce product"), one task per page, button labels written exactly as on screen (including the client's dashboard language), screenshots with the area marked, and a "Do not change" section (for example global Elementor templates and ACF fields the code uses). Avoid developer terms (slug, hook, repeater) or explain them in a short glossary.
- **[RECOMMENDATION]** State the WordPress and Elementor Pro versions and the screenshot date. The dashboard changes between versions, so an undated screenshot is Drifted Docs.

### 5.9 Documentation for AI agents

- **[FACT]** llms.txt is a proposal by Jeremy Howard (published 3 September 2024, v2 modified 10 August 2026), not an official IETF or W3C standard. Format: an H1 with the project name (the only required part), a summary blockquote, paragraphs or lists without headings, then H2 sections with link lists `[name](url): note`. An H2 section named "Optional" holds links that may be skipped. v2 suggests a Markdown version of each page (`page.html.md`) and a `rel="describedby"` link relation.
- **[FACT]** v2 says Chrome Lighthouse audits the presence of llms.txt in its agentic browsing checks, and that OpenAI, Anthropic, and Gemini publish llms.txt for their developer docs.
- **[RECOMMENDATION]** For AGENTS.md and CLAUDE.md in Cendi's projects: write them by hand, holding only exact build, test, and lint commands, non-standard conventions (function prefixes, ACF field locations, Blade rules), specific prohibitions, and pointers to files. Do not include architecture summaries the agent can read from the code. Keep one source of truth: CLAUDE.md imports AGENTS.md rather than copying it.
- Sources: llmstxt.org, arxiv.org/abs/2602.11988, code.claude.com/docs/en/memory

## 6. Indonesian Documentation

### 6.1 Official references

- **[FACT]** EYD Edition V was set by Decree of the Head of the Language Development and Fostering Agency No. 0424/I/BS.00.01/2022 on 16 August 2022. EYD V replaces PUEBI (edition IV, 2015) and is available as a web app at ejaan.kemdikbud.go.id.
- **[FACT]** Microsoft publishes a Localization Style Guide for many languages, including Indonesian.
- **[FACT]** Mozilla's Indonesian (id) localization style guide uses "Anda" for "you", avoids colloquial language and slang, and points terms to Transvision, the Indonesian internet term list, the Term Standardization Guide (implementing Presidential Instruction No. 2 of 2001), Microsoft terminology, and the online KBBI. Example word choice: "Create" becomes "Buat", not "Ciptakan".
- **[FACT]** That Mozilla guide still refers to the 2015 "Panduan Umum Ejaan Bahasa Indonesia" (PUEBI), which EYD V has replaced.
- **[UNVERIFIED]** The General Guidelines for Term Formation, Google's Indonesian localization guide, and GovTech or government documentation guides were not read in this research.
- Sources: kompas.com/edu/read/2022/08/18/183321671/ubah-pedoman-ejaan-badan-bahasa-luncurkan-eyd-edisi-v, learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides, mozilla-l10n.github.io/styleguides/id/index.html

### 6.2 Choosing "kamu" or "Anda"

- **[FACT]** Mozilla (a formal project) chose "Anda".
- **[RECOMMENDATION]** Using "kamu" in Cendi's repositories is valid, but it should be written down explicitly in `references/docs-id.md` with the reason (developer audience, a colleague's tone) and the exceptions. For handoffs to corporate or government clients, "Anda" may fit better. The slop is mixing both in one document, or putting "Anda" in every sentence so it reads like machine translation.

### 6.3 Slop patterns specific to Indonesian docs

| Pattern | Bad | Good | Label |
|---|---|---|---|
| "Silakan" in every step | "Silakan klik tombol Simpan." | "Klik **Simpan**." | [RECOMMENDATION] |
| Bureaucratic passive | "Pengaturan dapat dilakukan melalui menu Settings." | "Buka **Settings** untuk mengatur..." | [RECOMMENDATION], in line with Google's active voice principle |
| Word-for-word translation | "Ini akan memungkinkan Anda untuk..." (from "This will allow you to") | "Dengan ini kamu bisa..." or straight to the action | [RECOMMENDATION] |
| Formal filler | "Adapun langkah-langkahnya adalah sebagai berikut:" | "Langkah:" | [RECOMMENDATION] |
| Inconsistent terms | "unggah" in one step, "upload" in another | Pick one and record it in the glossary | [RECOMMENDATION] |
| UI labels translated by the writer | "Klik Terbitkan" when the client's dashboard is in English | Write the label exactly as on screen: "Klik **Publish**" | [RECOMMENDATION] |

### 6.4 Term equivalents

- **[RECOMMENDATION]** Rules: (1) UI labels are written exactly as on screen; (2) terms that are common and standard are used in their Indonesian form (unduh, unggah, tautan, pengaturan, kata sandi); (3) developer terms with no established equivalent stay in English and are italicized as foreign terms under EYD (hook, slug, repeater, build, deploy); (4) every decision goes into the project glossary. Check equivalents against the online KBBI before adding them to the glossary.
- **[UNVERIFIED]** The standard status of each equivalent in KBBI was not checked one by one in this research.

## 7. Automated Tools and Starter Configuration

### 7.1 Tool summary

| Tool | What it does | Indonesian support | Label |
|---|---|---|---|
| Vale | Prose linter with YAML rules: existence, substitution, occurrence, conditional, capitalization, metric, spelling, script, and more. Official packages: Google v0.7.1, Microsoft v0.15.1, write-good v0.4.1, proselint v0.3.4, alex v0.2.3, Readability v0.2.0 | No official style. Spelling can use a Hunspell dictionary; regex rules (`existence`, `substitution`) work in any language | [FACT] |
| markdownlint / markdownlint-cli2 | Lints Markdown structure. Example rules: MD013 line-length, MD033 no-inline-html, MD040 fenced-code-language, MD041 first-line-heading | Not relevant (structure) | [FACT] |
| textlint | Plugin-based text linter with no built-in rules and more than 100 rules available | The rule wiki only has Global, English, Japanese, Chinese, and Arabic sections. `textlint-rule-prh` (a regex dictionary) is language-agnostic | [FACT] |
| lychee | Link checker (Rust) for Markdown, HTML, and more; has a GitHub Action | Not relevant | [FACT] |
| doctest / pytest `--doctest-glob` / `cargo test` | Runs code samples in docs | Not relevant | [FACT] |
| cspell | Code spell checker | Not checked | [UNVERIFIED] |

- **[FACT]** Vale only returns a non-zero exit code for the `error` level. Warnings and suggestions do not fail CI.
- **[FACT]** PostHog uses Vale to enforce its writing style across its site, including banning em dashes.
- Sources: vale.sh/docs/topics/styles/, docs.vale.sh/topics/quickstart, vale.sh/explorer, docs.vale.sh/guides/hunspell, github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md, github.com/DavidAnson/markdownlint-cli2, github.com/textlint/textlint, github.com/textlint/textlint/wiki/collection-of-textlint-rule, github.com/azu/textlint-rule-prh, github.com/lycheeverse/lychee, posthog.com/handbook/wizard-and-docs/vale

### 7.2 Vale: configuration for this repository

> Not adopted: the repository built its own dependency-free linter (`lint-core.mjs`, behind `npx agentic-weave check`) instead of shipping Vale. The proposal is kept for reference.

**[RECOMMENDATION]** Structure:

```text
.vale.ini
.vale/styles/AntiAI/EmDash.yml
.vale/styles/AntiAI/StockPhrases.yml
.vale/styles/AntiAI/Hedging.yml
.vale/styles/AntiAI/AndaKamu.yml
.vale/styles/AntiAI/Silakan.yml
.vale/styles/AntiAI/WalkThrough.yml
```

`.vale.ini`:

```ini
StylesPath = .vale/styles
MinAlertLevel = suggestion
Packages = Google

[*.md]
BasedOnStyles = AntiAI
Google.Passive = suggestion
Google.We = warning
Google.Exclamation = warning
Vale.Spelling = NO
```

Note: `Vale.Spelling = NO` because the built-in dictionary is US English and the repository is bilingual. Run `vale sync` once to download the Google package. The Google rule names above (`Passive`, `We`, `Exclamation`) are **[UNVERIFIED]**; check the file list in the Google package after `vale sync`.

`EmDash.yml` (R-02):

```yaml
extends: existence
message: "Do not use an em dash (R-02). Split the sentence or use a colon or comma."
level: error
nonword: true
tokens:
  - '—'
```

`StockPhrases.yml` (R-36):

```yaml
extends: existence
message: "Stock AI phrase: '%s' (R-36). Start with the content."
level: warning
ignorecase: true
tokens:
  - this guide will walk you through
  - in this (?:guide|tutorial|article), (?:we|you) will
  - let's dive in
  - in today's fast-paced
  - it's worth noting that
  - dalam panduan ini,? (?:kita|kami|kamu) akan
  - mari kita (?:mulai|selami)
  - perlu diingat bahwa
```

`AndaKamu.yml` (consistent form of address, for this repository only):

```yaml
extends: substitution
message: "This repository uses 'kamu', not '%s'."
level: error
ignorecase: false
swap:
  '\bAnda\b': kamu
```

`Silakan.yml`:

```yaml
extends: occurrence
message: "'Silakan' appears too often. Use a direct instruction."
level: suggestion
scope: text
max: 1
token: '\b[Ss]ilakan\b'
```

`Hedging.yml` (R-31):

```yaml
extends: existence
message: "Stacked hedge: '%s'. Write one claim with one condition."
level: warning
ignorecase: true
tokens:
  - may potentially
  - might possibly
  - mungkin saja bisa
  - biasanya umumnya
```

**[RECOMMENDATION]** Test each rule with fixture files (bad and good examples) as PostHog does, then run them in CI. Start at the `warning` level for two to three weeks before raising to `error`, so false positives do not block PRs.

### 7.3 Vale for user (client) projects

**[RECOMMENDATION]** A light version: only `EmDash`, `StockPhrases`, and `Hedging` at the `warning` level, without `AndaKamu`, because client projects may use "Anda". Distribute it as a zip package through the `Packages` key (Vale supports zip packages containing a `.vale.ini` and/or a styles folder).

### 7.4 markdownlint-cli2

`.markdownlint-cli2.jsonc` **[RECOMMENDATION]**:

```jsonc
{
  "config": {
    "default": true,
    "MD013": false,
    "MD033": { "allowed_elements": ["details", "summary", "br", "kbd"] },
    "MD040": true,
    "MD041": true
  },
  "ignores": ["node_modules/**", "vendor/**"]
}
```

Reason: MD040 forces a language on every code block, which helps linting and testing samples. MD013 is off because one-line-per-paragraph prose is easier to diff.

### 7.5 textlint + prh for Indonesian terms

`prh.yml` **[RECOMMENDATION]**:

```yaml
version: 1
rules:
  - expected: unggah
    pattern: /\bupload\b/
    specs:
      - from: upload file
        to: unggah file
  - expected: kata sandi
    pattern: password
```

Note: use prh only on prose. UI labels that really are in English must be excluded, or use `options: wordBoundary: true` and review by hand.

## 8. Verification and Docs Drift

### 8.1 Running code samples

- **[FACT]** Python `doctest` searches for text that looks like an interactive Python session and runs it to check the result is exactly as written. It works on text files (`python -m doctest -v file.txt`).
- **[FACT]** pytest can run doctests in text files with `--doctest-glob` (for example `"*.rst"`). The third-party plugin pytest-doctestplus uses `--doctest-glob '*.md'` for Markdown.
- **[FACT]** In Rust, `cargo test` runs documentation tests by default.
- **[RECOMMENDATION]** For Cendi's PHP and JS stacks, which have no built-in doctest: extract language-tagged code blocks (MD040 helps) into temporary files and run `php -l` (syntax check) and `node --check` in CI. For shell commands, run the blocks in a CI container with the same versions the docs state.

### 8.2 Links and versions

- **[FACT]** lychee checks for broken links in Markdown and HTML, has an `--offline` mode for local links, and is available as a GitHub Action.
- **[RECOMMENDATION]** Every document with install commands must have a "Tested with: PHP x.y, WordPress x.y, Node x, date" line. This applies C-5 directly.

### 8.3 Preventing docs drift

- **[FACT]** Write the Docs: the Nearby principle (docs close to the code they describe) and the Current principle (wrong docs are worse than none).
- **[FACT]** The Agent READMEs study found agent context files change through small, frequent additions, like configuration code.
- **[RECOMMENDATION]** Three mechanisms: (1) docs in the same repository and PR as the code; (2) a PR template with a "docs updated or not needed" checklist item; (3) reference generated from code, not written by hand.

### 8.4 Documentation review checklist

**[RECOMMENDATION]**

1. Is the document type clear (tutorial, how-to, reference, explanation, ADR, runbook, handoff)?
2. Does the first sentence say what this is and who it is for?
3. Does every code block have a language, has it been run, and is its version written?
4. Does every package, function, hook, flag, and field name exist in the code or the registry?
5. No numbers without a source or test conditions?
6. No empty sections, placeholders, or feature announcements?
7. Is link text descriptive, and does it pass the link checker?
8. Do docblocks add information beyond the types?
9. Indonesian: consistent form of address, exact UI labels, terms from the glossary?
10. Do Vale and markdownlint pass with no errors?

## 9. Proposed Structure for the Updated Docs Skill

**[RECOMMENDATION]**

```text
skills/antiai-docs/
  SKILL.md                  (target 150-250 lines, hard limit < 500)
  references/
    readme.md               project README, skill/package README, badges, standard-readme
    docstring.md            PEP 257, WordPress PHP docs, PHPDoc/PSR-5/PSR-19 (draft), JSDoc/TSDoc
    adr.md                  Nygard, MADR, agency decision examples
    runbook.md              runbook structure, exact commands, verification
    handoff-klien.md        WP/Elementor/Statamic content editing guide for non-technical readers
    agent-docs.md           AGENTS.md, CLAUDE.md, llms.txt, findings of Gloaguen et al.
    docs-id.md              EYD V, kamu/Anda, term glossary, Indonesian slop patterns
    tooling.md              Vale, markdownlint, textlint/prh, lychee, doctest
  assets/
    vale/                   .vale.ini + styles/AntiAI/*.yml
    markdownlint-cli2.jsonc
    templates/              README, skill README, ADR, runbook, handoff
```

SKILL.md contents:

| Section | Content | Why it stays in SKILL.md |
|---|---|---|
| Trigger and scope | When the skill is used; pointers to the commit, PR, changelog, error, and email skills | Read every time |
| Pick the document type first | Diátaxis table plus ADR, runbook, handoff, agent docs (one line per type, linked to references) | Prevents Mode Mixing from the start |
| Chat Leaks (existing) | Unchanged | |
| Structure (existing + new) | + Mode Mixing, Badge Wall, Placeholder Sections, Recap Echo, Pre-announcement | The most frequent patterns |
| Wording (existing + new) | + Walkthrough Preamble, Hedge Stack, Vague Link Text, Obvious Narration | |
| Verification (new) | Unrun Code Samples, Hallucinated API/Package, Version-less Instructions, False Precision, Drifted Docs | Largest impact according to the evidence |
| Checklist | The 10 items from section 8.4 | |

Moved to `references/`: every per-type detail, long bad and good examples, tool configuration, and the Indonesian rules.

Proposed new core rules (temporary IDs; adopted as R-44 to R-48):

| Temporary ID | Name | Summary |
|---|---|---|
| RN-1 | Verified Examples | Code samples and commands must be run or marked as illustration |
| RN-2 | Docs Add What Code Can't Say | Docblocks and comments only for information not visible from names and types |
| RN-3 | Docs Near Code | Docs are updated in the same PR as the behavior change |
| RN-4 | Minimal Agent Context | Files for agents hold only concrete, checkable, non-standard instructions |
| RN-5 | Record Trade-offs | Decision documents must name the alternatives and a negative consequence |

## 10. Short Templates

### 10.1 Project README (agency client)

```markdown
# Project Name

One sentence: what site, for which client, main stack.

## Running locally
Tested with: PHP x.y, WordPress x.y, Node x (date).
1. Exact command
2. Exact command

## Deploying
Where, by whom, the command or pipeline.

## Configuration
Important files and environment variables (no secret values).

## Non-standard structure
Only what departs from the WordPress or Statamic defaults.

## Contacts
Technical owner and client contact.
```

### 10.2 Skill README

```markdown
# <skill-name>

Used when: one trigger sentence.

## Files
- SKILL.md: core rules
- references/...: detail per topic

## Example
Real input -> real output (shortened).

## Limits
What this skill does not handle and which skill does.
```

### 10.3 ADR

```markdown
# ADR-NNN: The decision in one sentence

Status: proposed | accepted | deprecated | superseded by ADR-MMM
Date: YYYY-MM-DD
Decided by: name

## Context
Real constraints: client, budget, team, technical.

## Options considered
- Option A: why it was rejected
- Option B: why it was rejected

## Decision
We will ...

## Consequences
- Positive:
- Negative (at least one required):
- Neutral:
```

### 10.4 Runbook

```markdown
# Runbook: <symptom>

Last tested: YYYY-MM-DD

## Symptom
What you see (the exact error message).

## Impact
Who is affected, and how badly.

## Check
Exact commands + normal versus failing output.

## Fix
Numbered steps, one command per step.

## Verify
How to confirm it has recovered.

## Escalation
Who, when, and through which channel.
```

### 10.5 Client handoff guide

```markdown
# Managing the Content of <Site Name>

For: <client>'s content team. Dashboard version: WordPress x.y, Elementor Pro x.y.
Screenshots taken: YYYY-MM-DD.

## Logging in to the dashboard
## Common tasks
### Replacing the home page banner photo
1. A step with the button label exactly as on screen
   [screenshot with the area marked]
### Adding a product
...
## Do not change
Pages, templates, and fields the code depends on.
## When something goes wrong
Who to contact and what to send (URL, screenshot, time).
## Glossary
Terms that appear in the dashboard and what they mean.
```

## 11. Unverified Items and Further Research

| Topic | What to check | Label |
|---|---|---|
| Microsoft Writing Style Guide, GitLab docs style guide, Divio, Carroll's minimalism, plainlanguage.gov, Make a README, docs-as-code | Concrete rules that could become Tell/Why/Fix entries | [UNVERIFIED] |
| JSDoc/TSDoc, Laravel docblock conventions | Official `@param`/`@returns` conventions; Laravel's stance on docblocks versus type hints | [UNVERIFIED] |
| MADR | Section list of the latest version | [UNVERIFIED] |
| Keep a Changelog | Categories and the latest specification version | [UNVERIFIED] |
| Gentoo, NetBSD, OpenJDK | Primary policy texts (Gentoo wiki, NetBSD commit guidelines, OpenJDK announcement) | Partly [UNVERIFIED] |
| QEMU | Whether the May 2026 relaxation patch was accepted | [UNVERIFIED] |
| Claude Code docs | The under-200-line CLAUDE.md target and the AGENTS.md reading behavior are confirmed on the official memory page (see 2.2); watch for version changes | [FACT], to be monitored |
| Write the Docs views on AI-written docs | Community talks and articles from 2024 to 2026 | Not researched |
| Quantitative studies of AI-written READMEs on GitHub | No README-specific paper found yet; the evidence above is based on docstrings and agent context files | Research gap |
| General Guidelines for Term Formation, Google or GovTech Indonesian localization guides | Rules for term equivalents and forms of address | [UNVERIFIED] |
| Microsoft Indonesian Style Guide | Its rules on forms of address and terms (PDF available, not read) | [UNVERIFIED] |
| cspell | Indonesian dictionary | [UNVERIFIED] |
| Indonesian Hunspell dictionary for Vale | Availability and quality | [UNVERIFIED] |
| The Vale rules above | Tested on fixtures; `\b` regex and Unicode on Indonesian text | Needs testing |
| ScrollTrigger in the `gsap` package | Check the GSAP docs before using it as an example | [UNVERIFIED] |

Scope note: every study figure above comes from a paper's abstract or summary. Gloaguen et al. report small effects, not all statistically significant. So quote the direction of the findings ("generally does not raise task success", "cost more than 20%"), not as proof that every AGENTS.md is harmful. Open source project policies also change quickly (QEMU, curl). Every policy quoted in a SKILL.md should carry an access date, per C-5.
