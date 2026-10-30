#!/usr/bin/env node
// Crawl a reference website and extract its design decisions (type, color,
// components, motion stack, performance, accessibility) into a report the
// agent studies before designing. It records what the reference chose so the
// agent can learn the reasoning; it never copies markup, assets, or copy.
//
// Usage:
//   node crawl-reference.mjs <url> [--pages 5] [--out reference-crawl] [--delay 1000]
//                                  [--no-screenshots] [--ignore-robots]
//
// Requires Playwright with Chromium:
//   npm i -D playwright && npx playwright install chromium

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DESKTOP, MOBILE, USER_AGENT, isDisallowed, loadChromium, loadRobots, normalizeUrl, safeName, scrollThrough, sleep,
} from './lib.mjs';

const SKIP_EXT = /\.(pdf|zip|jpe?g|png|gif|webp|avif|svg|mp4|webm|mp3|woff2?|ttf|otf|css|js|json|xml|txt)$/i;

function parseArgs(argv) {
  const args = { pages: 5, out: 'reference-crawl', delay: 1000, screenshots: true, robots: true };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pages') args.pages = Math.max(1, parseInt(argv[++i], 10) || 1);
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--delay') args.delay = Math.max(0, parseInt(argv[++i], 10) || 0);
    else if (a === '--no-screenshots') args.screenshots = false;
    else if (a === '--ignore-robots') args.robots = false;
    else if (a === '-h' || a === '--help') args.help = true;
    else rest.push(a);
  }
  args.url = rest[0];
  return args;
}

// Runs before any page script so LCP and CLS are observed from the start.
function vitalsInitScript() {
  window.__weave = { lcp: 0, cls: 0, contexts: [] };
  // Record which canvas contexts the page itself creates (webgl, webgl2, 2d).
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (!window.__weave.contexts.includes(type)) window.__weave.contexts.push(type);
    return getContext.call(this, type, ...rest);
  };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__weave.lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__weave.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
}

