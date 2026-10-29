#!/usr/bin/env node
// Installer for the anti-ai skills: copies skill folders into the skills
// directory of Claude Code and/or the shared .agents/skills directory that
// Codex, Cursor, Gemini CLI, GitHub Copilot, and other agents read.
//
//   npx antiai                      interactive install
//   npx antiai install [skills...]  install, with -t, -p, -y for no prompts
//   npx antiai list                 list skills in this package
//   npx antiai remove [skills...]   remove installed anti-ai skills

import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = { bold: paint('1'), dim: paint('2'), green: paint('32'), yellow: paint('33'), red: paint('31'), cyan: paint('36'), gray: paint('90'), white: paint('97') };

const LETTERS = {
  A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
  N: ['███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝'],
  T: ['████████╗', '╚══██╔══╝', '   ██║   ', '   ██║   ', '   ██║   ', '   ╚═╝   '],
  I: ['██╗', '██║', '██║', '██║', '██║', '╚═╝'],
  '-': ['      ', '      ', '█████╗', '╚════╝', '      ', '      '],
};

function banner() {
  const shades = [c.white, c.white, paint('37'), paint('37'), c.gray, c.gray];
  const lines = LETTERS.A.map((_, row) => [...'ANTI-AI'].map((ch) => LETTERS[ch][row]).join(''));
  console.log('\n' + lines.map((l, i) => shades[i](l)).join('\n') + '\n');
}

const TARGETS = {
  claude: {
    label: 'Claude Code',
    global: () => path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'skills'),
    project: () => path.join(process.cwd(), '.claude', 'skills'),
  },
  agents: {
    label: 'Other agents (.agents/skills: Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode, ...)',
    global: () => path.join(os.homedir(), '.agents', 'skills'),
    project: () => path.join(process.cwd(), '.agents', 'skills'),
  },
};

async function version() {
  return JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8')).version;
}

