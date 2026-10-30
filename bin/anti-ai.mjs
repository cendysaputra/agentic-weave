#!/usr/bin/env node
// Installer for the anti-ai skills: copies skill folders into the skills
// directories that coding agents read (Claude Code, the shared .agents/skills,
// Antigravity, Hermes, Cline, Kiro, Windsurf, Junie, and optionally Grok and
// OpenCode), and can add a managed block to a project's AGENTS.md.
//
//   npx anti-ai-skills                      interactive install
//   npx anti-ai-skills install [skills...]  install, with -t, -p, -y for no prompts
//   npx anti-ai-skills list                 list skills in this package
//   npx anti-ai-skills remove [skills...]   remove installed anti-ai skills

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
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

// Skill folders per agent, from each agent's documentation (checked 2026-10-29,
// see research/2026-10-29-04-tahap-1-deep.md). null means the agent documents no
// folder for that scope. "optional" agents already read the claude or agents
// folders, so installing there as well can list every skill twice.
const home = (...p) => path.join(os.homedir(), ...p);
const TARGETS = {
  claude: {
    label: 'Claude Code',
    note: 'also read by OpenCode, Amp, Grok, and Cline (per project)',
    global: () => [path.join(process.env.CLAUDE_CONFIG_DIR || home('.claude'), 'skills')],
    project: ['.claude', 'skills'],
  },
  agents: {
    label: 'Shared .agents/skills',
    note: 'Codex, Cursor, GitHub Copilot, OpenCode, Amp, Grok; Antigravity per project',
    global: () => [home('.agents', 'skills')],
    project: ['.agents', 'skills'],
  },
  antigravity: {
    label: 'Antigravity (CLI and app)',
    global: () => [home('.gemini', 'antigravity-cli', 'skills'), home('.gemini', 'config', 'skills')],
    project: ['.agents', 'skills'],
  },
  hermes: { label: 'Hermes Agent', global: () => [home('.hermes', 'skills')], project: null },
  cline: { label: 'Cline', global: () => [home('.cline', 'skills')], project: ['.cline', 'skills'] },
  kiro: { label: 'Kiro', global: () => [home('.kiro', 'skills')], project: ['.kiro', 'skills'] },
  windsurf: { label: 'Windsurf / Devin Desktop', global: () => [home('.codeium', 'windsurf', 'skills')], project: ['.devin', 'skills'] },
  junie: { label: 'Junie', global: null, project: ['.junie', 'skills'] },
  grok: { label: 'Grok Build', optional: true, global: () => [home('.grok', 'skills')], project: ['.grok', 'skills'] },
  opencode: { label: 'OpenCode', optional: true, global: () => [home('.config', 'opencode', 'skills')], project: ['.opencode', 'skills'] },
};
const TARGET_NAMES = Object.keys(TARGETS);

// Directories for one target and scope, or [] when the agent has none.
function targetDirs(name, project) {
  const t = TARGETS[name];
  if (project) return t.project ? [path.join(process.cwd(), ...t.project)] : [];
  return t.global ? t.global() : [];
}

// The block this installer owns inside a project's AGENTS.md. Everything
// between the markers is replaced on each install; the rest is left alone.
const BLOCK_START = /<!-- agentic-weave:start[^>]*-->/;
const BLOCK_END = '<!-- agentic-weave:end -->';
function agentsBlock(v) {
  return `<!-- agentic-weave:start v${v} (managed by anti-ai-skills, do not edit by hand) -->
## agentic-weave

- Load the antiai-core skill with the skill that fits the task: antiai-ui for UI, antiai-docs for docs, antiai-commit for commits, antiai-pr for pull requests.
- Run the Delivery Gate in antiai-core before handing over text, UI, a commit, or a PR.
- Never commit atm/ or reference-crawl/: they hold copies of third-party sites.
${BLOCK_END}`;
}

async function writeAgentsBlock(v) {
  const file = path.join(process.cwd(), 'AGENTS.md');
  const block = agentsBlock(v);
  let text = existsSync(file) ? await readFile(file, 'utf8') : '';
  const start = text.search(BLOCK_START);
  const end = text.indexOf(BLOCK_END);
  if (start !== -1 && end > start) text = text.slice(0, start) + block + text.slice(end + BLOCK_END.length);
  else text = text ? `${text.replace(/\s*$/, '')}\n\n${block}\n` : `# AGENTS.md\n\n${block}\n`;
  await writeFile(file, text);
  console.log(`${c.green('✓')} agentic-weave block in ${c.bold('AGENTS.md')} ${c.gray(file)}`);
  if (existsSync(path.join(process.cwd(), 'CLAUDE.md'))) {
    console.log(c.gray('  Claude Code reads AGENTS.md only when there is no CLAUDE.md. Add a line "@AGENTS.md" to CLAUDE.md.'));
  }
}