// Everything below runs inside the page.
function extractInPage() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // Normalize any CSS color (rgb, oklch, color(), named) to [r, g, b, a].
  const toRgba = (css) => {
    if (!css || css === 'transparent') return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return a === 0 ? null : [r, g, b, +(a / 255).toFixed(2)];
  };
  const hex = ([r, g, b]) => '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  const hsl = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: h * 60, s, l };
  };
  // Near-identical colors share a bucket; the report shows the first real value seen in it.
  const buckets = {};
  const bucket = (rgba) => {
    const k = rgba.slice(0, 3).map((n) => Math.round(n / 8)).join(',');
    return (buckets[k] ||= hex(rgba));
  };
  const luminance = ([r, g, b]) => {
    const c = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contrast = (a, b) => {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const visible = (el, cs, rect) =>
    rect.width > 0 && rect.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0;
  const ownText = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  // Walk up until an opaque background is found; fall back to white.
  const bgOf = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = toRgba(getComputedStyle(n).backgroundColor);
      if (c && c[3] >= 0.9) return c;
    }
    return [255, 255, 255, 1];
  };

  const fontUse = {};
  const textColors = {};
  const bgColors = {};
  const radii = {};
  const typeByTag = {};
  const gradients = [];
  let shadowCount = 0, blurCount = 0, gradientTextCount = 0, elements = 0;
  let largestAboveFold = { px: 0, vw: 0, tag: '', text: '' };
  const lowContrast = [];

  for (const el of [document.documentElement, document.body, ...document.body.querySelectorAll('*')]) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (!visible(el, cs, rect)) continue;
    elements++;
    const area = rect.width * rect.height;

    const bg = toRgba(cs.backgroundColor);
    if (bg && bg[3] >= 0.9) {
      const k = bucket(bg);
      bgColors[k] = (bgColors[k] || 0) + area;
    }
    if (cs.backgroundImage.includes('gradient(')) {
      gradients.push(cs.backgroundImage.slice(0, 300));
      if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') gradientTextCount++;
    }
    if (cs.boxShadow && cs.boxShadow !== 'none') shadowCount++;
    if (cs.backdropFilter && cs.backdropFilter !== 'none') blurCount++;
    const r = cs.borderTopLeftRadius;
    if (r && r !== '0px' && area > 400) radii[r] = (radii[r] || 0) + 1;

    const text = el === document.documentElement ? '' : ownText(el);
    if (!text) continue;
    const size = parseFloat(cs.fontSize);
    const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    fontUse[family] = (fontUse[family] || 0) + text.length;

    const fg = toRgba(cs.color);
    if (fg) {
      const k = bucket(fg);
      textColors[k] = (textColors[k] || 0) + text.length;
      const ratio = contrast(fg, bgOf(el));
      const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
      if (ratio < (large ? 3 : 4.5) && lowContrast.length < 15) {
        lowContrast.push({ text: text.slice(0, 60), ratio: +ratio.toFixed(2), color: hex(fg), bg: hex(bgOf(el)) });
      }
    }

    const tag = /^H[1-6]$/.test(el.tagName) ? el.tagName.toLowerCase()
      : ['P', 'A', 'BUTTON', 'LI', 'LABEL', 'SPAN'].includes(el.tagName) ? el.tagName.toLowerCase() : null;
    if (tag && !typeByTag[tag]) {
      typeByTag[tag] = {
        family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight,
        lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, transform: cs.textTransform,
      };
    }
    if (rect.top < vh && rect.bottom > 0 && size > largestAboveFold.px) {
      largestAboveFold = { px: size, vw: +((size / vw) * 100).toFixed(2), tag: el.tagName.toLowerCase(), text: text.slice(0, 80) };
    }
  }

  const top = (obj, n, total) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([k, v]) => ({ value: k, share: +((v / total) * 100).toFixed(1) }));
  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0) || 1;
  const palette = top(bgColors, 8, sum(bgColors));
  const ink = top(textColors, 6, sum(textColors));
  const saturated = [...new Set([...palette, ...ink].map((c) => c.value))].filter((h) => {
    const n = parseInt(h.slice(1), 16);
    const { s, l } = hsl([(n >> 16) & 255, (n >> 8) & 255, n & 255]);
    return s > 0.45 && l > 0.15 && l < 0.85;
  });

  // Purple or indigo stop next to a blue or cyan stop: the classic generated hero.
  const purpleBlue = gradients.some((g) => {
    const hues = (g.match(/(rgba?|oklch|hsla?|color)\([^)]*\)|#[0-9a-f]{3,8}/gi) || [])
      .map(toRgba).filter(Boolean).map(hsl).filter((c) => c.s > 0.35);
    return hues.some((c) => c.h >= 250 && c.h <= 300) && hues.some((c) => c.h >= 180 && c.h < 250);
  });

  // Motion and rendering stack, detected from globals, DOM, and script URLs.
  const scripts = [...document.scripts].map((s) => s.src).join(' ').toLowerCase();
  const has = (globalName, pattern) => Boolean(window[globalName]) || pattern.test(scripts);
  const webgl = (window.__weave?.contexts || []).some((c) => /webgl/i.test(c));
  const cursorEl = [...document.querySelectorAll('[class*="cursor" i]')].find((el) => {
    const s = getComputedStyle(el);
    return /(^|[-_\s])cursor([-_\s]|$)/i.test(el.className) && s.position === 'fixed' && s.pointerEvents === 'none';
  });
  const stack = {
    gsap: has('gsap', /gsap/),
    scrollTrigger: has('ScrollTrigger', /scrolltrigger/),
    lenis: document.documentElement.classList.contains('lenis') || has('Lenis', /lenis/),
    locomotive: document.documentElement.classList.contains('has-scroll-smooth') || /locomotive/.test(scripts),
    three: has('THREE', /three(\.module)?(\.min)?\.js/),
    webglCanvas: webgl,
    rive: has('rive', /rive/),
    lottie: has('lottie', /lottie|bodymovin/),
    barba: has('barba', /barba/),
    swup: has('swup', /swup/),
    webflow: Boolean(document.documentElement.dataset.wfPage),
    framer: Boolean(document.querySelector('[data-framer-name], #__framer-badge-container')),
    nextjs: Boolean(document.getElementById('__next') || window.__NEXT_DATA__),
    nuxt: Boolean(window.__NUXT__),
    customCursor: getComputedStyle(document.body).cursor === 'none' || Boolean(cursorEl),
  };

  // Reduced-motion support and @font-face sources from readable stylesheets.
  let reducedMotion = false, unreadableSheets = 0;
  const fontFaces = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { unreadableSheets++; continue; }
    const walk = (list) => {
      for (const rule of list) {
        if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) reducedMotion = true;
        if (rule.constructor.name === 'CSSFontFaceRule') {
          fontFaces.push({
            family: rule.style.getPropertyValue('font-family').replace(/["']/g, ''),
            weight: rule.style.getPropertyValue('font-weight'),
            display: rule.style.getPropertyValue('font-display'),
            src: (rule.style.getPropertyValue('src').match(/url\(([^)]+)\)/) || [])[1]?.replace(/["']/g, '').slice(0, 160),
          });
        }
        if (rule.cssRules) walk(rule.cssRules);
      }
    };
    walk(rules);
  }
  if (/prefers-reduced-motion/.test(scripts) || [...document.scripts].some((s) => /prefers-reduced-motion/.test(s.textContent))) reducedMotion = true;

  const loadedFonts = [...document.fonts].filter((f) => f.status === 'loaded')
    .map((f) => `${f.family.replace(/["']/g, '')} ${f.weight} ${f.style}`);

  const a11y = {
    imagesWithoutAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
    unnamedButtons: [...document.querySelectorAll('button, [role="button"], a[href]')]
      .filter((b) => !(b.innerText.trim() || b.getAttribute('aria-label') || b.getAttribute('title') || b.querySelector('img[alt]:not([alt=""]), svg title'))).length,
    divButtons: document.querySelectorAll('div[onclick], span[onclick]').length,
    skipLink: Boolean([...document.querySelectorAll('a[href^="#"]')].slice(0, 3).find((a) => /skip|main|content|lewati/i.test(a.textContent + a.getAttribute('href')))),
    landmarks: ['header', 'nav', 'main', 'footer'].filter((t) => document.querySelector(t)),
    headingOrder: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].slice(0, 20).map((h) => h.tagName.toLowerCase()),
    h1Count: document.querySelectorAll('h1').length,
    lang: document.documentElement.lang || null,
  };

  const sections = [...document.querySelectorAll('main > *, body > section, main section')]
    .filter((s) => s.getBoundingClientRect().height > 200).length;

  const meta = (sel) => document.querySelector(sel)?.getAttribute('content') || null;
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: a.href, inNav: Boolean(a.closest('nav, header')),
  }));

  return {
    title: document.title,
    description: meta('meta[name="description"]'),
    ogImage: meta('meta[property="og:image"]'),
    favicon: Boolean(document.querySelector('link[rel~="icon"]')),
    pageHeight: document.documentElement.scrollHeight,
    elements, sections,
    typography: {
      families: top(fontUse, 6, sum(fontUse)),
      byTag: typeByTag, largestAboveFold, fontFaces: fontFaces.slice(0, 20), loadedFonts: [...new Set(loadedFonts)].slice(0, 20),
    },
    color: { palette, ink, saturated, gradients: gradients.slice(0, 8), gradientCount: gradients.length, gradientTextCount, purpleBlueGradient: purpleBlue },
    components: {
      radii: top(radii, 6, sum(radii)), shadowCount, backdropBlurCount: blurCount,
    },
    motion: { stack, reducedMotionSupport: reducedMotion, unreadableStylesheets: unreadableSheets },
    a11y: { ...a11y, lowContrast },
    links,
    stylesheetHrefs: [...document.querySelectorAll('link[rel~="stylesheet"][href]')].map((l) => l.href),
  };
}

