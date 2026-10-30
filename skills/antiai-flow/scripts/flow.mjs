#!/usr/bin/env node
// Keeps the antiai-flow state in .antiai/ and checks each gate from the files
// on disk, so any agent in any session can see where a project stands and
// cannot skip a stage by saying it is done.
//
//   node flow.mjs init [--mode build|atm|rewrite|audit] [--force]
//   node flow.mjs status
//   node flow.mjs check [G0..G8]        check the current (or named) gate
//   node flow.mjs approve G2 --by "<name>" --note "<their words>"
//   node flow.mjs override G1 --reason "<why the user skipped it>"
//
// Exit codes: 0 pass, 1 gate failed, 2 usage error, 3 gate failed twice: stop and ask the user.

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const DIR = path.resolve('.antiai');
const STATE = path.join(DIR, 'state.json');
const MAX_FAILED_CHECKS = 2;

const STAGES = [
  { gate: 'G0', name: 'brief', files: { '00-brief.md': '00-brief.md' } },
  { gate: 'G1', name: 'research', files: { '01-research/refs.json': 'refs.json' } },
  { gate: 'G2', name: 'concept', files: { '02-concept.md': '02-concept.md', 'DESIGN.md': 'DESIGN.md' }, approval: true },
  { gate: 'G3', name: 'copy', files: { '03-copy.md': '03-copy.md' } },
  { gate: 'G4', name: 'stack', files: { '04-stack.md': '04-stack.md' } },
  { gate: 'G5', name: 'build', files: { '05-build-log.md': '05-build-log.md' } },
  { gate: 'G6', name: 'qa', files: { '06-qa.json': 'qa.json' } },
  { gate: 'G7', name: 'release', files: {} },
  { gate: 'G8', name: 'handoff', files: { '07-handoff.md': '07-handoff.md' } },
];
const MODES = {
  build: ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'],
  atm: ['G0', 'G1', 'G2'],
  rewrite: ['G3', 'G5', 'G6'],
  audit: ['G6'],
};

const read = (rel) => readFileSync(path.join(DIR, rel), 'utf8');
const has = (rel) => existsSync(path.join(DIR, rel));
const now = () => new Date().toISOString();

function parseArgs(argv) {
  const args = { command: argv[0], gate: null, mode: 'build', force: false, by: '', note: '', reason: '' };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mode') args.mode = argv[++i];
    else if (a === '--force') args.force = true;
    else if (a === '--by') args.by = argv[++i];
    else if (a === '--note') args.note = argv[++i];
    else if (a === '--reason') args.reason = argv[++i];
    else if (/^G\d$/.test(a)) args.gate = a;
  }
  return args;
}

const loadState = () => {
  if (!existsSync(STATE)) throw usage('No .antiai/state.json here. Run "flow.mjs init" in the project root first.');
  return JSON.parse(readFileSync(STATE, 'utf8'));
};
const saveState = (s) => writeFileSync(STATE, JSON.stringify(s, null, 2) + '\n');
function usage(msg) {
  const e = new Error(msg);
  e.code = 2;
  return e;
}

// Markdown sections: "## Title" -> body with HTML comments removed.
function sections(md) {
  const out = {};
  let current = null;
  for (const line of md.replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      current = h[1];
      out[current] = '';
    } else if (current) out[current] += line + '\n';
  }
  for (const k of Object.keys(out)) out[k] = out[k].trim();
  return out;
}

function requireSections(rel, names, problems, warnings) {
  if (!has(rel)) return problems.push(`${rel} is missing`);
  const s = sections(read(rel));
  for (const n of names) {
    if (!(n in s)) problems.push(`${rel}: section "## ${n}" is missing`);
    else if (!s[n]) problems.push(`${rel}: "## ${n}" is empty`);
    else if (/\[TBD/.test(s[n])) warnings.push(`${rel}: "## ${n}" still has [TBD]`);
  }
}

const tableRows = (text) => text.split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1)
  .filter((l) => l.split('|').slice(1, -1).some((cell) => cell.trim()));

