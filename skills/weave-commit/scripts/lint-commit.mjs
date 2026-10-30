#!/usr/bin/env node
// Checks a commit message against weave-commit. Exit code 1 on errors, so it
// works as a commit-msg hook.
//
//   node lint-commit.mjs <message-file>
//   node lint-commit.mjs -m "fix: stop duplicate webhook processing"

import { readFileSync } from 'node:fs';
import { lintCommit } from './lint-commit-core.mjs';

const argv = process.argv.slice(2);
const message = argv[0] === '-m' ? argv.slice(1).join(' ') : argv[0] ? readFileSync(argv[0], 'utf8') : '';
if (!message) {
  console.log('Usage: node lint-commit.mjs <message-file> | -m "<message>"');
  process.exit(2);
}
const issues = lintCommit(message);
for (const i of issues) console.log(`line ${i.n}  ${i.level.padEnd(7)} ${i.rule.padEnd(15)} ${i.msg}`);
const errors = issues.filter((i) => i.level === 'error').length;
if (errors) console.log('\nCommit message rejected by weave-commit. Rewrite the subject to name the change.');
process.exit(errors ? 1 : 0);
