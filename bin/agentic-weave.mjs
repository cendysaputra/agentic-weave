#!/usr/bin/env node
// Installer for the Agentic Weave skills: copies skill folders into the skills
// directories that coding agents read (Claude Code, the shared .agents/skills,
// Antigravity, Hermes, Cline, Kiro, Windsurf, Junie, and optionally Grok and
// OpenCode), and can add a managed block to a project's AGENTS.md.
//
//   npx agentic-weave                      interactive install
//   npx agentic-weave install [skills...]  install, with -t, -p, -y for no prompts
//   npx agentic-weave list                 list skills in this package
//   npx agentic-weave remove [skills...]   remove installed Agentic Weave skills

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = { bold: paint('1'), dim: paint('2'), green: paint('32'), yellow: paint('33'), red: paint('31'), cyan: paint('36'), gray: paint('90'), white: paint('97') };

const LETTERS = {
  A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
  C: [' ██████╗', '██╔════╝', '██║     ', '██║     ', '╚██████╗', ' ╚═════╝'],
  E: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '███████╗', '╚══════╝'],
  G: [' ██████╗ ', '██╔════╝ ', '██║  ███╗', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
  I: ['██╗', '██║', '██║', '██║', '██║', '╚═╝'],
  N: ['███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝'],
  T: ['████████╗', '╚══██╔══╝', '   ██║   ', '   ██║   ', '   ██║   ', '   ╚═╝   '],
  V: ['██╗   ██╗', '██║   ██║', '██║   ██║', '╚██╗ ██╔╝', ' ╚████╔╝ ', '  ╚═══╝  '],
  W: ['██╗    ██╗', '██║    ██║', '██║ █╗ ██║', '██║███╗██║', '╚███╔███╔╝', ' ╚══╝╚══╝ '],
};

// Two lines, AGENTIC over WEAVE, so the banner fits an 80-column terminal.
function banner() {
  const shades = [c.white, c.white, paint('37'), paint('37'), c.gray, c.gray];
  const word = (w) => LETTERS.A.map((_, row) => [...w].map((ch) => LETTERS[ch][row]).join('')).map((l, i) => shades[i](l));
  console.log('\n' + [...word('AGENTIC'), ...word('WEAVE')].join('\n') + '\n');
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
  return `<!-- agentic-weave:start v${v} (managed by agentic-weave, do not edit by hand) -->
## agentic-weave

- Load the weave-core skill with the skill that fits the task: weave-ui for UI, weave-docs for docs, weave-commit for commits, weave-pr for pull requests.
- For a website from brief to handoff, follow weave-flow; its state and decisions live in .weave/.
- Run the Delivery Gate in weave-core before handing over text, UI, a commit, or a PR.
- Never commit atm/ or reference-crawl/: they hold copies of third-party sites.
${BLOCK_END}`;
}

// Only both markers, in order, count as a block. Anything else was edited by
// hand, so stop instead of guessing and adding a second block.
function checkMarkers(file, start, end) {
  if ((start === -1) !== (end === -1) || (start !== -1 && end < start)) {
    throw new Error(`${file} has an incomplete agentic-weave block (one marker missing or out of order). Fix or delete it by hand, then run again.`);
  }
}

async function writeAgentsBlock(v) {
  const file = path.join(process.cwd(), 'AGENTS.md');
  const block = agentsBlock(v);
  let text = existsSync(file) ? await readFile(file, 'utf8') : '';
  const start = text.search(BLOCK_START);
  const end = text.indexOf(BLOCK_END);
  checkMarkers(file, start, end);
  if (start !== -1) text = text.slice(0, start) + block + text.slice(end + BLOCK_END.length);
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
  checkMarkers(file, start, end);
  if (start === -1) return false;
  await writeFile(file, (text.slice(0, start).replace(/\s*$/, '') + text.slice(end + BLOCK_END.length)).replace(/^\s*$/, '') + '\n');
  console.log(`${c.red('-')} agentic-weave block ${c.gray(file)}`);
  return true;
}

// Installer state lives outside every agent's skills folder, so backups are
// never loaded as skills: installed.json records what was installed where,
// with a content hash, and backups/ keeps anything replaced or removed.
const STATE_DIR = process.env.AGENTIC_WEAVE_HOME || home('.agentic-weave');
const MANIFEST = path.join(STATE_DIR, 'installed.json');
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return { dirs: {} };
  }
}
async function saveManifest(m) {
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(m, null, 2) + '\n');
}

