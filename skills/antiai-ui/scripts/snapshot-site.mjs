#!/usr/bin/env node
// ATM step 1 (Amati): save a raw local copy of one page for study.
//
// Writes the full HTML with every asset it loaded (CSS, JS, images, fonts,
// media) rewritten to local files, plus screenshots, so the page opens offline
// and the Tiru step has an exact target to compare against.
//
//   atm/<host>/<page>/original/index.html        rendered DOM, scripts removed (stable static copy)
//   atm/<host>/<page>/original/index.live.html   server HTML with scripts kept (behavior, may break offline)
//   atm/<host>/<page>/original/assets/...        downloaded assets
//   atm/<host>/<page>/original/manifest.json     url -> local path, type, sha256
//   atm/<host>/<page>/screens/original-*.png     desktop and mobile screenshots
//
// The copy is third-party work: keep it local, out of git, and never deploy it.
//
// Usage:
//   node snapshot-site.mjs <url> [--out atm] [--max-mb 150] [--ignore-robots]

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DESKTOP, MOBILE, USER_AGENT, isDisallowed, loadChromium, loadRobots, normalizeUrl, safeName, scrollThrough,
} from './lib.mjs';

const TYPE_DIR = { stylesheet: 'css', script: 'js', image: 'img', font: 'fonts', media: 'media' };
const MAX_ASSET_BYTES = 50 * 1024 * 1024;

function parseArgs(argv) {
  const args = { out: 'atm', maxMb: 150, robots: true };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--max-mb') args.maxMb = Math.max(1, parseInt(argv[++i], 10) || 150);
    else if (a === '--ignore-robots') args.robots = false;
    else if (a === '-h' || a === '--help') args.help = true;
    else rest.push(a);
  }
  args.url = rest[0];
  return args;
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

