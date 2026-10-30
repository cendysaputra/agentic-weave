---
name: weave-convert
description: "Convert a static build or ATM rebuild into a real stack: WordPress classic with ACF, Elementor V4 JSON, WooCommerce, Statamic, Laravel Blade, Astro, React or Next.js. Covers sections as components, tokens from one file, motion cleanup, and checking the result against the static build. Load with weave-core and weave-ui."
---

# weave-convert

This skill turns a finished static page into a maintainable site on the client's stack without losing the design or inventing platform details.

## How to use this skill

- Start from a static build that already passes the weave-ui checklist (and, for ATM work, `compare-build.mjs --mode modifikasi`). Convert structure, not design: decisions stay as they were made.
- Read the reference for the target before writing code. Each one says what is verified and what is not:

| Target | Reference |
| --- | --- |
| WordPress classic theme + ACF Flexible Content | `references/wordpress-classic.md` |
| Elementor V4 (Atomic Editor) | `references/elementor-v4.md` |
| WooCommerce | `references/woocommerce.md` |
| Statamic 6 | `references/statamic.md` |
| Laravel Blade, Astro, React or Next.js | `references/laravel-astro-react.md` |
| Motion on any target | `references/gsap-lifecycle.md` |

- Write what you did into `.weave/05-build-log.md` when weave-flow is in use.

## The method

1. **Normalize.** Remove tracking scripts and leftover experiments from the static build; move inline styles into tokens or classes.
2. **Segment.** One section becomes one component, template part, Replicator set, or Elementor container, named for what it is (`hero`, `roast-schedule`), not where it sits (`section-2`).
3. **Separate data from markup.** Text, images, and links become fields (ACF, blueprint fields, props, Elementor dynamic content). Nothing the client will edit stays hard-coded.
4. **One token source.** Generate CSS from `.weave/tokens.tokens.json` with weave-ui's build-tokens.mjs. Never retype a color or size into a theme file.
5. **Motion in one module.** Mount and revert per page as in `references/gsap-lifecycle.md`, with a reduced-motion path.
6. **Verify.** Serve the converted site locally and compare it with the static build: `compare-build.mjs --original <static snapshot> --build http://localhost:<port> --mode tiru`. Record the target from `04-stack.md` and the result. If it falls short twice, stop and report the differences instead of tuning further (C-6).

## Tells

### Invented Platform Details

- **Tell:** Elementor JSON with element types or setting keys nobody exported, ACF field names that do not match the field group, a WooCommerce hook name that does not exist.
- **Why:** the import or render fails silently or half works, and the agent's confident tone hides it (R-17).
- **Fix:** build only from documented structures or a real export. For Elementor, run `scripts/validate-elementor.mjs` with `--sample`. Mark anything unverified and check it on staging before relying on it.
- **Rule:** R-17, R-38.

### Content Locked in Templates

- **Tell:** headlines, prices, and images typed straight into PHP, Blade, or JSX on a site the client edits.
- **Why:** the client cannot change their own site, and every edit becomes a developer task.
- **Fix:** every editable item is a field with a sensible default; the build log lists which fields each section has.
- **Rule:** R-31.

### Retyped Tokens

- **Tell:** the theme's CSS repeats hex values and pixel sizes by hand, slowly drifting from `DESIGN.md`.
- **Why:** two sources of truth disagree within a week, and the drift is how a decided design turns back into defaults.
- **Fix:** generate the CSS from the tokens file and regenerate on every change.
- **Rule:** R-40.

### Motion Without Cleanup

- **Tell:** animations double up or jump after a page transition; ScrollTrigger count grows with each navigation.
- **Why:** motion from the previous page is still attached to elements that no longer exist.
- **Fix:** one mount and one revert per page, wired to the router's hooks (`references/gsap-lifecycle.md`).
- **Rule:** R-41.

### Unescaped Output

- **Tell:** `echo get_field('title')` or `{!! $title !!}` printing client-entered content.
- **Why:** any field becomes an injection point.
- **Fix:** escape at output (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`; Blade `{{ }}`), and allow HTML only where the field is meant to hold it.
- **Rule:** R-26.

## Convert Skill Checklist

Run these alongside the Delivery Gate in `weave-core`. Every line below must be true:

- [ ] The static build passed weave-ui (and the ATM gate if ATM was used) before conversion (R-43)
- [ ] Each section is one named component with its content in fields (R-31)
- [ ] No element type, setting key, field, or hook is invented; Elementor JSON passes `validate-elementor.mjs --sample` (R-17)
- [ ] CSS is generated from the tokens file, not retyped (R-40)
- [ ] Motion mounts and reverts per page, with a reduced-motion path (R-41)
- [ ] Output is escaped (R-26)
- [ ] `compare-build.mjs --mode tiru` against the static build meets the target in `04-stack.md` (C-6)