// One hash for a whole folder: relative paths and file contents, sorted.
async function hashDir(dir) {
  const h = createHash('sha256');
  const walk = async (d, rel) => {
    for (const e of (await readdir(d, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) await walk(p, r);
      else h.update(r).update('\0').update(await readFile(p)).update('\0');
    }
  };
  await walk(dir, '');
  return h.digest('hex');
}

// Move a folder into backups/<stamp>/ and return where it went.
async function backup(dir) {
  const rel = dir.replace(/^[A-Za-z]:/, '').replace(/^[\\/]+/, '');
  const dest = path.join(STATE_DIR, 'backups', stamp, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(dir, dest, { recursive: true });
  await rm(dir, { recursive: true, force: true });
  return dest;
}

// Questions are only asked on a terminal and without -y; otherwise the
// fallback answer is used.
function prompter(args) {
  if (!process.stdin.isTTY || args.yes) return { ask: async (q, fallback) => fallback, close() {} };
  const rl = createInterface({ input: process.stdin, terminal: false });
  const lines = rl[Symbol.asyncIterator]();
  return { ask: (q, fallback) => ask(lines, q, fallback), close: () => rl.close() };
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
    skills.push({ name, dir: entry.name, description, requires: loadWith.match(/weave-[a-z-]+/g) || [] });
  }
  // weave-core first, since every other skill depends on it.
  const rank = (s) => (s.name === 'weave-core' ? 0 : 1);
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
  const args = { command: null, names: [], target: null, project: false, yes: false, agentsMd: false, commit: null, commitFile: null, sapaan: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-t' || a === '--target') args.target = argv[++i];
    else if (a === '-p' || a === '--project') args.project = args.scopeSet = true;
    else if (a === '-g' || a === '--global') {
      args.project = false;
      args.scopeSet = true;
    }
    else if (a === '-y' || a === '--yes') args.yes = true;
    else if (a === '--with-agents-md') args.agentsMd = true;
    else if (a === '--commit' || a === '-m') args.commit = argv[++i];
    else if (a === '--commit-file') args.commitFile = argv[++i];
    else if (a === '--sapaan') args.sapaan = argv[++i];
    else if (a === '--json') args.json = true;
    else if (a === '-h' || a === '--help') args.command = 'help';
    else if (a === '-v' || a === '--version') args.command = 'version';
    else if (!args.command && ['install', 'add', 'i', 'list', 'ls', 'remove', 'rm', 'help', 'check', 'hook'].includes(a)) args.command = a;
    else args.names.push(a);
  }
  args.command = { add: 'install', i: 'install', ls: 'list', rm: 'remove' }[args.command] || args.command || 'install';
  return args;
}

function help() {
  console.log(`${c.bold('Usage')}
  npx agentic-weave                         interactive install
  npx agentic-weave install [skills...]     install the named skills (default: all)
  npx agentic-weave list                    list the skills in this package
  npx agentic-weave check <file-or-dir>...  lint Markdown with the skills' rules; score and top fixes
  npx agentic-weave check --commit "<msg>"   lint a commit message (or --commit-file <file>)
  npx agentic-weave hook                    install a commit-msg hook that runs the commit check
  npx agentic-weave remove [skills...]      remove installed Agentic Weave skills (asks first; -y to skip)

${c.bold('Options')}
  -t, --target <names>               comma-separated agents (default: claude)
                                     ${TARGET_NAMES.join(', ')}, both (claude,agents)
  -g, --global                       install into your user folder (default)
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
    const skill = Number.isInteger(n) ? skills[n - 1] : skills.find((s) => s.name === token || s.name === `weave-${token}`);
    if (!skill) throw new Error(`Unknown skill "${token}". Run "npx agentic-weave list" to see the names.`);
    return skill.name;
  });
}

async function install(args, skills) {
  let targets = args.target ? resolveTargets(args.target) : ['claude'];
  let project = args.project;
  let names = args.names.length ? pickByInput(args.names.join(','), skills) : skills.map((s) => s.name);

  const prompt = prompter(args);
  if (process.stdin.isTTY && !args.yes) {
    const ask = prompt.ask;
    try {
      if (!args.target) {
        console.log(c.bold('Install to'));
        TARGET_NAMES.forEach((name, i) => {
          const t = TARGETS[name];
          const hint = t.optional ? 'only if you skip 1 and 2; it already reads them' : t.note;
          console.log(`  ${String(i + 1).padStart(2)}) ${t.label}${hint ? c.gray(`  ${hint}`) : ''}`);
        });
        targets = resolveTargets(await ask('Numbers or names, separated by commas', '1'));
      }
      if (!args.scopeSet) {
        console.log(`\n${c.bold('Scope')}\n  1) Global: every project on this computer\n  2) This project only: ${process.cwd()}`);
        project = (await ask('Choose 1 or 2', '1')) === '2';
      }
      if (project && !args.agentsMd) {
        args.agentsMd = /^y/i.test(await ask('Add the agentic-weave block to ./AGENTS.md? y/n', 'n'));
      }
      if (!args.names.length) {
        console.log(`\n${c.bold('Skills')}`);
        skills.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)}) ${s.name}`));
        names = pickByInput(await ask('Type "all", or numbers/names separated by commas', 'all'), skills);
      }
    } catch (err) {
      prompt.close();
      throw err;
    }
  }

  const chosen = withDependencies(names, skills);
  const added = chosen.filter((s) => !names.includes(s.name)).map((s) => s.name);
  console.log('');
  if (added.length) console.log(c.gray(`Also installing required: ${added.join(', ')}`));

  const manifest = await loadManifest();
  const backups = [];
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
      const record = (manifest.dirs[dest] ||= {});
      let installed = 0;
      for (const s of chosen) {
        const src = path.join(SKILLS_DIR, s.dir);
        const to = path.join(dest, s.dir);
        const fresh = await hashDir(src);
        if (existsSync(to)) {
          const current = await hashDir(to);
          // Unchanged since we installed it, or already identical: replace quietly.
          // Anything else was edited by the user: back it up first, or skip.
          if (current !== fresh && current !== record[s.dir]) {
            const yes = /^y/i.test(await prompt.ask(`${to} was edited since it was installed. Back it up and replace it? y/n`, 'y'));
            if (!yes) {
              console.log(c.gray(`  kept your edited ${s.dir}`));
              continue;
            }
            backups.push(await backup(to));
          }
          await rm(to, { recursive: true, force: true });
        }
        await cp(src, to, { recursive: true });
        record[s.dir] = fresh;
        installed++;
        // Skills were named antiai-* before the Agentic Weave rename. Move the
        // old copy to backups so agents do not list the same skill twice.
        const legacy = path.join(dest, s.dir.replace(/^weave-/, 'antiai-'));
        if (legacy !== to && existsSync(legacy)) {
          if (/^y/i.test(await prompt.ask(`Move the old ${path.basename(legacy)} (now ${s.dir}) to backups? y/n`, 'y'))) {
            backups.push(await backup(legacy));
            console.log(c.gray(`  moved old ${path.basename(legacy)} to backups (renamed to ${s.dir})`));
          }
        }
      }
      console.log(`${c.green('✓')} ${installed} skill(s) to ${c.bold(TARGETS[t].label)} ${c.gray(dest)}`);
    }
  }
  prompt.close();
  await saveManifest(manifest);
  if (backups.length) console.log(`${c.yellow('!')} Backed up ${backups.length} folder(s) to ${c.bold(path.join(STATE_DIR, 'backups', stamp))}`);
  if (args.agentsMd) await writeAgentsBlock(await version());

  if (chosen.some((s) => s.name === 'weave-ui')) {
    console.log(`\n${c.bold('weave-ui scripts')} (crawl, snapshot, compare) need Playwright in your project:`);
    console.log(c.cyan('  npm i -D playwright && npx playwright install chromium'));
  }
  console.log(`\nRestart your agent so it picks up the new skills. Update later with ${c.cyan('npx agentic-weave@latest')}.`);
}

