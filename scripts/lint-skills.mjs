#!/usr/bin/env node
// Checks every skills/<name>/SKILL.md against the Agent Skills specification
// (agentskills.io) and this repo's own rules. Exits 1 when any error is found.
//
//   node scripts/lint-skills.mjs        or        npm test

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = path.join(ROOT, 'skills');

// Spec limits, plus this repo's tighter description budget: Codex caps the
// whole skill catalog at about 8,000 characters, so long descriptions crowd
// out other skills.
const LIMITS = { name: 64, description: 1024, descriptionTarget: 350, bodyLines: 500, bodyTokens: 5000 };

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function parse(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: null, body: text, text };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z-]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
  }
  return { fm, body: text.slice(m[0].length), text };
}

// Em dashes are banned in authored text (R-02). Allowed: inside inline code,
// and in indented blockquotes, which hold "Before" examples of the tell itself.
function emDashLines(body) {
  const hits = [];
  let fenced = false;
  body.split('\n').forEach((line, i) => {
    if (/^\s*```/.test(line)) fenced = !fenced;
    if (fenced || /^\s+>/.test(line)) return;
    if (line.replace(/`[^`]*`/g, '').includes('—')) hits.push(i + 1);
  });
  return hits;
}

const skills = readdirSync(SKILLS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const parsed = new Map();

for (const dir of skills) {
  const rel = `skills/${dir}/SKILL.md`;
  const file = path.join(SKILLS, dir, 'SKILL.md');
  if (!existsSync(file)) {
    err(`skills/${dir}`, 'missing SKILL.md');
    continue;
  }
  const { fm, body } = parse(file);
  parsed.set(dir, { fm, body, rel });
  if (!fm) {
    err(rel, 'missing YAML frontmatter');
    continue;
  }

  const { name = '', description = '' } = fm;
  if (!name) err(rel, 'frontmatter has no name');
  else {
    if (name !== dir) err(rel, `name "${name}" does not match folder "${dir}"`);
    if (name.length > LIMITS.name) err(rel, `name is ${name.length} characters (max ${LIMITS.name})`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) err(rel, 'name must be lowercase letters, digits, and single hyphens');
  }
  if (!description) err(rel, 'frontmatter has no description');
  else if (description.length > LIMITS.description) err(rel, `description is ${description.length} characters (spec max ${LIMITS.description})`);
  else if (description.length > LIMITS.descriptionTarget) err(rel, `description is ${description.length} characters (repo target ${LIMITS.descriptionTarget})`);

  const lines = body.split('\n').length;
  if (lines > LIMITS.bodyLines) err(rel, `body is ${lines} lines (max ${LIMITS.bodyLines}); move detail into references/`);
  // About 3 characters per token for this mix of English, Indonesian, and markup.
  const tokens = Math.round(body.length / 3);
  if (tokens > LIMITS.bodyTokens) warn(rel, `body is about ${tokens} tokens (spec suggests under ${LIMITS.bodyTokens})`);

  const dashes = emDashLines(body);
  if (dashes.length) err(rel, `em dash on body line(s) ${dashes.join(', ')} (R-02)`);

  // Files the skill points at (scripts/, references/, assets/) must exist.
  for (const m of body.matchAll(/`((?:scripts|references|assets)\/[^`\s]+)`/g)) {
    if (/[<*]/.test(m[1])) continue;
    if (!existsSync(path.join(SKILLS, dir, m[1]))) err(rel, `refers to ${m[1]}, which does not exist`);
  }
}

// Cross-skill checks: every cited rule exists in weave-core, and every
// "Load with ..." dependency is a real skill.
const core = parsed.get('weave-core');
if (!core) err('skills/weave-core', 'weave-core is missing; every skill depends on it');
else {
  const defined = new Set([...core.body.matchAll(/^### ((?:R|C)-\d+)/gm)].map((m) => m[1]));
  for (const [dir, { body, rel }] of parsed) {
    if (dir === 'weave-core') continue;
    const cited = new Set(body.match(/\b(?:R|C)-\d+\b/g) || []);
    for (const id of cited) if (!defined.has(id)) err(rel, `cites ${id}, which weave-core does not define`);
  }
}
for (const [dir, { fm, rel }] of parsed) {
  if (dir === 'weave-core' || !fm?.description) continue;
  const loadWith = (fm.description.match(/Load with ([^.]+)\./) || [])[1];
  if (!loadWith) {
    warn(rel, 'description does not say "Load with weave-core."; the installer uses it to add dependencies');
    continue;
  }
  for (const dep of loadWith.match(/weave-[a-z-]+/g) || []) {
    if (!parsed.has(dep)) err(rel, `"Load with" names ${dep}, which is not a skill in this repo`);
  }
}

const catalog = [...parsed.values()].reduce((n, { fm }) => n + (fm?.name?.length || 0) + (fm?.description?.length || 0), 0);
for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`error ${e}`);
console.log(`\n${parsed.size} skills, catalog ${catalog} characters, ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
