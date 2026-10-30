# Examples

Pairs of slop and its fix, one pair per rule the linters check. `cases.json` lists each pair and the rules the "before" file must trigger; `npm test` runs `scripts/test-examples.mjs`, which fails if a "before" misses an expected rule or an "after" triggers any rule.

- `docs/`: Markdown checked by `lint-docs.mjs` and `npx agentic-weave check`, in English and Indonesian.
- `commit/`: commit messages checked by `lint-commit.mjs` and the commit-msg hook.
- `slides/`: slide outlines in Markdown, checked for the `weave-slides` tells the linter can see (label titles).

To add a pair, write both files, add an entry to `cases.json`, and run `npm test`. Real examples from the wild are welcome through the "Laporkan tanda slop baru" issue template; remove personal data and only share text you may share.