// Cross-origin stylesheets cannot be read from the page, so fetch them directly
// and scan the text for reduced-motion queries and @font-face rules.
async function scanStylesheets(context, hrefs) {
  const out = { reducedMotion: false, fontFaces: [], fetched: 0 };
  for (const href of hrefs.slice(0, 25)) {
    try {
      const res = await context.request.get(href, { timeout: 10000 });
      if (!res.ok()) continue;
      const css = await res.text();
      out.fetched++;
      if (/prefers-reduced-motion/.test(css)) out.reducedMotion = true;
      for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
        const family = (block.match(/font-family\s*:\s*([^;}]+)/) || [])[1];
        if (family) out.fontFaces.push(family.replace(/["']/g, '').trim());
      }
    } catch {}
  }
  out.fontFaces = [...new Set(out.fontFaces)];
  return out;
}

function slopFlags(p) {
  const flags = [];
  const primary = p.typography.families[0]?.value || '';
  if (/^inter$/i.test(primary)) flags.push('Primary text face is Inter.');
  if (/^(-apple-system|system-ui|blinkmacsystemfont|segoe ui|arial|helvetica)$/i.test(primary)) flags.push(`Primary text face is a system/default stack (${primary}).`);
  if (p.typography.families.some((f) => /space grotesk|geist|instrument serif|fraunces/i.test(f.value))) flags.push('Uses a second-order "tasteful" default font (Space Grotesk, Geist, Instrument Serif, or Fraunces).');
  if (p.color.purpleBlueGradient) flags.push('Purple-to-blue gradient detected.');
  if (p.color.gradientTextCount) flags.push(`Gradient text on ${p.color.gradientTextCount} element(s).`);
  if (p.components.backdropBlurCount >= 3) flags.push(`backdrop-filter on ${p.components.backdropBlurCount} elements (glassmorphism).`);
  if (p.components.radii[0]?.value === '16px' && p.components.radii[0].share > 40) flags.push('16px radius dominates (rounded-2xl default).');
  if (!p.motion.reducedMotionSupport && (p.motion.stack.gsap || p.motion.stack.lenis || p.motion.stack.webglCanvas)) flags.push('Heavy motion stack with no prefers-reduced-motion found in readable CSS/JS.');
  if (p.a11y.lowContrast.length) flags.push(`${p.a11y.lowContrast.length}+ text sample(s) below WCAG AA contrast.`);
  if (p.typography.fontFaceFamilies.length && p.typography.loadedFonts.length === 0) flags.push('@font-face declared but no font reported as loaded.');
  return flags;
}

function pickLinks(links, origin, seen, rules, skipped) {
  const out = [];
  const sorted = [...links].sort((a, b) => Number(b.inNav) - Number(a.inNav));
  for (const { href } of sorted) {
    let u;
    try { u = new URL(href); } catch { continue; }
    if (u.origin !== origin || !/^https?:$/.test(u.protocol) || SKIP_EXT.test(u.pathname)) continue;
    u.hash = '';
    const key = u.toString();
    if (seen.has(key) || out.includes(key)) continue;
    if (isDisallowed(key, rules)) {
      if (!skipped.includes(key)) skipped.push(key);
      continue;
    }
    out.push(key);
  }
  return out;
}

async function crawlPage(context, url, dir, index, screenshots) {
  const page = await context.newPage();
  const failed = { stylesheet: 0, font: 0, script: 0, other: 0 };
  page.on('requestfailed', (req) => {
    const type = req.resourceType();
    failed[type in failed ? type : 'other']++;
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      const type = res.request().resourceType();
      failed[type in failed ? type : 'other']++;
    }
  });
  const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const data = await page.evaluate(extractInPage);
  const sheets = await scanStylesheets(context, data.stylesheetHrefs);
  if (sheets.reducedMotion) data.motion.reducedMotionSupport = true;
  data.motion.stylesheetsScanned = sheets.fetched;
  data.typography.fontFaceFamilies = [...new Set([...data.typography.fontFaces.map((f) => f.family), ...sheets.fontFaces])];
  const vitals = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const bytes = resources.reduce((a, r) => a + (r.transferSize || 0), nav?.transferSize || 0);
    return {
      lcpMs: Math.round(window.__weave?.lcp || 0),
      cls: +(window.__weave?.cls || 0).toFixed(3),
      ttfbMs: nav ? Math.round(nav.responseStart) : null,
      loadMs: nav ? Math.round(nav.loadEventEnd) : null,
      requests: resources.length + 1,
      transferKB: Math.round(bytes / 1024),
    };
  });

  const shots = {};
  if (screenshots) {
    const base = `page-${String(index).padStart(2, '0')}`;
    shots.desktopFold = `${base}-desktop-fold.png`;
    await page.screenshot({ path: path.join(dir, shots.desktopFold) });
    // Scroll through once so lazy and scroll-triggered content renders.
    await scrollThrough(page);
    await page.waitForTimeout(800);
    shots.desktopFull = `${base}-desktop-full.png`;
    await page.screenshot({ path: path.join(dir, shots.desktopFull), fullPage: true }).catch(() => {});
  }
  await page.close();

  let mobile = null;
  const mctx = await context.browser().newContext({
    viewport: MOBILE, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: USER_AGENT,
  });
  try {
    const mpage = await mctx.newPage();
    await mpage.goto(url, { waitUntil: 'load', timeout: 45000 });
    await mpage.waitForTimeout(1500);
    mobile = await mpage.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      smallTapTargets: [...document.querySelectorAll('a[href], button, input, select, [role="button"]')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24);
        }).length,
      largestFoldTextPx: Math.max(0, ...[...document.querySelectorAll('h1,h2,p,span,a')]
        .filter((el) => el.getBoundingClientRect().top < window.innerHeight)
        .map((el) => parseFloat(getComputedStyle(el).fontSize))),
    }));
    if (screenshots) {
      shots.mobileFold = `page-${String(index).padStart(2, '0')}-mobile-fold.png`;
      await mpage.screenshot({ path: path.join(dir, shots.mobileFold) });
    }
  } finally {
    await mctx.close();
  }

  const { links, stylesheetHrefs, ...rest } = data;
  const result = { url, status: response?.status() ?? null, ...rest, failedRequests: failed, vitals, mobile, screenshots: shots };
  result.slopFlags = slopFlags(result);
  return { result, links };
}

