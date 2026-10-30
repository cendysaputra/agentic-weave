#!/usr/bin/env node
// Design tokens in the W3C DTCG format (Design Tokens Format Module 2025.10).
//
// 1. Draft tokens from a crawl report, for studying a reference:
//      node build-tokens.mjs --from-report reference-crawl/<host>/report.json [--out reference.tokens.json]
//    Every token it writes is the reference's decision, marked as such. Project
//    tokens are decided from the project's concept (antiai-ui, R-40), not copied.
//
// 2. Generate CSS from the project's own tokens file:
//      node build-tokens.mjs .antiai/tokens.tokens.json --to tailwind [--out src/tokens.css] [--keep-defaults]
//      node build-tokens.mjs .antiai/tokens.tokens.json --to css
//    "tailwind" writes a Tailwind CSS v4 @theme block that first resets the
//    default color, font, radius, and shadow scales, so utilities like
//    bg-indigo-500 or rounded-2xl no longer exist. "css" writes :root variables.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SCHEMA = 'https://www.designtokens.org/schemas/2025.10/format.json';
const FONT_WEIGHTS = {
  thin: 100, hairline: 100, 'extra-light': 200, 'ultra-light': 200, light: 300, normal: 400, regular: 400, book: 400,
  medium: 500, 'semi-bold': 600, 'demi-bold': 600, bold: 700, 'extra-bold': 800, 'ultra-bold': 800, black: 900,
  heavy: 900, 'extra-black': 950, 'ultra-black': 950,
};
const CSS_COLOR_FN = new Set(['srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020', 'xyz-d50', 'xyz-d65']);

function parseArgs(argv) {
  const args = { input: null, report: null, to: null, out: null, keepDefaults: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--from-report') args.report = argv[++i];
    else if (a === '--to') args.to = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--keep-defaults') args.keepDefaults = true;
    else if (a === '-h' || a === '--help') args.help = true;
    else args.input = a;
  }
  return args;
}

const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;

// sRGB hex to OKLCH (Bjorn Ottosson's OKLab matrices). Hue is "none" for greys.
function hexToOklch(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = lin;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return [round(L, 4), round(C, 4), C < 0.0005 ? 'none' : round(H, 2)];
}

const colorToken = (hex, description) => ({
  $value: { colorSpace: 'oklch', components: hexToOklch(hex), hex },
  ...(description ? { $description: description } : {}),
});
const px = (v) => ({ value: round(parseFloat(v), 3), unit: 'px' });

// Merge per-page shares into one list, ordered by average share.
function mergeShares(pages, pick) {
  const total = new Map();
  for (const p of pages) for (const { value, share } of pick(p) || []) total.set(value, (total.get(value) || 0) + share);
  return [...total].map(([value, sum]) => ({ value, share: round(sum / pages.length, 1) })).sort((a, b) => b.share - a.share);
}

function tokensFromReport(report) {
  const pages = report.pages;
  const tokens = {
    $schema: SCHEMA,
    $description: `Measured from ${report.origin} by crawl-reference.mjs (${report.crawledAt}). These are the reference's decisions, kept for study. Decide project tokens from the project's concept (antiai-ui, R-40).`,
    $extensions: { 'dev.agentic-weave': { source: 'reference', origin: report.origin } },
    color: { $type: 'color', background: {}, text: {} },
    font: { family: { $type: 'fontFamily' }, size: { $type: 'dimension' }, weight: { $type: 'fontWeight' }, 'line-height': { $type: 'number' } },
    radius: { $type: 'dimension' },
  };
  mergeShares(pages, (p) => p.color.palette).slice(0, 6)
    .forEach((c, i) => { tokens.color.background[i + 1] = colorToken(c.value, `${c.share}% of background area`); });
  mergeShares(pages, (p) => p.color.ink).slice(0, 4)
    .forEach((c, i) => { tokens.color.text[i + 1] = colorToken(c.value, `${c.share}% of text`); });
  mergeShares(pages, (p) => p.typography.families).slice(0, 3)
    .forEach((f, i) => { tokens.font.family[i + 1] = { $value: f.value, $description: `${f.share}% of text` }; });
  const byTag = pages[0].typography.byTag;
  for (const [tag, t] of Object.entries(byTag)) {
    const size = parseFloat(t.size);
    if (!size) continue;
    tokens.font.size[tag] = { $value: px(t.size) };
    const w = Number(t.weight);
    if (w >= 1 && w <= 1000) tokens.font.weight[tag] = { $value: w };
    const lh = parseFloat(t.lineHeight);
    if (lh) tokens.font['line-height'][tag] = { $value: round(lh / size, 3) };
  }
  mergeShares(pages, (p) => p.components.radii).filter((r) => parseFloat(r.value) < 9999).slice(0, 4)
    .forEach((r, i) => { tokens.radius[i + 1] = { $value: px(r.value), $description: `${r.share}% of rounded elements` }; });
  return tokens;
}

