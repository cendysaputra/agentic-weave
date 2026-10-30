#!/usr/bin/env node
// ATM steps 2 and 3: score a rebuild against the Amati snapshot.
//
//   --mode tiru        How close is the rebuild? Visual similarity per viewport,
//                      diff images, and page-height drift. Iterate until close.
//   --mode modifikasi  Is it now your own site? Fails (exit 2) while the build
//                      still reuses the original's text, images, fonts, media,
//                      stylesheets, brand name, or remote assets, or still looks
//                      nearly identical.
//
// Usage:
//   node compare-build.mjs --original atm/<host>/<page> --build <file.html|dir|http-url>
//                          [--mode tiru|modifikasi] [--max-similarity 0.9] [--max-text-reuse 0.05]

import { createHash } from 'node:crypto';
import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DESKTOP, MOBILE, loadChromium } from './lib.mjs';

const FULL_PAGE_CAP = 6000;
const CHECKED_TYPES = new Set(['image', 'font', 'media', 'stylesheet']);

function parseArgs(argv) {
  const args = { mode: 'tiru', maxSimilarity: 0.9, warnSimilarity: 0.75, maxTextReuse: 0.05 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--original') args.original = argv[++i];
    else if (a === '--build') args.build = argv[++i];
    else if (a === '--mode') args.mode = argv[++i];
    else if (a === '--max-similarity') args.maxSimilarity = parseFloat(argv[++i]);
    else if (a === '--max-text-reuse') args.maxTextReuse = parseFloat(argv[++i]);
    else if (a === '-h' || a === '--help') args.help = true;
  }
  return args;
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

async function resolveBuild(build) {
  if (/^https?:\/\//.test(build)) return { url: build, dir: null };
  const abs = path.resolve(build);
  const s = await stat(abs);
  const file = s.isDirectory() ? path.join(abs, 'index.html') : abs;
  return { url: pathToFileURL(file).toString(), dir: path.dirname(file) };
}

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

async function capture(browser, url, viewport, mobile, collect) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  const requests = [];
  const pending = [];
  if (collect) {
    page.on('response', (res) => pending.push((async () => {
      const type = res.request().resourceType();
      const entry = { url: res.url(), type };
      if (CHECKED_TYPES.has(type) && res.status() === 200) {
        try { entry.sha256 = sha256(await res.body()); } catch {}
      }
      requests.push(entry);
    })()));
  }
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const fold = await page.screenshot();
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const full = await page.screenshot({ clip: { x: 0, y: 0, width: viewport.width, height: Math.min(height, FULL_PAGE_CAP) }, fullPage: true });
  const info = collect ? await page.evaluate(() => {
    const family = (sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim() : null;
    };
    return { text: document.body.innerText, title: document.title, fonts: [family('body'), family('h1'), family('h2')].filter(Boolean) };
  }) : null;
  await Promise.all(pending);
  await context.close();
  return { fold, full, height, requests, info };
}

// Pixel and block (layout) similarity, computed in a blank page with canvas.
async function diff(browser, a, b) {
  const page = await browser.newPage();
  const result = await page.evaluate(async ([a64, b64]) => {
    const load = async (b) => createImageBitmap(await (await fetch(`data:image/png;base64,${b}`)).blob());
    const [ia, ib] = await Promise.all([load(a64), load(b64)]);
    const w = Math.min(ia.width, ib.width);
    const h = Math.min(ia.height, ib.height);
    const read = (img) => {
      const c = new OffscreenCanvas(w, h);
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, w, h).data;
    };
    const da = read(ia), db = read(ib);
    const out = new OffscreenCanvas(w, h);
    const ox = out.getContext('2d');
    const od = ox.createImageData(w, h);
    let same = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      const gray = (da[i] + da[i + 1] + da[i + 2]) / 3;
      if (d <= 24) {
        same++;
        od.data[i] = od.data[i + 1] = od.data[i + 2] = 255 - (255 - gray) * 0.25;
      } else {
        od.data[i] = 230; od.data[i + 1] = 30; od.data[i + 2] = 60;
      }
      od.data[i + 3] = 255;
    }
    ox.putImageData(od, 0, 0);
    // Layout similarity: compare mean luminance of 16px blocks, so small
    // anti-aliasing or font differences do not dominate.
    const B = 16;
    let blocks = 0, close = 0;
    for (let by = 0; by + B <= h; by += B) {
      for (let bx = 0; bx + B <= w; bx += B) {
        let la = 0, lb = 0;
        for (let y = by; y < by + B; y += 2) {
          for (let x = bx; x < bx + B; x += 2) {
            const i = (y * w + x) * 4;
            la += 0.2126 * da[i] + 0.7152 * da[i + 1] + 0.0722 * da[i + 2];
            lb += 0.2126 * db[i] + 0.7152 * db[i + 1] + 0.0722 * db[i + 2];
          }
        }
        blocks++;
        if (Math.abs(la - lb) / ((B / 2) ** 2) <= 20) close++;
      }
    }
    const blob = await out.convertToBlob({ type: 'image/png' });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { pixel: same / (w * h), layout: blocks ? close / blocks : 0, comparedHeight: h, png: btoa(bin) };
  }, [a.toString('base64'), b.toString('base64')]);
  await page.close();
  return { ...result, png: Buffer.from(result.png, 'base64') };
}