function consistency(pages) {
  const notes = [];
  const primaries = new Set(pages.map((p) => p.typography.families[0]?.value).filter(Boolean));
  if (primaries.size > 1) notes.push(`Primary font differs between pages: ${[...primaries].join(', ')}.`);
  const bgs = new Set(pages.map((p) => p.color.palette[0]?.value).filter(Boolean));
  if (bgs.size > 1) notes.push(`Dominant background differs between pages: ${[...bgs].join(', ')}.`);
  return notes;
}

function toMarkdown(report) {
  const L = [];
  const row = (...c) => L.push(`| ${c.join(' | ')} |`);
  L.push(`# Reference crawl: ${report.origin}`, '');
  L.push(`Crawled ${report.pages.length} page(s) on ${report.crawledAt}. Desktop ${DESKTOP.width}x${DESKTOP.height}, mobile ${MOBILE.width}x${MOBILE.height}.`);
  L.push('Performance numbers are lab values from an unthrottled machine: use them to compare, not as field data.', '');
  if (report.skipped.length) L.push(`Skipped by robots.txt: ${report.skipped.join(', ')}`, '');
  if (report.consistency.length) L.push('## Consistency', '', ...report.consistency.map((n) => `- ${n}`), '');

  for (const p of report.pages) {
    L.push(`## ${p.title || p.url}`, '', `${p.url} (HTTP ${p.status})`, '');
    const f = p.failedRequests;
    if (f.stylesheet || f.font) {
      L.push(`> Warning: ${f.stylesheet} stylesheet(s) and ${f.font} font(s) failed to load, so the type and color below may show browser defaults, not the real design. Check the screenshots and rerun from an unrestricted network.`, '');
    }
    L.push('### Typography', '');
    L.push(`Families by text share: ${p.typography.families.map((f) => `${f.value} ${f.share}%`).join(', ') || 'none'}`);
    const big = p.typography.largestAboveFold;
    L.push(`Largest above-fold text: ${big.px}px (${big.vw}vw) on <${big.tag}> "${big.text}"`, '');
    row('Tag', 'Family', 'Size', 'Weight', 'Line height', 'Tracking', 'Case');
    row('---', '---', '---', '---', '---', '---', '---');
    for (const [tag, t] of Object.entries(p.typography.byTag)) {
      row(tag, t.family.split(',')[0], t.size, t.weight, t.lineHeight, t.letterSpacing, t.transform);
    }
    L.push('', `Declared @font-face families: ${p.typography.fontFaceFamilies.join(', ') || 'none'}`);
    L.push(`Loaded font files: ${p.typography.loadedFonts.join('; ') || 'none reported'}`, '');
    L.push('### Color', '');
    L.push(`Background palette by area: ${p.color.palette.map((c) => `${c.value} ${c.share}%`).join(', ')}`);
    L.push(`Text colors by text share: ${p.color.ink.map((c) => `${c.value} ${c.share}%`).join(', ')}`);
    L.push(`Saturated colors: ${p.color.saturated.join(', ') || 'none'}. Gradients: ${p.color.gradientCount}.`, '');
    L.push('### Components', '');
    L.push(`Radius: ${p.components.radii.map((r) => `${r.value} ${r.share}%`).join(', ') || 'none'}. Shadows: ${p.components.shadowCount}. Backdrop blur: ${p.components.backdropBlurCount}.`, '');
    L.push('### Motion and stack', '');
    const on = Object.entries(p.motion.stack).filter(([, v]) => v).map(([k]) => k);
    L.push(`Detected: ${on.join(', ') || 'nothing detected'}. Reduced-motion support found in CSS: ${p.motion.reducedMotionSupport ? 'yes' : 'no'} (${p.motion.stylesheetsScanned} external stylesheet(s) scanned; JS-only handling is not detected).`, '');
    L.push('### Performance (lab)', '');
    const v = p.vitals;
    L.push(`LCP ${v.lcpMs} ms, CLS ${v.cls}, TTFB ${v.ttfbMs} ms, load ${v.loadMs} ms, ${v.requests} requests, ${v.transferKB} KB transferred.`, '');
    L.push('### Accessibility and structure', '');
    const a = p.a11y;
    L.push(`lang=${a.lang ?? 'missing'}, h1 count ${a.h1Count}, landmarks: ${a.landmarks.join(', ') || 'none'}, skip link: ${a.skipLink ? 'yes' : 'no'}.`);
    L.push(`Images without alt: ${a.imagesWithoutAlt}. Unnamed links/buttons: ${a.unnamedButtons}. div/span click handlers: ${a.divButtons}.`);
    L.push(`Heading order: ${a.headingOrder.join(' ') || 'none'}. Large sections: ${p.sections}. Favicon: ${p.favicon ? 'yes' : 'no'}. OG image: ${p.ogImage ? 'yes' : 'no'}.`);
    if (a.lowContrast.length) L.push(`Low contrast: ${a.lowContrast.slice(0, 5).map((c) => `"${c.text}" ${c.ratio}:1`).join('; ')}`);
    if (p.mobile) L.push(`Mobile: horizontal overflow ${p.mobile.horizontalOverflow ? 'yes' : 'no'}, tap targets under 24px: ${p.mobile.smallTapTargets}, largest fold text ${p.mobile.largestFoldTextPx}px.`);
    L.push('');
    L.push('### Slop flags', '', ...(p.slopFlags.length ? p.slopFlags.map((f) => `- ${f}`) : ['- None detected by the scanner. Still run the silhouette test on the screenshots.']), '');
    if (Object.keys(p.screenshots).length) L.push('### Screenshots', '', ...Object.values(p.screenshots).map((s) => `- ${s}`), '');
  }
  return L.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.url) {
    console.log('Usage: node crawl-reference.mjs <url> [--pages 5] [--out reference-crawl] [--delay 1000] [--no-screenshots] [--ignore-robots]');
    process.exit(args.help ? 0 : 1);
  }
  const start = normalizeUrl(args.url);
  const origin = start.origin;
  const dir = path.resolve(args.out, safeName(start.host));
  await mkdir(dir, { recursive: true });

  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: DESKTOP, userAgent: USER_AGENT });
  await context.addInitScript(vitalsInitScript);

  const rules = args.robots ? await loadRobots(context, origin) : [];
  const queue = [start.toString()];
  const seen = new Set();
  const skipped = [];
  const pages = [];

  try {
    while (queue.length && pages.length < args.pages) {
      const url = queue.shift();
      if (seen.has(url)) continue;
      seen.add(url);
      if (isDisallowed(url, rules)) { skipped.push(url); continue; }
      process.stdout.write(`[${pages.length + 1}/${args.pages}] ${url} ... `);
      try {
        const { result, links } = await crawlPage(context, url, dir, pages.length + 1, args.screenshots);
        pages.push(result);
        for (const l of pickLinks(links, origin, seen, rules, skipped)) if (!queue.includes(l)) queue.push(l);
        console.log(`ok (${result.slopFlags.length} flag(s))`);
      } catch (err) {
        console.log(`failed: ${err.message.split('\n')[0]}`);
      }
      if (queue.length && pages.length < args.pages) await sleep(args.delay);
    }
  } finally {
    await browser.close();
  }

  if (!pages.length) {
    console.error('No page could be crawled.');
    process.exit(1);
  }
  const report = { origin, crawledAt: new Date().toISOString(), skipped, consistency: consistency(pages), pages };
  await writeFile(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(dir, 'report.md'), toMarkdown(report));
  console.log(`\nReport: ${path.join(dir, 'report.md')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