function guessType(url, contentType = '') {
  if (/css/.test(contentType) || /\.css(\?|$)/i.test(url)) return 'stylesheet';
  if (/javascript|ecmascript/.test(contentType) || /\.m?js(\?|$)/i.test(url)) return 'script';
  if (/font/.test(contentType) || /\.(woff2?|ttf|otf|eot)(\?|$)/i.test(url)) return 'font';
  if (/^image\//.test(contentType) || /\.(png|jpe?g|gif|webp|avif|svg|ico)(\?|$)/i.test(url)) return 'image';
  if (/^(video|audio)\//.test(contentType) || /\.(mp4|webm|mov|mp3|ogg|wav)(\?|$)/i.test(url)) return 'media';
  return null;
}

function localName(url, type, hash) {
  const u = new URL(url);
  let base = safeName(decodeURIComponent(path.basename(u.pathname)) || 'index').slice(-60);
  const ext = { stylesheet: '.css', script: '.js' }[type];
  if (ext && !base.endsWith(ext)) base += ext;
  return `assets/${TYPE_DIR[type]}/${hash.slice(0, 10)}-${base}`;
}

// Replace url(...) and @import targets in CSS, relative to the CSS file's own URL.
function rewriteCss(css, cssUrl, map, fromPath) {
  const rel = (abs) => {
    const local = map.get(abs);
    if (!local) return null;
    return path.posix.relative(path.posix.dirname(fromPath), local) || path.posix.basename(local);
  };
  const resolve = (ref) => {
    try { return new URL(ref, cssUrl).toString(); } catch { return null; }
  };
  return css
    .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, ref) => {
      if (/^(data:|#)/.test(ref)) return m;
      const local = rel(resolve(ref));
      return local ? `url("${local}")` : m;
    })
    .replace(/@import\s+(['"])([^'"]+)\1/g, (m, q, ref) => {
      const local = rel(resolve(ref));
      return local ? `@import "${local}"` : m;
    });
}

const cssRefs = (css, cssUrl) => [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)]
  .map((m) => m[2]).filter((r) => !/^(data:|#)/.test(r))
  .map((r) => { try { return new URL(r, cssUrl).toString(); } catch { return null; } })
  .filter(Boolean);

// Runs in the page: point every asset attribute at its local copy.
function rewriteDom({ map, stripScripts }) {
  const swap = (v) => {
    try { return map[new URL(v, document.baseURI).toString()] || null; } catch { return null; }
  };
  const swapSrcset = (v) => v.split(',').map((part) => {
    const [u, ...d] = part.trim().split(/\s+/);
    return [swap(u) || u, ...d].join(' ');
  }).join(', ');
  const swapCss = (css) => css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, ref) => {
    const local = /^data:/.test(ref) ? null : swap(ref);
    return local ? `url("${local}")` : m;
  });

  for (const el of document.querySelectorAll('*')) {
    for (const attr of ['src', 'poster', 'data-src', 'data-bg', 'xlink:href']) {
      const v = el.getAttribute(attr);
      const local = v && swap(v);
      if (local) el.setAttribute(attr, local);
    }
    if (el.tagName === 'LINK' || el.tagName === 'use' || el.tagName === 'image') {
      const v = el.getAttribute('href');
      const local = v && swap(v);
      if (local) el.setAttribute('href', local);
    }
    for (const attr of ['srcset', 'data-srcset', 'imagesrcset']) {
      const v = el.getAttribute(attr);
      if (v) el.setAttribute(attr, swapSrcset(v));
    }
    if (el.tagName === 'A' && el.getAttribute('href') && !/^(#|mailto:|tel:|javascript:)/i.test(el.getAttribute('href'))) {
      try { el.setAttribute('href', new URL(el.getAttribute('href'), document.baseURI).toString()); } catch {}
    }
    const style = el.getAttribute('style');
    if (style && style.includes('url(')) el.setAttribute('style', swapCss(style));
    el.removeAttribute('integrity');
    el.removeAttribute('nonce');
  }
  for (const s of document.querySelectorAll('style')) s.textContent = swapCss(s.textContent);
  for (const m of document.querySelectorAll('meta[http-equiv="Content-Security-Policy" i], base')) m.remove();
  if (stripScripts) {
    for (const s of document.querySelectorAll('script, link[rel="modulepreload"], link[as="script"]')) s.remove();
  }
  const doctype = document.doctype ? `<!DOCTYPE ${document.doctype.name}>` : '<!DOCTYPE html>';
  return `${doctype}\n${document.documentElement.outerHTML}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.url) {
    console.log('Usage: node snapshot-site.mjs <url> [--out atm] [--max-mb 150] [--ignore-robots]');
    process.exit(args.help ? 0 : 1);
  }
  const start = normalizeUrl(args.url);
  const pageSlug = safeName(start.pathname.replace(/^\/|\/$/g, '') || 'home');
  const root = path.resolve(args.out, safeName(start.host), pageSlug);
  const dir = path.join(root, 'original');
  await mkdir(path.join(root, 'screens'), { recursive: true });
  await mkdir(dir, { recursive: true });

  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: DESKTOP, userAgent: USER_AGENT });

  if (args.robots) {
    const rules = await loadRobots(context, start.origin);
    if (isDisallowed(start.toString(), rules)) {
      console.error(`robots.txt disallows ${start.pathname}. Use --ignore-robots only for a site you own.`);
      await browser.close();
      process.exit(1);
    }
  }

  const assets = new Map(); // absolute url -> { type, body, contentType }
  let totalBytes = 0;
  const skipped = [];
  const keep = (url, type, body, contentType) => {
    if (assets.has(url) || !type) return;
    if (body.length > MAX_ASSET_BYTES || totalBytes + body.length > args.maxMb * 1024 * 1024) {
      skipped.push(url);
      return;
    }
    totalBytes += body.length;
    assets.set(url, { type, body, contentType });
  };

  const page = await context.newPage();
  let serverHtml = null;
  const pending = [];
  page.on('response', (res) => {
    pending.push((async () => {
      const req = res.request();
      const url = res.url();
      if (!/^https?:/.test(url) || res.status() !== 200) return;
      try {
        const body = await res.body();
        if (req.resourceType() === 'document' && req.frame() === page.mainFrame() && !serverHtml) {
          serverHtml = body.toString('utf8');
          return;
        }
        const ct = res.headers()['content-type'] || '';
        keep(url, TYPE_DIR[req.resourceType()] ? req.resourceType() : guessType(url, ct), body, ct);
      } catch {}
    })());
  });

  console.log(`Amati: ${start}`);
  await page.goto(start.toString(), { waitUntil: 'load', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.screenshot({ path: path.join(root, 'screens', 'original-desktop-fold.png') });
  await scrollThrough(page);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(root, 'screens', 'original-desktop-full.png'), fullPage: true }).catch(() => {});
  await Promise.all(pending);

  // Fetch CSS references the browser did not need at this viewport (other breakpoints, hover states).
  for (const [url, a] of [...assets]) {
    if (a.type !== 'stylesheet') continue;
    for (const ref of cssRefs(a.body.toString('utf8'), url).slice(0, 200)) {
      if (assets.has(ref) || !/^https?:/.test(ref)) continue;
      try {
        const res = await context.request.get(ref, { timeout: 15000 });
        if (res.ok()) keep(ref, guessType(ref, res.headers()['content-type']), await res.body(), res.headers()['content-type']);
      } catch {}
    }
  }

  // Assign local paths, then rewrite CSS so its url() refs point at local files.
  const map = new Map();
  const manifest = [];
  for (const [url, a] of assets) {
    a.hash = sha256(a.body);
    a.local = localName(url, a.type, a.hash);
    map.set(url, a.local);
  }
  for (const [url, a] of assets) {
    let out = a.body;
    if (a.type === 'stylesheet') out = Buffer.from(rewriteCss(a.body.toString('utf8'), url, map, a.local));
    await mkdir(path.join(dir, path.dirname(a.local)), { recursive: true });
    await writeFile(path.join(dir, a.local), out);
    // localSha256 catches a build that copies the rewritten local file itself.
    manifest.push({ url, local: a.local, type: a.type, bytes: a.body.length, sha256: a.hash, localSha256: sha256(out) });
  }

  const mapObj = Object.fromEntries(map);
  const staticHtml = await page.evaluate(rewriteDom, { map: mapObj, stripScripts: true });
  await writeFile(path.join(dir, 'index.html'), staticHtml);

  if (serverHtml) {
    // Parse the server HTML without running it, so the rewrite sees the original markup.
    const lctx = await browser.newContext({ javaScriptEnabled: false });
    const live = await lctx.newPage();
    await live.route('**/*', (r) => r.abort());
    await live.setContent(serverHtml.replace(/<head([^>]*)>/i, `<head$1><base href="${start}">`), { waitUntil: 'domcontentloaded' })
      .catch(() => {});
    const liveHtml = await live.evaluate(rewriteDom, { map: mapObj, stripScripts: false }).catch(() => null);
    if (liveHtml) await writeFile(path.join(dir, 'index.live.html'), liveHtml);
    await lctx.close();
  }

  const mctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: USER_AGENT });
  const mpage = await mctx.newPage();
  await mpage.goto(start.toString(), { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await mpage.waitForTimeout(1500);
  await mpage.screenshot({ path: path.join(root, 'screens', 'original-mobile-fold.png') }).catch(() => {});
  await mctx.close();
  await browser.close();

  const textSample = staticHtml.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  await writeFile(path.join(dir, 'manifest.json'), JSON.stringify({
    source: start.toString(), title: (staticHtml.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || null,
    capturedAt: new Date().toISOString(), totalBytes, skipped, textLength: textSample.length, assets: manifest,
  }, null, 2));
  await writeFile(path.join(root, 'NOTICE.md'), [
    `# Third-party snapshot: ${start}`, '',
    'This folder is a raw copy of someone else\'s website, made for the Amati (observe) step of ATM.',
    'Text, images, fonts, code, and brand belong to their owners.', '',
    '- Keep it local. Add `atm/` to `.gitignore` and never deploy anything from `original/`.',
    '- Tiru (copy) happens in `build/`, in your own code, compared with `compare-build.mjs --mode tiru`.',
    '- Ship only after `compare-build.mjs --mode modifikasi` passes: no reused text, images, fonts, stylesheets, or brand.', '',
  ].join('\n'));

  const byType = manifest.reduce((acc, a) => ({ ...acc, [a.type]: (acc[a.type] || 0) + 1 }), {});
  console.log(`Saved ${manifest.length} assets (${Object.entries(byType).map(([k, v]) => `${v} ${k}`).join(', ') || 'none'}), ${Math.round(totalBytes / 1024)} KB.`);
  if (skipped.length) console.log(`Skipped ${skipped.length} asset(s) over the size limit; they still load from the original URL.`);
  console.log(`Static copy: ${path.join(dir, 'index.html')}`);
  console.log(`Screens:     ${path.join(root, 'screens')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