function tokensProblems(problems) {
  const rel = 'tokens.tokens.json';
  if (!has(rel)) return problems.push(`${rel} is missing (write the project's tokens; see antiai-ui references/design-tokens.md)`);
  let doc;
  try {
    doc = JSON.parse(read(rel));
  } catch (e) {
    return problems.push(`${rel} is not valid JSON: ${e.message}`);
  }
  if (doc.$extensions?.['dev.agentic-weave']?.source === 'reference') {
    return problems.push(`${rel} holds a reference site's tokens; decide the project's own (R-40)`);
  }
  let count = 0;
  const walk = (node, type, at) => {
    const t = node.$type || type;
    if ('$value' in node) {
      count++;
      const alias = typeof node.$value === 'string' && /^\{.+\}$/.test(node.$value);
      if (!t && !alias) problems.push(`${rel}: token ${at || '(root)'} has no $type`);
      return;
    }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$') && v && typeof v === 'object') walk(v, t, at ? `${at}.${k}` : k);
  };
  walk(doc, undefined, '');
  if (!count) problems.push(`${rel} has no tokens`);
}

const CHECKS = {
  G0(p, w) {
    requireSections('00-brief.md', ['Business goal', 'Audience', 'KPIs', 'One thing to remember', 'Deadline', 'Budget', 'Content editing', 'Language'], p, w);
  },
  G1(p) {
    const rel = '01-research/refs.json';
    if (!has(rel)) return p.push(`${rel} is missing`);
    let refs;
    try {
      refs = JSON.parse(read(rel)).references || [];
    } catch (e) {
      return p.push(`${rel} is not valid JSON: ${e.message}`);
    }
    const good = refs.filter((r) => /^https?:\/\//.test(r.url || '') && r.reason?.trim() && Array.isArray(r.learn) && r.learn.length);
    if (good.length < 3) p.push(`${rel}: ${good.length} complete reference(s); need 3 with url, reason, and what to learn`);
  },
  G2(p, w) {
    requireSections('02-concept.md', ['Concept statement', 'Signature moment', 'Anti-references'], p, w);
    if (!has('DESIGN.md')) p.push('DESIGN.md is missing');
    else {
      const s = sections(read('DESIGN.md'));
      if (!tableRows(s.Typography || '').length) p.push('DESIGN.md: the Typography table has no rows');
      if (!tableRows(s.Color || '').length) p.push('DESIGN.md: the Color table has no rows');
    }
    tokensProblems(p);
  },
  G3(p, w) {
    if (!has('03-copy.md')) return p.push('03-copy.md is missing');
    const md = read('03-copy.md');
    const s = sections(md);
    const body = Object.entries(s).filter(([k]) => k !== 'Checks').map(([, v]) => v).join('');
    if (!body.trim()) p.push('03-copy.md has no copy yet');
    const unchecked = (s.Checks || '').split('\n').filter((l) => /^- \[ \]/.test(l));
    if (unchecked.length) p.push(`03-copy.md: ${unchecked.length} check(s) not ticked`);
    if (md.replace(/`[^`]*`/g, '').includes('—')) p.push('03-copy.md contains an em dash (R-02)');
    if (/\[TBD/.test(body)) w.push('03-copy.md still has [TBD]');
  },
  G4(p, w) {
    requireSections('04-stack.md', ['Decision tree answers', 'Stack', 'Libraries'], p, w);
  },
  G5(p) {
    if (!has('05-build-log.md')) return p.push('05-build-log.md is missing');
    const s = sections(read('05-build-log.md'));
    if (!tableRows(s.Sections || '').length) p.push('05-build-log.md: the Sections table has no rows');
    if (!(s.Files || '').trim()) p.push('05-build-log.md: no files listed');
  },
  G6(p) {
    if (!has('06-qa.json')) return p.push('06-qa.json is missing');
    let q;
    try {
      q = JSON.parse(read('06-qa.json'));
    } catch (e) {
      return p.push(`06-qa.json is not valid JSON: ${e.message}`);
    }
    const limit = (key, max, unit) => {
      if (typeof q[key] !== 'number') p.push(`06-qa.json: ${key} not measured`);
      else if (q[key] > max) p.push(`06-qa.json: ${key} ${q[key]}${unit} is over ${max}${unit}`);
    };
    limit('lcpMs', 2500, ' ms');
    limit('cls', 0.1, '');
    limit('inpMs', 200, ' ms');
    if (!q.measuredOn || !q.device) p.push('06-qa.json: say when and on which device or throttling profile it was measured (C-6)');
    if (q.a11y?.violations !== 0) p.push('06-qa.json: a11y.violations must be 0');
    if (!q.a11y?.keyboardChecked) p.push('06-qa.json: keyboard navigation not checked');
    if (q.compareBuild?.used && q.compareBuild.modifikasiPassed !== true) p.push('06-qa.json: ATM was used but compare-build --mode modifikasi has not passed');
    const sc = q.selfScore || {};
    if (!['design', 'usability', 'creativity', 'content'].every((k) => typeof sc[k] === 'number')) p.push('06-qa.json: self-score incomplete');
    if (!sc.topFixes?.length) p.push('06-qa.json: list the top fixes from the self-score');
    if (q.deliveryGatePassed !== true) p.push('06-qa.json: Delivery Gate not passed');
  },
  G7(p) {
    try {
      const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
      if (dirty) p.push('uncommitted changes; commit them with antiai-commit before release');
    } catch {
      p.push('not a git repository');
    }
  },
  G8(p, w) {
    requireSections('07-handoff.md', ['What was delivered', 'How to edit content', 'Plugins, libraries, and licenses'], p, w);
    if (has('07-handoff.md') && /(password|passwd|api[_-]?key|secret)\s*[:=]\s*\S+/i.test(read('07-handoff.md'))) {
      p.push('07-handoff.md seems to contain a credential; share it another way and remove it');
    }
  },
};

function init(args) {
  if (!MODES[args.mode]) throw usage(`Unknown mode "${args.mode}". Use ${Object.keys(MODES).join(', ')}.`);
  if (existsSync(STATE) && !args.force) throw usage('.antiai/state.json already exists. Use --force to start over (files are kept).');
  mkdirSync(path.join(DIR, '01-research'), { recursive: true });
  const created = [];
  for (const stage of STAGES.filter((s) => MODES[args.mode].includes(s.gate))) {
    for (const [rel, asset] of Object.entries(stage.files)) {
      if (has(rel)) continue;
      copyFileSync(path.join(ASSETS, asset), path.join(DIR, rel));
      created.push(rel);
    }
  }
  saveState({ version: 1, mode: args.mode, gate: MODES[args.mode][0], gates: {}, attempts: {}, overrides: [], createdAt: now() });
  console.log(`Mode ${args.mode}: gates ${MODES[args.mode].join(' -> ')}`);
  for (const f of created) console.log(`  created .antiai/${f}`);
  console.log(`Next: fill the ${STAGES.find((s) => s.gate === MODES[args.mode][0]).name} stage, then run "flow.mjs check".`);
}

function status() {
  const s = loadState();
  console.log(`Mode ${s.mode}. Current gate: ${s.gate || 'none, all passed'}`);
  for (const g of MODES[s.mode]) {
    const st = s.gates[g];
    const stage = STAGES.find((x) => x.gate === g);
    console.log(`  ${g} ${stage.name.padEnd(9)} ${st ? `${st.status}${st.by ? ` by ${st.by}` : ''} (${st.at})` : g === s.gate ? 'current' : 'pending'}`);
  }
}

function advance(s) {
  const order = MODES[s.mode];
  s.gate = order.find((g) => !['pass', 'override'].includes(s.gates[g]?.status)) || null;
}

function check(args) {
  const s = loadState();
  const gate = args.gate || s.gate;
  if (!gate) return console.log('All gates passed.');
  if (!MODES[s.mode].includes(gate)) throw usage(`${gate} is not part of mode ${s.mode}.`);
  const earlier = MODES[s.mode].slice(0, MODES[s.mode].indexOf(gate)).filter((g) => !['pass', 'override'].includes(s.gates[g]?.status));
  if (earlier.length) throw usage(`Pass ${earlier.join(', ')} first. A stage cannot start before the earlier gates pass.`);
  const problems = [];
  const warnings = [];
  CHECKS[gate](problems, warnings);
  for (const w of warnings) console.log(`warn ${w}`);
  if (problems.length) {
    s.attempts[gate] = (s.attempts[gate] || 0) + 1;
    saveState(s);
    for (const p of problems) console.log(`fail ${p}`);
    if (s.attempts[gate] >= MAX_FAILED_CHECKS) {
      console.log(`${gate} failed ${s.attempts[gate]} times. Stop and ask the user how to proceed instead of retrying.`);
      process.exitCode = 3;
    } else process.exitCode = 1;
    return;
  }
  const stage = STAGES.find((x) => x.gate === gate);
  if (stage.approval && s.gates[gate]?.status !== 'pass') {
    s.gates[gate] = { status: 'checked', at: now() };
    saveState(s);
    console.log(`${gate} files are complete. Show the concept to the user; after they approve in their own words, run: flow.mjs approve ${gate} --by "<name>" --note "<what they said>"`);
    process.exitCode = 1;
    return;
  }
  s.gates[gate] = { ...(s.gates[gate] || {}), status: 'pass', at: now() };
  s.attempts[gate] = 0;
  advance(s);
  saveState(s);
  console.log(`${gate} passed.${s.gate ? ` Next: ${s.gate} (${STAGES.find((x) => x.gate === s.gate).name}).` : ' All gates passed.'}`);
}

function approve(args) {
  const s = loadState();
  const gate = args.gate;
  const stage = STAGES.find((x) => x.gate === gate);
  if (!stage?.approval) throw usage(`${gate || 'That gate'} does not take an approval.`);
  if (s.gates[gate]?.status !== 'checked') throw usage(`Run "flow.mjs check ${gate}" until its files pass before recording approval.`);
  if (!args.by || !args.note) throw usage('approve needs --by "<name>" and --note "<their words>".');
  s.gates[gate] = { status: 'pass', at: now(), by: args.by, note: args.note };
  s.attempts[gate] = 0;
  advance(s);
  saveState(s);
  const concept = path.join(DIR, '02-concept.md');
  if (gate === 'G2' && existsSync(concept)) {
    writeFileSync(concept, readFileSync(concept, 'utf8').replace(/## Approval[\s\S]*$/, `## Approval\n\nApproved by ${args.by} on ${s.gates[gate].at}: "${args.note}"\n`));
  }
  console.log(`${gate} approved by ${args.by}.${s.gate ? ` Next: ${s.gate}.` : ''}`);
}

function override(args) {
  const s = loadState();
  if (!args.gate || !args.reason) throw usage('override needs a gate and --reason "<why the user chose to skip it>".');
  s.gates[args.gate] = { status: 'override', at: now(), reason: args.reason };
  s.overrides.push({ gate: args.gate, at: now(), reason: args.reason });
  advance(s);
  saveState(s);
  console.log(`${args.gate} overridden: ${args.reason}`);
}

try {
  const args = parseArgs(process.argv.slice(2));
  const run = { init, status, check, approve, override }[args.command];
  if (!run) throw usage('Usage: flow.mjs init|status|check|approve|override (see the header of this file)');
  run(args);
} catch (err) {
  console.error(err.message);
  process.exitCode = err.code || 1;
}