// Walk a DTCG file: yields { path, type, value } for every token, with group
// $type inheritance and {alias} references resolved.
function flatten(doc) {
  const raw = new Map();
  const walk = (node, at, type) => {
    const t = node.$type || type;
    if ('$value' in node) {
      raw.set(at.join('.'), { path: at, type: t, value: node.$value });
      return;
    }
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$') && v && typeof v === 'object') walk(v, [...at, k], t);
  };
  walk(doc, [], undefined);
  const resolve = (value, seen = new Set()) => {
    if (typeof value === 'string' && /^\{[^{}]+\}$/.test(value)) {
      const ref = value.slice(1, -1);
      if (seen.has(ref)) throw new Error(`Alias cycle at {${ref}}`);
      const target = raw.get(ref);
      if (!target) throw new Error(`Alias {${ref}} points at no token`);
      return resolve(target.value, new Set([...seen, ref]));
    }
    if (Array.isArray(value)) return value.map((v) => resolve(v, seen));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, seen)]));
    return value;
  };
  return [...raw.values()].map((t) => {
    let type = t.type;
    if (!type && typeof t.value === 'string' && /^\{[^{}]+\}$/.test(t.value)) type = raw.get(t.value.slice(1, -1))?.type;
    if (!type) throw new Error(`Token ${t.path.join('.')} has no $type (set it on the token or a parent group)`);
    return { ...t, type, value: resolve(t.value) };
  });
}

function cssValue(type, v) {
  switch (type) {
    case 'color': {
      const comps = v.components.map((x) => (x === 'none' ? 'none' : x));
      const alpha = v.alpha !== undefined && v.alpha !== 1 ? ` / ${v.alpha}` : '';
      if (CSS_COLOR_FN.has(v.colorSpace)) return `color(${v.colorSpace} ${comps.join(' ')}${alpha})`;
      if (v.colorSpace === 'hsl' || v.colorSpace === 'hwb') {
        const [h, a, b] = comps;
        return `${v.colorSpace}(${h} ${a === 'none' ? a : `${a}%`} ${b === 'none' ? b : `${b}%`}${alpha})`;
      }
      return `${v.colorSpace}(${comps.join(' ')}${alpha})`;
    }
    case 'dimension':
    case 'duration':
      return `${v.value}${v.unit}`;
    case 'fontFamily':
      return (Array.isArray(v) ? v : [v]).map((f) => (/^[a-z-]+$/.test(f) ? f : `"${f}"`)).join(', ');
    case 'fontWeight':
      return String(typeof v === 'number' ? v : FONT_WEIGHTS[v]);
    case 'cubicBezier':
      return `cubic-bezier(${v.join(', ')})`;
    case 'number':
      return String(v);
    case 'shadow':
      return (Array.isArray(v) ? v : [v])
        .map((s) => `${s.inset ? 'inset ' : ''}${cssValue('dimension', s.offsetX)} ${cssValue('dimension', s.offsetY)} ${cssValue('dimension', s.blur)} ${cssValue('dimension', s.spread)} ${cssValue('color', s.color)}`)
        .join(', ');
    default:
      return null;
  }
}

