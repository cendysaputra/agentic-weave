#!/usr/bin/env node
// Tests for bin/agentic-weave.mjs. Every case runs the real CLI against a
// temporary HOME, state folder, and project folder, so nothing outside the
// temp directory is touched.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'bin', 'agentic-weave.mjs');

let failed = 0;
function test(name, fn) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'aw-test-'));
  const env = { home: path.join(tmp, 'home'), state: path.join(tmp, 'state'), project: path.join(tmp, 'project') };
  for (const d of Object.values(env)) mkdirSync(d, { recursive: true });
  env.skills = path.join(env.home, '.claude', 'skills');
  env.run = (...args) => spawnSync(process.execPath, [CLI, ...args], {
    cwd: env.project,
    encoding: 'utf8',
    input: '',
    env: { ...process.env, HOME: env.home, USERPROFILE: env.home, AGENTIC_WEAVE_HOME: env.state, CLAUDE_CONFIG_DIR: '', NO_COLOR: '1' },
  });
  try {
    fn(env);
    console.log(`ok    ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL  ${name}\n      ${err.message}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
const backupsOf = (env) => {
  const dir = path.join(env.state, 'backups');
  if (!existsSync(dir)) return [];
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (existsSync(path.join(d, e.name, 'SKILL.md'))) out.push(path.join(d, e.name));
      else walk(path.join(d, e.name));
    }
  };
  walk(dir);
  return out;
};

test('installs skills and their dependencies, and records them', (env) => {
  const r = env.run('install', 'ui', '-t', 'claude', '-y');
  assert(r.status === 0, r.stderr || r.stdout);
  assert(existsSync(path.join(env.skills, 'weave-ui', 'SKILL.md')), 'weave-ui missing');
  assert(existsSync(path.join(env.skills, 'weave-core', 'SKILL.md')), 'dependency weave-core missing');
  const m = JSON.parse(readFileSync(path.join(env.state, 'installed.json'), 'utf8'));
  assert(m.dirs[env.skills]?.['weave-ui'], 'manifest has no hash for weave-ui');
});

test('reinstalling an unedited skill makes no backup', (env) => {
  env.run('install', 'core', '-t', 'claude', '-y');
  const r = env.run('install', 'core', '-t', 'claude', '-y');
  assert(r.status === 0, r.stderr);
  assert(backupsOf(env).length === 0, 'unexpected backup');
});

test('an edited skill is backed up before it is replaced', (env) => {
  env.run('install', 'core', '-t', 'claude', '-y');
  const file = path.join(env.skills, 'weave-core', 'SKILL.md');
  writeFileSync(file, readFileSync(file, 'utf8') + '\nMy own rule.\n');
  const r = env.run('install', 'core', '-t', 'claude', '-y');
  assert(r.status === 0, r.stderr);
  const [b] = backupsOf(env);
  assert(b && readFileSync(path.join(b, 'SKILL.md'), 'utf8').includes('My own rule.'), 'edit not in backup');
  assert(!readFileSync(file, 'utf8').includes('My own rule.'), 'skill was not replaced');
});

test('old antiai-* folders go to backups, not the bin', (env) => {
  mkdirSync(path.join(env.skills, 'antiai-core'), { recursive: true });
  writeFileSync(path.join(env.skills, 'antiai-core', 'SKILL.md'), 'old');
  writeFileSync(path.join(env.skills, 'unrelated.txt'), 'keep');
  const r = env.run('install', 'core', '-t', 'claude', '-y');
  assert(r.status === 0, r.stderr);
  assert(!existsSync(path.join(env.skills, 'antiai-core')), 'legacy folder still in skills');
  assert(backupsOf(env).some((b) => b.endsWith('antiai-core')), 'legacy folder not backed up');
  assert(existsSync(path.join(env.skills, 'unrelated.txt')), 'unrelated file touched');
});

test('remove refuses to run without a terminal or -y', (env) => {
  env.run('install', 'core', '-t', 'claude', '-y');
  const r = env.run('remove');
  assert(r.status !== 0, 'remove ran without confirmation');
  assert(existsSync(path.join(env.skills, 'weave-core')), 'skill deleted without confirmation');
});

test('remove -y touches only recorded folders', (env) => {
  env.run('install', 'core', '-t', 'claude', '-y');
  const other = path.join(env.home, '.agents', 'skills', 'weave-core');
  mkdirSync(other, { recursive: true });
  writeFileSync(path.join(other, 'SKILL.md'), 'installed by something else');
  const r = env.run('remove', '-y');
  assert(r.status === 0, r.stderr);
  assert(!existsSync(path.join(env.skills, 'weave-core')), 'recorded skill not removed');
  assert(existsSync(other), 'unrecorded folder removed');
});

test('AGENTS.md block is added once and updated in place', (env) => {
  writeFileSync(path.join(env.project, 'AGENTS.md'), '# AGENTS.md\n\nProject rules.\n');
  env.run('install', 'core', '-t', 'claude', '-p', '-y', '--with-agents-md');
  env.run('install', 'core', '-t', 'claude', '-p', '-y', '--with-agents-md');
  const text = readFileSync(path.join(env.project, 'AGENTS.md'), 'utf8');
  assert((text.match(/agentic-weave:start/g) || []).length === 1, 'block duplicated');
  assert(text.includes('Project rules.'), 'existing content lost');
});

test('a half-deleted AGENTS.md block stops the install', (env) => {
  const original = '# AGENTS.md\n\n<!-- agentic-weave:start v1 -->\nedited by hand\n';
  writeFileSync(path.join(env.project, 'AGENTS.md'), original);
  const r = env.run('install', 'core', '-t', 'claude', '-p', '-y', '--with-agents-md');
  assert(r.status !== 0, 'install did not stop');
  assert(readFileSync(path.join(env.project, 'AGENTS.md'), 'utf8') === original, 'AGENTS.md changed');
});

test('check scores Markdown and commit messages and fails on errors', (env) => {
  writeFileSync(path.join(env.project, 'doc.md'), '# Doc\n\nCertainly! It works — well.\n');
  const bad = env.run('check', 'doc.md', '--commit', 'Update code');
  assert(bad.status === 1, 'check passed with errors');
  assert(/em-dash/.test(bad.stdout) && /generic-subject/.test(bad.stdout) && /Score \d+\/100/.test(bad.stdout), bad.stdout);
  writeFileSync(path.join(env.project, 'ok.md'), '# Doc\n\nRun `npm test` before each commit.\n');
  const good = env.run('check', 'ok.md', '--commit', 'fix: stop duplicate webhook processing');
  assert(good.status === 0, good.stdout);
});

test('check averages the score per file and still fails on one error', (env) => {
  writeFileSync(path.join(env.project, 'dash.md'), '# Dash\n\nIt works — mostly.\n');
  writeFileSync(path.join(env.project, 'ok.md'), '# Doc\n\nRun `npm test` before each commit.\n');
  const two = env.run('check', 'dash.md', 'ok.md');
  assert(two.status === 1 && /Score 95\/100/.test(two.stdout), two.stdout);
  writeFileSync(path.join(env.project, 'dash.md'), '# Bad\n\n' + 'A — b.\n\n'.repeat(11));
  const zero = env.run('check', 'dash.md', 'ok.md');
  assert(zero.status === 1 && /Score 50\/100/.test(zero.stdout), zero.stdout);
});

test('hook rejects a generic commit and accepts a specific one', (env) => {
  const git = (...a) => spawnSync('git', a, { cwd: env.project, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } });
  git('init', '-q');
  git('config', 'core.hooksPath', '');
  git('config', '--unset', 'core.hooksPath');
  const r = env.run('hook');
  assert(r.status === 0, r.stderr || r.stdout);
  writeFileSync(path.join(env.project, 'a.txt'), 'a');
  git('add', 'a.txt');
  assert(git('commit', '-q', '-m', 'Update code').status !== 0, 'generic commit accepted');
  assert(git('commit', '-q', '-m', 'feat: add the first sample file').status === 0, 'specific commit rejected');
});

console.log(failed ? `\n${failed} installer test(s) failed.` : '\nAll installer tests passed.');
process.exit(failed ? 1 : 0);
