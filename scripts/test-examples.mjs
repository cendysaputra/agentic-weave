#!/usr/bin/env node
// Runs every before/after pair in examples/cases.json through the linter the
// skills ship. A "before" must trigger each expected rule; an "after" must
// come back clean. Add a pair here whenever a new tell gets a lint rule.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintMarkdown } from '../skills/weave-docs/scripts/lint-core.mjs';
import { lintCommit } from '../skills/weave-commit/scripts/lint-commit-core.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EX = path.join(ROOT, 'examples');
const cases = JSON.parse(readFileSync(path.join(EX, 'cases.json'), 'utf8'));

const lint = (c, file) => {
  const text = readFileSync(path.join(EX, file), 'utf8');
  return c.kind === 'commit' ? lintCommit(text) : lintMarkdown(text, { sapaan: c.sapaan || null });
};

let failed = 0;
for (const c of cases) {
  const problems = [];
  const before = new Set(lint(c, c.before).map((i) => i.rule));
  for (const rule of c.expect) if (!before.has(rule)) problems.push(`before does not trigger ${rule}`);
  for (const i of lint(c, c.after)) problems.push(`after line ${i.n}: ${i.rule} (${i.msg})`);
  if (problems.length) {
    failed++;
    console.log(`FAIL  ${c.id}\n      ${problems.join('\n      ')}`);
  } else console.log(`ok    ${c.id}`);
}

console.log(failed ? `\n${failed} of ${cases.length} example(s) failed.` : `\nAll ${cases.length} examples passed.`);
process.exit(failed ? 1 : 0);
