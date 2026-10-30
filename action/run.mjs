#!/usr/bin/env node
// Entry point for the agentic-weave GitHub Action (action.yml). Checks the PR
// title, the commit messages, and Markdown files with the same linters the
// skills ship, writes annotations and a job summary, and fails the step
// according to `fail-on`. Needs Node 18 or later and no npm install.

import { appendFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { lintMarkdown } from '../skills/weave-docs/scripts/lint-core.mjs';
import { lintCommit } from '../skills/weave-commit/scripts/lint-commit-core.mjs';

const env = process.env;
const input = (name, fallback = '') => (env[`INPUT_${name.toUpperCase().replace(/-/g, '_')}`] ?? fallback).trim();
const yes = (v) => /^(true|yes|1)$/i.test(v);

const failOn = input('fail-on', 'error').toLowerCase();
const sapaan = input('sapaan').toLowerCase() || null;
if (!['error', 'warning', 'never'].includes(failOn)) fail('fail-on must be error, warning, or never');
if (sapaan && !['kamu', 'anda'].includes(sapaan)) fail('sapaan must be kamu or anda');

const event = env.GITHUB_EVENT_PATH && existsSync(env.GITHUB_EVENT_PATH) ? JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8')) : {};
const pr = event.pull_request;
const api = env.GITHUB_API_URL || 'https://api.github.com';
const repo = env.GITHUB_REPOSITORY;
const token = input('github-token');

async function getAll(url) {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${api}${url}${url.includes('?') ? '&' : '?'}per_page=100&page=${page}`, {
      headers: { accept: 'application/vnd.github+json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status} on ${url}: ${(await res.text()).slice(0, 200)}`);
    const batch = await res.json();
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

function collect(p, out) {
  if (!existsSync(p)) return out;
  if (statSync(p).isDirectory()) {
    for (const name of readdirSync(p)) if (!['node_modules', '.git', 'vendor'].includes(name)) collect(path.join(p, name), out);
  } else if (/\.(md|markdown|mdx)$/i.test(p)) out.push(p);
  return out;
}

const results = [];
if (pr && yes(input('pr-title', 'true'))) results.push({ target: 'PR title', issues: lintCommit(pr.title || '') });

if (yes(input('commits', 'true'))) {
  let messages = [];
  if (pr && repo) messages = (await getAll(`/repos/${repo}/pulls/${pr.number}/commits`)).map((c) => ({ sha: c.sha, msg: c.commit.message }));
  else if (Array.isArray(event.commits)) messages = event.commits.map((c) => ({ sha: c.id, msg: c.message }));
  for (const { sha, msg } of messages) results.push({ target: `commit ${sha.slice(0, 7)}`, issues: lintCommit(msg) });
}

let paths = input('paths').split(/\s+/).filter(Boolean);
if (!paths.length && pr && repo) {
  paths = (await getAll(`/repos/${repo}/pulls/${pr.number}/files`)).filter((f) => f.status !== 'removed').map((f) => f.filename);
}
const files = [...new Set(paths.flatMap((p) => collect(p, [])))];
for (const f of files) results.push({ target: f, file: f, issues: lintMarkdown(readFileSync(f, 'utf8'), { sapaan }) });

// Annotations, then a job summary with the same score `npx agentic-weave check` prints.
const esc = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escProp = (s) => esc(s).replace(/:/g, '%3A').replace(/,/g, '%2C');
for (const r of results) for (const i of r.issues) {
  const where = r.file ? `file=${escProp(r.file)},line=${i.n},` : '';
  const label = r.file ? i.rule : `${r.target}: ${i.rule}`;
  console.log(`::${i.level === 'error' ? 'error' : 'warning'} ${where}title=${escProp(label)}::${esc(i.msg)}`);
}

const all = results.flatMap((r) => r.issues);
const errors = all.filter((i) => i.level === 'error').length;
const warnings = all.length - errors;
const itemScore = (issues) => Math.max(0, 100 - issues.filter((i) => i.level === 'error').length * 10 - issues.filter((i) => i.level !== 'error').length * 3);
const score = results.length ? Math.round(results.reduce((n, r) => n + itemScore(r.issues), 0) / results.length) : 100;
console.log(`Score ${score}/100: ${errors} error(s), ${warnings} warning(s) in ${results.length} item(s).`);

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const rows = results.flatMap((r) => r.issues.map((i) => `| ${cell(r.target)}${r.file ? `:${i.n}` : ''} | ${i.level} | ${i.rule} | ${cell(i.msg)} |`));
const summary = [
  `### Agentic Weave check: ${score}/100`,
  '',
  `${errors} error(s), ${warnings} warning(s) in ${results.length} item(s).`,
  ...(rows.length ? ['', '| Where | Level | Rule | Fix |', '| --- | --- | --- | --- |', ...rows.slice(0, 200)] : []),
  ...(rows.length > 200 ? ['', `${rows.length - 200} more not shown.`] : []),
  '',
].join('\n');
if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, summary);
if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `score=${score}\nerrors=${errors}\nwarnings=${warnings}\n`);

if ((failOn === 'error' && errors) || (failOn === 'warning' && all.length)) process.exitCode = 1;

function fail(msg) {
  console.log(`::error::${esc(msg)}`);
  process.exit(1);
}
