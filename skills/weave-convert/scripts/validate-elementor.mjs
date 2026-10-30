#!/usr/bin/env node
// Validates an Elementor template JSON before it is imported with
// `wp elementor library import`. Elementor has not published an API for
// creating V4 atomic elements, so an agent may only reuse element types,
// widget types, and setting keys that appear in a template exported from a
// real site. Pass that export with --sample to enforce it.
//
//   node validate-elementor.mjs template.json [--sample sample-export.json]

import { readFileSync } from 'node:fs';

// Documented in developers.elementor.com (data structure, checked 2026-10-29).
const DOCUMENTED = new Set(['e-div-block', 'e-flexbox', 'e-grid', 'container', 'section', 'column', 'widget']);

function parseArgs(argv) {
  const args = { file: null, sample: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--sample') args.sample = argv[++i];
    else if (argv[i] === '-h' || argv[i] === '--help') args.help = true;
    else args.file = argv[i];
  }
  return args;
}

const load = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`Cannot read ${file}: ${e.message}`);
    process.exit(2);
  }
};

const kind = (el) => (el.elType === 'widget' ? `widget:${el.widgetType}` : el.elType);
const keysOf = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v) : []);

function walk(elements, visit, at = 'content') {
  (elements || []).forEach((el, i) => {
    const here = `${at}[${i}]`;
    visit(el, here);
    walk(el.elements, visit, `${here}.elements`);
  });
}

// What a real export allows: element kinds and the setting keys seen on each.
function learn(sample) {
  const allowed = new Map();
  walk(sample.content, (el) => {
    const k = kind(el);
    if (!allowed.has(k)) allowed.set(k, new Set());
    for (const key of keysOf(el.settings)) allowed.get(k).add(key);
  });
  return allowed;
}

function validate(doc, allowed) {
  const errors = [];
  const warnings = [];
  for (const key of ['title', 'type', 'version']) if (typeof doc[key] !== 'string' || !doc[key]) errors.push(`top level: "${key}" must be a non-empty string`);
  if (!Array.isArray(doc.content)) errors.push('top level: "content" must be an array');
  if (!('page_settings' in doc)) warnings.push('top level: no "page_settings"');
  const ids = new Map();
  walk(doc.content, (el, at) => {
    if (typeof el.id !== 'string' || !/^[0-9a-f]{7,8}$/.test(el.id)) errors.push(`${at}: id "${el.id}" must be 7 or 8 lowercase hex characters`);
    else if (ids.has(el.id)) errors.push(`${at}: id "${el.id}" is already used at ${ids.get(el.id)}`);
    else ids.set(el.id, at);
    if (typeof el.elType !== 'string') return errors.push(`${at}: missing elType`);
    if (el.elType === 'widget' && typeof el.widgetType !== 'string') errors.push(`${at}: widget without widgetType`);
    if (el.elements !== undefined && !Array.isArray(el.elements)) errors.push(`${at}: "elements" must be an array`);
    const k = kind(el);
    if (allowed) {
      if (!allowed.has(k)) return errors.push(`${at}: ${k} does not appear in the sample export; export a page that uses it first`);
      for (const key of keysOf(el.settings)) {
        if (!allowed.get(k).has(key)) errors.push(`${at}: setting "${key}" on ${k} does not appear in the sample export`);
      }
    } else if (!DOCUMENTED.has(el.elType)) {
      errors.push(`${at}: elType "${el.elType}" is not documented; pass --sample with a real export that uses it`);
    }
  });
  if (!allowed) warnings.push('no --sample given: widget types and setting keys were not checked against a real export');
  return { errors, warnings, count: ids.size };
}

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.file) {
  console.log('Usage: node validate-elementor.mjs template.json [--sample sample-export.json]');
  process.exit(args.help ? 0 : 2);
}
const { errors, warnings, count } = validate(load(args.file), args.sample ? learn(load(args.sample)) : null);
for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`error ${e}`);
console.log(`${count} element(s), ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
