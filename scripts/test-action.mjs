#!/usr/bin/env node
// Tests for action/run.mjs. A local HTTP server stands in for the GitHub API,
// so the Action runs exactly as on a runner, without network access.

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUN = path.join(ROOT, 'action', 'run.mjs');

const commits = [{ sha: 'a'.repeat(40), commit: { message: 'Update code' } }, { sha: 'b'.repeat(40), commit: { message: 'fix: stop duplicate webhook processing' } }];
const prFiles = [{ filename: 'docs/guide.md', status: 'modified' }, { filename: 'gone.md', status: 'removed' }];
const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'application/json');
  if (req.url.startsWith('/repos/o/r/pulls/7/commits')) return res.end(JSON.stringify(commits));
  if (req.url.startsWith('/repos/o/r/pulls/7/files')) return res.end(JSON.stringify(prFiles));
  res.statusCode = 404;
  res.end('{}');
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const api = `http://127.0.0.1:${server.address().port}`;

function run(dir, title, inputs = {}) {
  const event = path.join(dir, 'event.json');
  writeFileSync(event, JSON.stringify({ pull_request: { number: 7, title } }));
  writeFileSync(path.join(dir, 'summary.md'), '');
  writeFileSync(path.join(dir, 'output.txt'), '');
  const envInputs = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [`INPUT_${k.toUpperCase().replace(/-/g, '_')}`, v]));
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [RUN], {
      cwd: dir,
      env: { ...process.env, GITHUB_EVENT_PATH: event, GITHUB_API_URL: api, GITHUB_REPOSITORY: 'o/r', GITHUB_STEP_SUMMARY: path.join(dir, 'summary.md'), GITHUB_OUTPUT: path.join(dir, 'output.txt'), ...envInputs },
    });
    let stdout = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stdout += d));
    child.on('close', (status) => resolve({ status, stdout, summary: readFileSync(path.join(dir, 'summary.md'), 'utf8'), output: readFileSync(path.join(dir, 'output.txt'), 'utf8') }));
  });
}

let failed = 0;
async function test(name, fn) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'aw-action-'));
  mkdirSync(path.join(dir, 'docs'));
  writeFileSync(path.join(dir, 'docs', 'guide.md'), '# Guide\n\nRun `npm test` before each commit.\n');
  try {
    await fn(dir);
    console.log(`ok    ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL  ${name}\n      ${err.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

await test('flags a generic commit and fails on errors', async (dir) => {
  const r = await run(dir, 'feat: add webhook retries');
  assert(r.status === 1, r.stdout);
  assert(/::error title=commit aaaaaaa%3A generic-subject::/.test(r.stdout), r.stdout);
  assert(!/commit bbbbbbb/.test(r.stdout), 'specific commit flagged');
  // Four items: clean title 100, `Update code` 90, specific commit 100, clean guide 100.
  assert(/score=98\n/.test(r.output) && /Agentic Weave check: 98\/100/.test(r.summary), r.output + r.summary);
});

await test('annotates changed Markdown by file and line', async (dir) => {
  writeFileSync(path.join(dir, 'docs', 'guide.md'), '# Guide\n\nIt works — mostly.\n');
  const r = await run(dir, 'docs: explain the retry policy', { commits: 'false' });
  assert(r.status === 1, r.stdout);
  assert(/::error file=docs\/guide\.md,line=3,title=em-dash::/.test(r.stdout), r.stdout);
});

await test('fail-on never reports without failing', async (dir) => {
  const r = await run(dir, 'Update code', { 'fail-on': 'never' });
  assert(r.status === 0, r.stdout);
  assert(/PR title%3A generic-subject/.test(r.stdout), r.stdout);
});

await test('a clean PR passes with score 100', async (dir) => {
  const r = await run(dir, 'docs: explain the retry policy', { commits: 'false', paths: 'docs' });
  assert(r.status === 0 && /score=100\n/.test(r.output), r.stdout + r.output);
});

await test('the score is the average over files, not one total', async (dir) => {
  writeFileSync(path.join(dir, 'docs', 'dash.md'), '# Dash\n\nIt works — mostly.\n');
  const r = await run(dir, 'docs: explain the retry policy', { commits: 'false', 'pr-title': 'false', paths: 'docs' });
  assert(r.status === 1 && /score=95\n/.test(r.output), r.stdout + r.output);
});

await test('one file at zero does not zero the run, and still fails', async (dir) => {
  writeFileSync(path.join(dir, 'docs', 'bad.md'), '# Bad\n\n' + 'A — b.\n\n'.repeat(11));
  const r = await run(dir, 'docs: explain the retry policy', { commits: 'false', 'pr-title': 'false', paths: 'docs' });
  assert(r.status === 1 && /score=50\n/.test(r.output), r.stdout + r.output);
});

await test('paths read .mdx but not .txt', async (dir) => {
  writeFileSync(path.join(dir, 'docs', 'notes.txt'), 'It works — mostly.\n');
  writeFileSync(path.join(dir, 'docs', 'page.mdx'), '# Page\n\nIt works — mostly.\n');
  const r = await run(dir, 'docs: explain the retry policy', { commits: 'false', paths: 'docs' });
  assert(/file=docs\/page\.mdx/.test(r.stdout) && !/notes\.txt/.test(r.stdout), r.stdout);
});

server.close();
console.log(failed ? `\n${failed} action test(s) failed.` : '\nAll action tests passed.');
process.exit(failed ? 1 : 0);