async function remove(args, skills) {
  const names = args.names.length ? pickByInput(args.names.join(','), skills) : skills.map((s) => s.name);
  const manifest = await loadManifest();
  // Without -t, only touch folders this installer recorded; fall back to every
  // known folder only when there is no record at all (installs before 1.1).
  const known = Object.keys(manifest.dirs).filter((d) => args.project === d.startsWith(process.cwd() + path.sep));
  const dirs = args.target
    ? [...new Set(resolveTargets(args.target).flatMap((t) => targetDirs(t, args.project)))]
    : known.length ? known : [...new Set(TARGET_NAMES.flatMap((t) => targetDirs(t, args.project)))];
  const found = [];
  for (const dest of dirs) {
    for (const s of skills.filter((x) => names.includes(x.name))) {
      const dir = path.join(dest, s.dir);
      if (existsSync(dir) && (await stat(dir)).isDirectory()) found.push({ dest, s, dir });
    }
  }
  if (!found.length && !args.agentsMd) return console.log('Nothing to remove.');
  for (const f of found) console.log(`  ${f.s.name} ${c.gray(f.dir)}`);
  if (!args.yes) {
    if (!process.stdin.isTTY) throw new Error('remove deletes folders; run it in a terminal or add -y to confirm.');
    const prompt = prompter(args);
    const yes = /^y/i.test(await prompt.ask(`Remove ${found.length} folder(s)? y/n`, 'n'));
    prompt.close();
    if (!yes) return console.log('Nothing removed.');
  }
  let removed = 0;
  const backups = [];
  for (const { dest, s, dir } of found) {
    const record = manifest.dirs[dest] || {};
    // A skill edited after install goes to backups instead of being deleted.
    if ((await hashDir(dir)) !== record[s.dir]) backups.push(await backup(dir));
    else await rm(dir, { recursive: true, force: true });
    delete record[s.dir];
    if (manifest.dirs[dest] && !Object.keys(manifest.dirs[dest]).length) delete manifest.dirs[dest];
    console.log(`${c.red('-')} ${s.name} ${c.gray(dir)}`);
    removed++;
  }
  await saveManifest(manifest);
  if (args.agentsMd && (await removeAgentsBlock())) removed++;
  if (backups.length) console.log(`${c.yellow('!')} ${backups.length} edited folder(s) kept in ${c.bold(path.join(STATE_DIR, 'backups', stamp))}`);
  console.log(removed ? `${c.green('✓')} Removed ${removed} item(s).` : 'Nothing to remove.');
}