const slug = (parts) => parts.join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const strip = (parts, prefixes) => {
  let rest = parts;
  while (rest.length > 1 && prefixes.includes(rest[0].toLowerCase())) rest = rest.slice(1);
  return rest;
};

// Tailwind v4 theme namespaces (tailwindcss.com/docs/theme). Anything else
// becomes a plain :root variable.
function tailwindName({ path: p, type }) {
  const first = p[0].toLowerCase();
  if (type === 'color') return `--color-${slug(strip(p, ['color', 'colors']))}`;
  if (type === 'fontFamily') return `--font-${slug(strip(p, ['font', 'fonts', 'family', 'fontfamily']))}`;
  if (type === 'shadow') return `--shadow-${slug(strip(p, ['shadow', 'shadows']))}`;
  if (type === 'cubicBezier') return `--ease-${slug(strip(p, ['ease', 'easing']))}`;
  if (type === 'dimension') {
    if (['radius', 'radii'].includes(first)) return `--radius-${slug(strip(p, ['radius', 'radii']))}`;
    if (first === 'spacing') return p.length === 1 ? '--spacing' : `--spacing-${slug(p.slice(1))}`;
    if (first === 'breakpoint' || first === 'breakpoints') return `--breakpoint-${slug(p.slice(1))}`;
    if (first === 'text' || (first === 'font' && p[1]?.toLowerCase() === 'size')) return `--text-${slug(strip(p, ['text', 'font', 'size']))}`;
  }
  return null;
}

function render(tokens, to, keepDefaults, source) {
  const theme = [];
  const root = [];
  const skipped = [];
  for (const t of tokens) {
    const value = cssValue(t.type, t.value);
    if (value === null) {
      skipped.push(`${t.path.join('.')} (${t.type})`);
      continue;
    }
    const twName = to === 'tailwind' ? tailwindName(t) : null;
    (twName ? theme : root).push(`  ${twName || `--${slug(t.path)}`}: ${value};`);
  }
  const head = `/* Generated by build-tokens.mjs from ${source}. Edit the tokens file, not this file. */\n`;
  let css = head;
  if (to === 'tailwind') {
    const resets = keepDefaults ? [] : [
      '  /* Remove Tailwind defaults so only project tokens exist (no bg-indigo-500, rounded-2xl, shadow-lg). */',
      '  --color-*: initial;', '  --font-*: initial;', '  --radius-*: initial;', '  --shadow-*: initial;',
    ];
    css += `\n@theme {\n${[...resets, ...theme].join('\n')}\n}\n`;
  }
  if (root.length) css += `\n:root {\n${root.join('\n')}\n}\n`;
  return { css, skipped };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.report && !(args.input && args.to))) {
    console.log('Usage:\n  node build-tokens.mjs --from-report <report.json> [--out reference.tokens.json]\n  node build-tokens.mjs <tokens.json> --to tailwind|css [--out file.css] [--keep-defaults]');
    process.exit(args.help ? 0 : 1);
  }
  if (args.report) {
    const report = JSON.parse(await readFile(args.report, 'utf8'));
    const out = args.out || path.join(path.dirname(args.report), 'reference.tokens.json');
    await writeFile(out, JSON.stringify(tokensFromReport(report), null, 2) + '\n');
    console.log(`Reference tokens (study only): ${out}`);
    return;
  }
  if (!['tailwind', 'css'].includes(args.to)) throw new Error('--to must be tailwind or css');
  const doc = JSON.parse(await readFile(args.input, 'utf8'));
  if (doc.$extensions?.['dev.agentic-weave']?.source === 'reference') {
    console.warn('Warning: this file holds a reference site\'s tokens. Build from the project\'s own tokens (R-40, R-43).');
  }
  const { css, skipped } = render(flatten(doc), args.to, args.keepDefaults, path.basename(args.input));
  if (args.out) {
    await writeFile(args.out, css);
    console.log(`Wrote ${args.out}`);
  } else process.stdout.write(css);
  if (skipped.length) console.warn(`Skipped (no CSS mapping): ${skipped.join(', ')}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
