#!/usr/bin/env node
// Checks Markdown documentation for the deterministic tells in weave-docs.
// Code blocks, inline code, and HTML comments are skipped. Exit code 1 when
// any error is found, so it can run in CI or a pre-commit hook.
//
//   node lint-docs.mjs <file-or-dir>... [--sapaan kamu|anda]

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const STOCK = [
  /\bcertainly!/i, /\bgreat question\b/i, /\bi hope this helps\b/i, /\bas of my last (?:update|knowledge)\b/i,
  /\bthis guide will walk you through\b/i, /\bin this (?:guide|tutorial|article),? (?:we|you) will\b/i,
  /\blet'?s dive in\b/i, /\bin today'?s fast-paced\b/i, /\bit'?s worth noting that\b/i, /^\s*in summary\b/i,
  /\bdalam panduan ini,? (?:kita|kami|kamu|anda) akan\b/i, /\bmari kita (?:mulai|selami|bahas)\b/i,
  /\bperlu diingat bahwa\b/i, /\bsemoga bermanfaat\b/i, /^\s*kesimpulannya\b/i,
  /\badapun langkah-langkahnya adalah sebagai berikut\b/i,
];
const HEDGES = [/\bmay potentially\b/i, /\bmight possibly\b/i, /\bcould potentially\b/i, /\bmungkin saja bisa\b/i, /\bbiasanya umumnya\b/i, /\bbisa jadi mungkin\b/i];
const VAGUE_LINK = /\[(?:click here|here|this link|link|klik di sini|di sini|sini|tautan ini|link ini)\]\(/i;
const PREANNOUNCE = /\b(?:coming soon|stay tuned|segera hadir)\b/i;
const BADGE = /!\[[^\]]*\]\([^)]*(?:shields\.io|badge)[^)]*\)/gi;

function parseArgs(argv) {
  const args = { paths: [], sapaan: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--sapaan') args.sapaan = (argv[++i] || '').toLowerCase();
    else if (argv[i] === '-h' || argv[i] === '--help') args.help = true;
    else args.paths.push(argv[i]);
  }
  return args;
}

function collect(p, out = []) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) {
      if (['node_modules', '.git', 'vendor'].includes(name)) continue;
      collect(path.join(p, name), out);
    }
  } else if (/\.(md|markdown|mdx)$/i.test(p)) out.push(p);
  return out;
}

// Prose lines with their numbers: fenced code, HTML comments, and inline code removed.
function proseLines(text) {
  const out = [];
  const fences = [];
  let fence = null;
  let comment = false;
  text.split('\n').forEach((raw, i) => {
    const line = raw.replace(/\r$/, '');
    const f = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (f) {
      if (!fence) {
        fence = f[1];
        fences.push({ line: i + 1, lang: f[2].trim() });
        return;
      }
      if (f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) {
        fence = null;
        return;
      }
    }
    if (fence) return;
    let l = line;
    if (comment) {
      if (!l.includes('-->')) return;
      l = l.slice(l.indexOf('-->') + 3);
      comment = false;
    }
    l = l.replace(/<!--[\s\S]*?-->/g, '');
    if (l.includes('<!--')) {
      l = l.slice(0, l.indexOf('<!--'));
      comment = true;
    }
    out.push({ n: i + 1, text: l.replace(/`[^`]*`/g, '') });
  });
  return { lines: out, fences };
}

function lint(file, sapaan) {
  const issues = [];
  const add = (n, level, rule, msg) => issues.push({ n, level, rule, msg });
  const { lines, fences } = proseLines(readFileSync(file, 'utf8'));

  for (const f of fences) if (!f.lang) add(f.line, 'warning', 'fence-language', 'code fence has no language; tag it so samples can be linted and run (R-44)');

  let anda = 0;
  let kamu = 0;
  let silakan = 0;
  let badges = 0;
  for (const { n, text } of lines) {
    if (text.includes('—')) add(n, 'error', 'em-dash', 'em dash; use a comma, colon, period, or parentheses (R-02)');
    for (const re of STOCK) if (re.test(text)) add(n, 'warning', 'stock-phrase', `stock phrase "${text.match(re)[0].trim()}"; start with the content (R-36)`);
    for (const re of HEDGES) if (re.test(text)) add(n, 'warning', 'hedge-stack', `stacked hedge "${text.match(re)[0]}"; state one claim with one condition (R-31)`);
    if (VAGUE_LINK.test(text)) add(n, 'warning', 'vague-link', 'vague link text; link the name of the destination (R-31)');
    if (PREANNOUNCE.test(text)) add(n, 'warning', 'pre-announcement', `"${text.match(PREANNOUNCE)[0]}"; document what exists, track plans in issues (C-5)`);
    const a = text.match(/\bAnda\b/g)?.length || 0;
    const k = text.match(/\b[Kk]amu\b/g)?.length || 0;
    anda += a;
    kamu += k;
    if (sapaan === 'kamu' && a) add(n, 'error', 'sapaan', 'this project uses "kamu", not "Anda"');
    if (sapaan === 'anda' && k) add(n, 'error', 'sapaan', 'this project uses "Anda", not "kamu"');
    silakan += text.match(/\b[Ss]ilakan\b/g)?.length || 0;
    badges += text.match(BADGE)?.length || 0;
  }
  if (!sapaan && anda && kamu) add(1, 'warning', 'sapaan', `mixes "Anda" (${anda}) and "kamu" (${kamu}); pick one per document`);
  if (silakan > 1) add(1, 'warning', 'silakan', `"silakan" appears ${silakan} times; write the instruction directly ("Klik Simpan.")`);
  if (badges > 5) add(1, 'warning', 'badge-wall', `${badges} badges; keep only those showing live status (R-05)`);

  // Empty sections: a heading followed only by blank lines before the next
  // heading of the same or higher level, or the end of the file.
  const headings = lines.map((l, i) => ({ ...l, i, m: l.text.match(/^(#{1,6})\s+\S/) })).filter((h) => h.m);
  headings.forEach((h, idx) => {
    const level = h.m[1].length;
    const next = headings.slice(idx + 1).find((x) => x.m[1].length <= level);
    const sub = headings[idx + 1];
    const end = next ? next.i : lines.length;
    const firstChild = sub && sub.m[1].length > level ? sub.i : end;
    const body = lines.slice(h.i + 1, firstChild).map((l) => l.text.trim()).filter(Boolean);
    const hasChildren = sub && sub.m[1].length > level && sub.i < end;
    const fencedInside = fences.some((f) => f.line > h.n && f.line < (lines[end]?.n ?? Infinity));
    if (!body.length && !hasChildren && !fencedInside) add(h.n, 'warning', 'empty-section', `"${h.text.trim()}" has no content; fill it or delete it (C-3)`);
  });
  return issues.sort((a, b) => a.n - b.n);
}

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.paths.length || (args.sapaan && !['kamu', 'anda'].includes(args.sapaan))) {
  console.log('Usage: node lint-docs.mjs <file-or-dir>... [--sapaan kamu|anda]');
  process.exit(args.help ? 0 : 2);
}
let errors = 0;
let warnings = 0;
const files = args.paths.flatMap((p) => collect(p));
for (const file of files) {
  for (const i of lint(file, args.sapaan)) {
    console.log(`${file}:${i.n}  ${i.level.padEnd(7)} ${i.rule.padEnd(16)} ${i.msg}`);
    if (i.level === 'error') errors++;
    else warnings++;
  }
}
console.log(`\n${files.length} file(s), ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