async function removeAgentsBlock() {
  const file = path.join(process.cwd(), 'AGENTS.md');
  if (!existsSync(file)) return false;
  const text = await readFile(file, 'utf8');
  const start = text.search(BLOCK_START);
  const end = text.indexOf(BLOCK_END);
  if (start === -1 || end < start) return false;
  await writeFile(file, (text.slice(0, start).replace(/\s*$/, '') + text.slice(end + BLOCK_END.length)).replace(/^\s*$/, '') + '\n');
  console.log(`${c.red('-')} agentic-weave block ${c.gray(file)}`);
  return true;
}

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
  const args = { command: null, names: [], target: null, project: false, yes: false, agentsMd: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-t' || a === '--target') args.target = argv[++i];
    else if (a === '-p' || a === '--project') args.project = true;
    else if (a === '-g' || a === '--global') args.project = false;
    else if (a === '-y' || a === '--yes') args.yes = true;
    else if (a === '--with-agents-md') args.agentsMd = true;
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
  npx anti-ai-skills                         interactive install
  npx anti-ai-skills install [skills...]     install the named skills (default: all)
  npx anti-ai-skills list                    list the skills in this package
  npx anti-ai-skills remove [skills...]      remove installed anti-ai skills (default: all)

${c.bold('Options')}
  -t, --target <names>               comma-separated agents (default: claude)
                                     ${TARGET_NAMES.join(', ')}, both (claude,agents)
  -p, --project                      install into this project instead of your user folder
  --with-agents-md                   add or update the agentic-weave block in ./AGENTS.md
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
  const out = [];
  for (const token of String(value).split(/[\s,]+/).filter(Boolean)) {
    const n = Number(token);
    const names = token === 'both' ? ['claude', 'agents'] : Number.isInteger(n) ? [TARGET_NAMES[n - 1]] : [token];
    for (const name of names) {
      if (!TARGETS[name]) throw new Error(`Unknown target "${token}". Use ${TARGET_NAMES.join(', ')}, or both.`);
      if (!out.includes(name)) out.push(name);
    }
  }
  if (!out.length) throw new Error('No target given.');
  return out;
}

function pickByInput(input, skills) {
  if (/^(all|\*)$/i.test(input)) return skills.map((s) => s.name);
  return input.split(/[\s,]+/).filter(Boolean).map((token) => {
    const n = Number(token);
    const skill = Number.isInteger(n) ? skills[n - 1] : skills.find((s) => s.name === token || s.name === `antiai-${token}`);
    if (!skill) throw new Error(`Unknown skill "${token}". Run "npx anti-ai-skills list" to see the names.`);
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
        console.log(c.bold('Install to'));
        TARGET_NAMES.forEach((name, i) => {
          const t = TARGETS[name];
          const hint = t.optional ? 'only if you skip 1 and 2; it already reads them' : t.note;
          console.log(`  ${String(i + 1).padStart(2)}) ${t.label}${hint ? c.gray(`  ${hint}`) : ''}`);
        });
        targets = resolveTargets(await ask(lines, 'Numbers or names, separated by commas', '1'));
      }
      if (!args.project) {
        console.log(`\n${c.bold('Scope')}\n  1) Global: every project on this computer\n  2) This project only: ${process.cwd()}`);
        project = (await ask(lines, 'Choose 1 or 2', '1')) === '2';
      }
      if (project && !args.agentsMd) {
        args.agentsMd = /^y/i.test(await ask(lines, 'Add the agentic-weave block to ./AGENTS.md? y/n', 'n'));
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

  const done = new Set();
  for (const t of targets) {
    const dirs = targetDirs(t, project);
    if (!dirs.length) {
      console.log(`${c.yellow('!')} ${TARGETS[t].label} has no documented ${project ? 'project' : 'global'} skills folder; skipped.`);
      continue;
    }
    for (const dest of dirs) {
      if (done.has(dest)) continue;
      done.add(dest);
      await mkdir(dest, { recursive: true });
      for (const s of chosen) {
        const to = path.join(dest, s.dir);
        await rm(to, { recursive: true, force: true });
        await cp(path.join(SKILLS_DIR, s.dir), to, { recursive: true });
      }
      console.log(`${c.green('✓')} ${chosen.length} skill(s) to ${c.bold(TARGETS[t].label)} ${c.gray(dest)}`);
    }
  }
  if (args.agentsMd) await writeAgentsBlock(await version());

  if (chosen.some((s) => s.name === 'antiai-ui')) {
    console.log(`\n${c.bold('antiai-ui scripts')} (crawl, snapshot, compare) need Playwright in your project:`);
    console.log(c.cyan('  npm i -D playwright && npx playwright install chromium'));
  }
  console.log(`\nRestart your agent so it picks up the new skills. Update later with ${c.cyan('npx anti-ai-skills@latest')}.`);
}

async function remove(args, skills) {
  const names = args.names.length ? pickByInput(args.names.join(','), skills) : skills.map((s) => s.name);
  const targets = args.target ? resolveTargets(args.target) : TARGET_NAMES;
  let removed = 0;
  const dirs = [...new Set(targets.flatMap((t) => targetDirs(t, args.project)))];
  for (const dest of dirs) {
    for (const s of skills.filter((x) => names.includes(x.name))) {
      const dir = path.join(dest, s.dir);
      if (existsSync(dir) && (await stat(dir)).isDirectory()) {
        await rm(dir, { recursive: true, force: true });
        console.log(`${c.red('-')} ${s.name} ${c.gray(dir)}`);
        removed++;
      }
    }
  }
  if (args.agentsMd && (await removeAgentsBlock())) removed++;
  console.log(removed ? `${c.green('✓')} Removed ${removed} item(s).` : 'Nothing to remove.');
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