// `check`: lint Markdown files and commit messages with the same rules the
// skills use, and print a score plus the three most useful fixes.
const missing = (p) => (err) => {
  throw err.code === 'ENOENT' ? new Error(`No such file or directory: ${p}`) : err;
};

async function check(args) {
  const { lintMarkdown } = await import(pathToFileURL(path.join(SKILLS_DIR, 'weave-docs', 'scripts', 'lint-core.mjs')).href);
  const { lintCommit } = await import(pathToFileURL(path.join(SKILLS_DIR, 'weave-commit', 'scripts', 'lint-commit-core.mjs')).href);
  if (args.sapaan && !['kamu', 'anda'].includes(args.sapaan)) throw new Error('--sapaan must be kamu or anda');
  const results = [];
  if (args.commit !== null || args.commitFile) {
    const msg = args.commitFile ? await readFile(args.commitFile, 'utf8').catch(missing(args.commitFile)) : args.commit;
    results.push({ target: args.commitFile || 'commit message', issues: lintCommit(msg) });
  }
  const files = [];
  const collect = async (p) => {
    const st = await stat(p).catch(missing(p));
    if (st.isDirectory()) {
      for (const e of await readdir(p)) if (!['node_modules', '.git', 'vendor'].includes(e)) await collect(path.join(p, e));
    } else if (/\.(md|markdown|mdx)$/i.test(p)) files.push(p);
  };
  for (const p of args.names) await collect(p);
  for (const f of files) results.push({ target: f, issues: lintMarkdown(await readFile(f, 'utf8'), { sapaan: args.sapaan }) });
  if (!results.length) throw new Error('Nothing to check. Usage: npx agentic-weave check <file-or-dir>... [--commit "<message>" | --commit-file <file>] [--sapaan kamu|anda]');

  const all = results.flatMap((r) => r.issues);
  const errors = all.filter((i) => i.level === 'error').length;
  const warnings = all.length - errors;
  // Each item (a file or a commit message) scores 100 minus 10 per error and
  // 3 per warning; the score shown is their average, so one bad file in a
  // large folder does not zero the whole run.
  const itemScore = (issues) => Math.max(0, 100 - issues.filter((i) => i.level === 'error').length * 10 - issues.filter((i) => i.level !== 'error').length * 3);
  const score = Math.round(results.reduce((n, r) => n + itemScore(r.issues), 0) / results.length);
  const byRule = new Map();
  for (const i of all) byRule.set(i.rule, [...(byRule.get(i.rule) || []), i]);
  const top = [...byRule.values()].sort((a, b) => (b[0].level === 'error') - (a[0].level === 'error') || b.length - a.length).slice(0, 3)
    .map((list) => ({ rule: list[0].rule, count: list.length, fix: list[0].msg }));
  if (args.json) {
    console.log(JSON.stringify({ score, errors, warnings, top, results }, null, 2));
  } else {
    for (const r of results) for (const i of r.issues) {
      console.log(`${r.target}:${i.n}  ${(i.level === 'error' ? c.red : c.yellow)(i.level.padEnd(7))} ${i.rule.padEnd(16)} ${i.msg}`);
    }
    console.log(`\n${c.bold(`Score ${score}/100`)}  ${errors} error(s), ${warnings} warning(s) in ${results.length} item(s).`);
    if (top.length) {
      console.log(c.bold('Fix first:'));
      top.forEach((t, n) => console.log(`  ${n + 1}. ${t.rule} (${t.count}x): ${t.fix}`));
    }
  }
  process.exitCode = errors ? 1 : 0;
}

