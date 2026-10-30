// Shared helpers for the antiai-ui scripts.

import { createRequire } from 'node:module';
import path from 'node:path';

export const USER_AGENT = 'antiai-reference-crawler/1.0 (+https://github.com/cendysaputra/agentic-weave)';
export const DESKTOP = { width: 1440, height: 900 };
export const MOBILE = { width: 390, height: 844 };

// Find Playwright next to this script, in the current project, or on NODE_PATH,
// so the skill folder itself never needs its own node_modules.
export async function loadChromium() {
  try {
    return (await import('playwright')).chromium;
  } catch {}
  for (const base of [path.join(process.cwd(), 'noop.js'), import.meta.url]) {
    try {
      return createRequire(base)('playwright').chromium;
    } catch {}
  }
  console.error('Playwright not found. Install it in your project:\n  npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

// Minimal robots.txt reader: Disallow rules under "User-agent: *".
export async function loadRobots(context, origin) {
  try {
    const res = await context.request.get(`${origin}/robots.txt`, { timeout: 10000 });
    if (!res.ok()) return [];
    const rules = [];
    let applies = false;
    for (const raw of (await res.text()).split('\n')) {
      const line = raw.split('#')[0].trim();
      const [key, ...v] = line.split(':');
      const value = v.join(':').trim();
      if (/^user-agent$/i.test(key)) applies = value === '*';
      else if (applies && /^disallow$/i.test(key) && value) rules.push(value);
    }
    return rules;
  } catch {
    return [];
  }
}

export const isDisallowed = (url, rules) => rules.some((r) => new URL(url).pathname.startsWith(r));

export const normalizeUrl = (input) => new URL(/^(https?|file):\/\//.test(input) ? input : `https://${input}`);

export const safeName = (s) => s.replace(/[^a-z0-9.-]/gi, '_');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Scroll the page once so lazy and scroll-triggered content loads.
export async function scrollThrough(page, step = 0.8, pause = 250) {
  await page.evaluate(async ([s, p]) => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * s) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, p));
    }
    window.scrollTo(0, 0);
  }, [step, pause]);
}
