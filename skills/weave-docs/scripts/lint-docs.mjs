#!/usr/bin/env node
// Checks Markdown documentation for the deterministic tells in weave-docs.
// Code blocks, inline code, and HTML comments are skipped. Exit code 1 when
// any error is found, so it can run in CI or a pre-commit hook.
//
//   node lint-docs.mjs <file-or-dir>... [--sapaan kamu|anda]

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { lintMarkdown } from './lint-core.mjs';

export function lintFile(file, sapaan) {
  return lintMarkdown(readFileSync(file, 'utf8'), { sapaan });
}

function parseArgs(argv) {
  const args = { paths: [], sapaan: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--sapaan') args.sapaan = (argv[++i] || '').toLowerCase();
    else if (argv[i] === '-h' || argv[i] === '--help') args.help = true;
    else args.paths.push(argv[i]);
  }
  return args;
}

function collect(p, out = []) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) {
      if (['node_modules', '.git', 'vendor'].includes(name)) continue;
      collect(path.join(p, name), out);
    }
  } else if (/\.(md|markdown|mdx)$/i.test(p)) out.push(p);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();

function main() {
const args = parseArgs(process.argv.slice(2));
if (args.help || !args.paths.length || (args.sapaan && !['kamu', 'anda'].includes(args.sapaan))) {
  console.log('Usage: node lint-docs.mjs <file-or-dir>... [--sapaan kamu|anda]');
  process.exit(args.help ? 0 : 2);
}
let errors = 0;
let warnings = 0;
const files = args.paths.flatMap((p) => collect(p));
for (const file of files) {
  for (const i of lintFile(file, args.sapaan)) {
    console.log(`${file}:${i.n}  ${i.level.padEnd(7)} ${i.rule.padEnd(16)} ${i.msg}`);
    if (i.level === 'error') errors++;
    else warnings++;
  }
}
console.log(`\n${files.length} file(s), ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
}