// Read every skill's name, description, and "Load with ..." dependencies.
async function loadSkills() {
  const skills = [];
  for (const entry of await readdir(SKILLS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
    if (!existsSync(file)) continue;
    const text = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
    const fm = (text.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
    const name = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim() || entry.name;
    const description = ((fm.match(/^description:\s*"?(.+?)"?$/m) || [])[1] || '').replace(/\\"/g, '"');
    const loadWith = (description.match(/Load with ([^.]+)\./) || [])[1] || '';
    skills.push({ name, dir: entry.name, description, requires: loadWith.match(/antiai-[a-z-]+/g) || [] });
  }
  // antiai-core first, since every other skill depends on it.
  const rank = (s) => (s.name === 'antiai-core' ? 0 : 1);
  return skills.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

// Add every dependency named in "Load with ...", transitively.
function withDependencies(selected, skills) {
  const byName = new Map(skills.map((s) => [s.name, s]));
  const out = new Set();
  const visit = (name) => {
    if (out.has(name) || !byName.has(name)) return;
    out.add(name);
    byName.get(name).requires.forEach(visit);
  };
  selected.forEach(visit);
  return skills.filter((s) => out.has(s.name));
}

function parseArgs(argv) {
  const args = { command: null, names: [], target: null, project: false, yes: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-t' || a === '--target') args.target = argv[++i];
    else if (a === '-p' || a === '--project') args.project = true;
    else if (a === '-g' || a === '--global') args.project = false;
    else if (a === '-y' || a === '--yes') args.yes = true;
    else if (a === '-h' || a === '--help') args.command = 'help';
    else if (a === '-v' || a === '--version') args.command = 'version';
    else if (!args.command && ['install', 'add', 'i', 'list', 'ls', 'remove', 'rm', 'help'].includes(a)) args.command = a;
    else args.names.push(a);
  }
  args.command = { add: 'install', i: 'install', ls: 'list', rm: 'remove' }[args.command] || args.command || 'install';
  return args;
}

function help() {
  console.log(`${c.bold('Usage')}
  npx antiai                         interactive install
  npx antiai install [skills...]     install the named skills (default: all)
  npx antiai list                    list the skills in this package
  npx antiai remove [skills...]      remove installed anti-ai skills (default: all)

${c.bold('Options')}
  -t, --target claude|agents|both    where to install (default: claude)
  -p, --project                      install into this project instead of your user folder
  -y, --yes                          skip prompts
  -v, --version                      print the version
`);
}

// Lines are read through an async iterator, which buffers input typed or
// pasted before the question appears instead of dropping it.
async function ask(lines, question, fallback) {
  process.stdout.write(`${c.cyan('?')} ${question} ${c.gray(`(${fallback})`)} `);
  const { value, done } = await lines.next();
  if (done) process.stdout.write('\n');
  return (done ? '' : value.trim()) || fallback;
}

function resolveTargets(value) {
  if (value === 'both') return ['claude', 'agents'];
  if (TARGETS[value]) return [value];
  throw new Error(`Unknown target "${value}". Use claude, agents, or both.`);
}

function pickByInput(input, skills) {
  if (/^(all|\*)$/i.test(input)) return skills.map((s) => s.name);
  return input.split(/[\s,]+/).filter(Boolean).map((token) => {
    const n = Number(token);
    const skill = Number.isInteger(n) ? skills[n - 1] : skills.find((s) => s.name === token || s.name === `antiai-${token}`);
    if (!skill) throw new Error(`Unknown skill "${token}". Run "npx antiai list" to see the names.`);
    return skill.name;
  });
}

async function install(args, skills) {
  let targets = args.target ? resolveTargets(args.target) : ['claude'];
  let project = args.project;
  let names = args.names.length ? pickByInput(args.names.join(','), skills) : skills.map((s) => s.name);

  if (process.stdin.isTTY && !args.yes) {
    const rl = createInterface({ input: process.stdin, terminal: false });
    const lines = rl[Symbol.asyncIterator]();
    try {
      if (!args.target) {
        console.log(`${c.bold('Install to')}\n  1) ${TARGETS.claude.label}\n  2) ${TARGETS.agents.label}\n  3) Both`);
        targets = resolveTargets({ 1: 'claude', 2: 'agents', 3: 'both' }[await ask(lines, 'Choose 1, 2, or 3', '1')] || 'claude');
      }
      if (!args.project) {
        console.log(`\n${c.bold('Scope')}\n  1) Global: every project on this computer\n  2) This project only: ${process.cwd()}`);
        project = (await ask(lines, 'Choose 1 or 2', '1')) === '2';
      }
      if (!args.names.length) {
        console.log(`\n${c.bold('Skills')}`);
        skills.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)}) ${s.name}`));
        names = pickByInput(await ask(lines, 'Type "all", or numbers/names separated by commas', 'all'), skills);
      }
    } finally {
      rl.close();
    }
  }

  const chosen = withDependencies(names, skills);
  const added = chosen.filter((s) => !names.includes(s.name)).map((s) => s.name);
  console.log('');
  if (added.length) console.log(c.gray(`Also installing required: ${added.join(', ')}`));

  for (const t of targets) {
    const dest = project ? TARGETS[t].project() : TARGETS[t].global();
    await mkdir(dest, { recursive: true });
    for (const s of chosen) {
      const to = path.join(dest, s.dir);
      await rm(to, { recursive: true, force: true });
      await cp(path.join(SKILLS_DIR, s.dir), to, { recursive: true });
    }
    console.log(`${c.green('✓')} ${chosen.length} skill(s) to ${c.bold(TARGETS[t].label.split(' (')[0])} ${c.gray(dest)}`);
  }

  if (chosen.some((s) => s.name === 'antiai-ui')) {
    console.log(`\n${c.bold('antiai-ui scripts')} (crawl, snapshot, compare) need Playwright in your project:`);
    console.log(c.cyan('  npm i -D playwright && npx playwright install chromium'));
  }
  console.log(`\nRestart your agent so it picks up the new skills. Update later with ${c.cyan('npx antiai@latest')}.`);
}

async function remove(args, skills) {
  const names = args.names.length ? pickByInput(args.names.join(','), skills) : skills.map((s) => s.name);
  const targets = args.target ? resolveTargets(args.target) : ['claude', 'agents'];
  let removed = 0;
  for (const t of targets) {
    const dest = args.project ? TARGETS[t].project() : TARGETS[t].global();
    for (const s of skills.filter((x) => names.includes(x.name))) {
      const dir = path.join(dest, s.dir);
      if (existsSync(dir) && (await stat(dir)).isDirectory()) {
        await rm(dir, { recursive: true, force: true });
        console.log(`${c.red('-')} ${s.name} ${c.gray(dir)}`);
        removed++;
      }
    }
  }
  console.log(removed ? `${c.green('✓')} Removed ${removed} folder(s).` : 'Nothing to remove.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === 'version') return console.log(await version());
  banner();
  console.log(`${c.gray(`v${await version()}  Skills that keep AI agents from writing and designing slop.`)}\n`);
  const skills = await loadSkills();
  if (args.command === 'help') return help();
  if (args.command === 'list') {
    for (const s of skills) console.log(`${c.bold(s.name)}\n  ${c.gray(s.description.split('. ')[0])}.\n`);
    return;
  }
  if (args.command === 'remove') return remove(args, skills);
  return install(args, skills);
}

main().catch((err) => {
  console.error(c.red(`Error: ${err.message}`));
  process.exit(1);
});