// Phrases of 20+ characters from the original that reappear in the build.
function textReuse(originalText, buildText) {
  const phrases = [...new Set(originalText.split(/[\n.!?]+/).map(norm).filter((s) => s.length >= 20))];
  const hay = norm(buildText);
  const reused = phrases.filter((p) => hay.includes(p));
  return { ratio: phrases.length ? reused.length / phrases.length : 0, total: phrases.length, reused };
}

function brandTerms(title, host) {
  const parts = (title || '').split(/\s[|–—·:-]\s|\s\|\s/).map((s) => s.trim()).filter((s) => s.length >= 3);
  const label = host.replace(/^www\./, '').split('.')[0];
  return [...new Set([...parts, label.length >= 4 ? label : null].filter(Boolean))];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.original || !args.build || !['tiru', 'modifikasi'].includes(args.mode)) {
    console.log('Usage: node compare-build.mjs --original atm/<host>/<page> --build <file|dir|url> [--mode tiru|modifikasi]');
    process.exit(args.help ? 0 : 1);
  }
  const root = path.resolve(args.original);
  const manifest = JSON.parse(await readFile(path.join(root, 'original', 'manifest.json'), 'utf8'));
  const originalUrl = pathToFileURL(path.join(root, 'original', 'index.html')).toString();
  const build = await resolveBuild(args.build);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = path.join(root, 'compare', `${args.mode}-${stamp}`);
  await mkdir(outDir, { recursive: true });

  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const views = [['desktop', DESKTOP, false], ['mobile', MOBILE, true]];
  const visual = {};
  let buildInfo = null;
  let buildRequests = [];
  let originalInfo = null;
  for (const [name, vp, mobile] of views) {
    const o = await capture(browser, originalUrl, vp, mobile, name === 'desktop');
    const b = await capture(browser, build.url, vp, mobile, name === 'desktop');
    if (name === 'desktop') {
      originalInfo = o.info;
      buildInfo = b.info;
      buildRequests = b.requests;
    }
    visual[name] = { originalHeight: o.height, buildHeight: b.height };
    for (const part of ['fold', 'full']) {
      const d = await diff(browser, o[part], b[part]);
      await writeFile(path.join(outDir, `build-${name}-${part}.png`), b[part]);
      await writeFile(path.join(outDir, `diff-${name}-${part}.png`), d.png);
      visual[name][part] = { pixel: +d.pixel.toFixed(3), layout: +d.layout.toFixed(3), comparedHeight: d.comparedHeight };
    }
  }
  await browser.close();

  // Originality checks.
  const originalHashes = new Map(manifest.assets.filter((a) => CHECKED_TYPES.has(a.type))
    .flatMap((a) => [[a.sha256, a], [a.localSha256 || a.sha256, a]]));
  const reusedAssets = new Map();
  for (const r of buildRequests) if (r.sha256 && originalHashes.has(r.sha256)) reusedAssets.set(r.sha256, { build: r.url, original: originalHashes.get(r.sha256).url });
  if (build.dir) {
    for (const file of await walk(build.dir)) {
      const h = sha256(await readFile(file));
      if (originalHashes.has(h) && !reusedAssets.has(h)) reusedAssets.set(h, { build: path.relative(build.dir, file), original: originalHashes.get(h).url });
    }
  }
  const sourceHost = new URL(manifest.source).host;
  const remote = [...new Set(buildRequests.filter((r) => { try { return new URL(r.url).host === sourceHost; } catch { return false; } }).map((r) => r.url))];
  const text = textReuse(originalInfo.text, buildInfo.text);
  const brands = brandTerms(manifest.title, sourceHost).filter((t) => norm(buildInfo.text + ' ' + buildInfo.title).includes(norm(t)));
  const sameFonts = [...new Set(buildInfo.fonts)].filter((f) => originalInfo.fonts.includes(f) && !/^(serif|sans-serif|system-ui|arial|helvetica|times new roman)$/i.test(f));
  const layoutScore = visual.desktop.fold.layout;

  const failures = [];
  const warnings = [];
  if (args.mode === 'modifikasi') {
    if (text.ratio > args.maxTextReuse) failures.push(`Text reuse ${(text.ratio * 100).toFixed(1)}% of original phrases (limit ${(args.maxTextReuse * 100).toFixed(0)}%). Write your own copy.`);
    if (reusedAssets.size) failures.push(`${reusedAssets.size} asset(s) are byte-identical to the original (images, fonts, media, or stylesheets). Replace them.`);
    if (remote.length) failures.push(`${remote.length} request(s) still load from ${sourceHost}.`);
    if (brands.length) failures.push(`Original brand text still present: ${brands.join(', ')}.`);
    if (layoutScore >= args.maxSimilarity) failures.push(`Desktop fold layout similarity ${(layoutScore * 100).toFixed(0)}% (limit ${(args.maxSimilarity * 100).toFixed(0)}%). It is still the original page; change the composition.`);
    else if (layoutScore >= args.warnSimilarity) warnings.push(`Desktop fold layout similarity ${(layoutScore * 100).toFixed(0)}%. It still reads close to the original; push the composition further from it.`);
    if (sameFonts.length) warnings.push(`Same font family as the original: ${sameFonts.join(', ')}. Check the license or choose another face.`);
  }

  const report = { mode: args.mode, original: manifest.source, build: build.url, visual, originality: {
    textReuse: { ratio: +text.ratio.toFixed(3), phrases: text.total, examples: text.reused.slice(0, 10) },
    reusedAssets: [...reusedAssets.values()], remoteRequests: remote, brandTerms: brands, sameFonts,
  }, failures, warnings };
  await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

  const pct = (n) => `${(n * 100).toFixed(1)}%`;
  const L = [`# ${args.mode === 'tiru' ? 'Tiru' : 'Modifikasi'} report`, '', `Original: ${manifest.source}`, `Build: ${build.url}`, ''];
  L.push('## Visual similarity', '', '| View | Layout | Pixel | Height (original / build) |', '| --- | --- | --- | --- |');
  for (const [name] of views) {
    for (const part of ['fold', 'full']) {
      const v = visual[name][part];
      L.push(`| ${name} ${part} | ${pct(v.layout)} | ${pct(v.pixel)} | ${part === 'full' ? `${visual[name].originalHeight} / ${visual[name].buildHeight}px` : '-'} |`);
    }
  }
  L.push('', 'Layout compares 16px blocks (composition); pixel compares exact rendering. Red in `diff-*.png` marks where the build differs.', '');
  L.push('## Originality', '');
  L.push(`- Text reuse: ${pct(text.ratio)} of ${text.total} original phrases.`);
  L.push(`- Byte-identical assets: ${reusedAssets.size}.`);
  L.push(`- Requests to ${sourceHost}: ${remote.length}.`);
  L.push(`- Brand terms found: ${brands.join(', ') || 'none'}.`);
  L.push(`- Same font families: ${sameFonts.join(', ') || 'none'}.`, '');
  if (args.mode === 'tiru') {
    L.push('## Next', '', layoutScore >= 0.9
      ? 'The rebuild matches the original closely. Move to Modifikasi.'
      : 'Keep iterating: fix the red regions in `diff-desktop-fold.png` first, then mobile.', '');
  } else {
    L.push('## Verdict', '', failures.length ? '**FAIL**: not shippable yet.' : '**PASS**: no reused text, assets, or brand found.', '');
    L.push(...failures.map((f) => `- ${f}`), ...warnings.map((w) => `- Warning: ${w}`), '');
  }
  await writeFile(path.join(outDir, 'report.md'), L.join('\n'));

  console.log(`Desktop fold: layout ${pct(visual.desktop.fold.layout)}, pixel ${pct(visual.desktop.fold.pixel)}. Mobile fold: layout ${pct(visual.mobile.fold.layout)}.`);
  if (args.mode === 'modifikasi') {
    for (const f of failures) console.log(`FAIL ${f}`);
    for (const w of warnings) console.log(`WARN ${w}`);
    console.log(failures.length ? 'Modifikasi gate: FAIL' : 'Modifikasi gate: PASS');
  }
  console.log(`Report: ${path.join(outDir, 'report.md')}`);
  if (args.mode === 'modifikasi' && failures.length) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