// `hook`: install a commit-msg hook that runs weave-commit's checker through
// the installed package, with a copy next to the hook for when it is missing.
const HOOK_MARK = '# agentic-weave commit-msg hook';
async function hook(args) {
  const { execFileSync } = await import('node:child_process');
  const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
  let hooksDir;
  try {
    hooksDir = path.resolve(git('rev-parse', '--git-path', 'hooks'));
  } catch {
    throw new Error('Not inside a git repository.');
  }
  let custom = '';
  try {
    custom = git('config', '--get', 'core.hooksPath');
  } catch {}
  const file = path.join(hooksDir, 'commit-msg');
  const ours = existsSync(file) && (await readFile(file, 'utf8')).includes(HOOK_MARK);
  if (args.names[0] === 'remove' || args.names[0] === '--remove') {
    if (!ours) return console.log('No agentic-weave commit-msg hook to remove.');
    await rm(file, { force: true });
    await rm(path.join(hooksDir, 'agentic-weave'), { recursive: true, force: true });
    return console.log(`${c.red('-')} commit-msg hook ${c.gray(file)}`);
  }
  if (custom) {
    console.log(`${c.yellow('!')} This repository uses core.hooksPath (${custom}), for example through husky.`);
    console.log('  Add this line to that commit-msg hook instead:');
    console.log(c.cyan('  npx --yes agentic-weave check --commit-file "$1"'));
    return;
  }
  if (existsSync(file) && !ours) {
    throw new Error(`${file} already exists and was not written by agentic-weave. Add this line to it instead:\n  npx --yes agentic-weave check --commit-file "$1"`);
  }
  const dir = path.join(hooksDir, 'agentic-weave');
  await mkdir(dir, { recursive: true });
  for (const f of ['lint-commit.mjs', 'lint-commit-core.mjs']) await cp(path.join(SKILLS_DIR, 'weave-commit', 'scripts', f), path.join(dir, f));
  // Prefer the installed package, so an upgrade takes effect without
  // rerunning `hook`. --offline --no-install never waits on the registry; the
  // probe tells "package missing" apart from "commit rejected", and only the
  // former falls back to the copy.
  const npx = 'npx --offline --no-install agentic-weave';
  await writeFile(file, [
    '#!/bin/sh',
    `${HOOK_MARK} (v${await version()}). Remove with: npx agentic-weave hook remove`,
    `if command -v npx >/dev/null 2>&1 && ${npx} version >/dev/null 2>&1; then`,
    `  exec ${npx} check --commit-file "$1"`,
    'fi',
    'echo "agentic-weave: package not found; using the copy in .git/hooks/agentic-weave. Run npx agentic-weave hook to update it." >&2',
    'exec node "$(dirname "$0")/agentic-weave/lint-commit.mjs" "$1"',
    '',
  ].join('\n'), { mode: 0o755 });
  console.log(`${c.green('✓')} commit-msg hook ${c.gray(file)}`);
  console.log(c.gray('  Commits with generic subjects or emoji are rejected; warnings are printed but allowed.'));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === 'version') return console.log(await version());
  if (args.command === 'check') return check(args);
  if (args.command === 'hook') return hook(args);
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
