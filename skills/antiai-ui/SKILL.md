---
name: antiai-ui
description: "Filters web UI that looks AI-generated and raises it to award-jury craft: default typefaces, purple-blue gradients, the stock hero-plus-three-cards landing page, default radius/shadow/blur, glassmorphism, fade-up-everything motion, and the second wave of 'tasteful' defaults (cream and terracotta, mono eyebrows, one italic accent word). Also covers the Awwwards rubric (Design 40, Usability 30, Creativity 20, Content 10), a crawler that extracts design decisions from reference websites, an ATM workflow (Amati, Tiru, Modifikasi: snapshot a page, rebuild it to a similarity score, then pass an originality gate), a vetted library shortlist (GSAP, Lenis, Swup, Barba, Three.js, Rive, and more), a concept and signature-moment workflow, Core Web Vitals, accessibility, and reduced motion. Use when designing, building, or reviewing a website, landing page, portfolio, or app UI. Load with antiai-core."
---

# antiai-ui

> Anti Slop: Rules for AI Coding Agents. Visual UI skill

> Part of the antiai system. Read together with `antiai-core`. This skill filters interfaces that look generated and sets the bar at what an Awwwards jury rewards. It references core rules by number and never duplicates or renumbers them. Load it when the task designs, builds, or reviews a UI.

## How to use this skill

- Load together with `antiai-core` whenever the task produces or reviews a web page or app screen. Add `antiai-ui-id` for an Indonesian product and `antiai-copywriting-id` for Indonesian copy.
- Work in order: **Reference sites** (when the user has them, optionally through **ATM**), then **Concept**, then **Art direction**, then build, then the tells below, then **Usability**, then the rubric self-score.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- A tell marks an unchosen default, not proof that AI wrote the code. A default you chose on purpose, can justify in one sentence, and apply consistently is not slop (R-37). The test is always: could this page belong to anyone?
- The Delivery Gate in `antiai-core` remains the gate. The checklist at the end supplements it.

## What the jury scores

Awwwards scores every submission on four weighted criteria: **Design 40%**, **Usability 30%**, **Creativity 20%**, **Content 10%**. Jurors score from 1 to 10; an Honorable Mention needs a jury average of 6.5 or more, and Site of the Day goes to the top-scoring site of the day. Jury members report that Site of the Day winners are then reviewed by a separate developer jury for the Developer Award, which looks at semantics, performance, accessibility, responsiveness, and motion quality.

Two consequences shape this skill:

- **Effects are not the score.** In one unofficial analysis of 808 winners, GSAP, smooth scroll, full-screen WebGL, preloaders, and custom cursors each appear on half or more of winning sites, and none of them separates high scorers from low ones. They are table stakes at best. What separated Sites of the Month and Year from Sites of the Day was creativity, mostly a concept carried through the whole page.
- **Usability is 30%.** A slow, confusing, or inaccessible site loses more than a beautiful one gains. Treat performance and accessibility as design constraints from the first sketch, not a final pass.

## Reference Sites

When the user names one or more reference websites, crawl them before designing. The crawler in `scripts/crawl-reference.mjs` loads each page in Chromium (desktop 1440×900 and mobile 390×844) and reports what the reference decided: type families and scale per tag, largest above-fold size in `vw`, background and text palette by share, radius, shadow, and blur usage, the motion stack (GSAP, ScrollTrigger, Lenis, Three.js and WebGL, Rive, Lottie, page-transition libraries, custom cursor), reduced-motion support, lab LCP and CLS, page weight, accessibility basics (contrast, alt text, landmarks, skip link, heading order, tap targets), and slop flags from this skill. It saves screenshots of each page.

```bash
npm i -D playwright && npx playwright install chromium
node <skill-dir>/scripts/crawl-reference.mjs https://reference.example --pages 5
```

Options: `--pages N` (default 5, same origin, nav links first), `--out DIR` (default `reference-crawl/`), `--delay MS` between pages (default 1000), `--no-screenshots`, and `--ignore-robots` (only for a site the user owns). Output goes to `reference-crawl/<host>/report.md`, `report.json`, and the PNG screenshots.

### Copying the Surface

- **Tell:** the shipped design reuses the reference's fonts, palette, layout, and signature interaction, so it reads as a clone.
- **Why:** a derivative site loses the creativity score, and shipping someone else's markup, copy, images, logos, or licensed fonts is infringement.
- **Fix:** read the report and the screenshots, then write each finding as a decision and its reason ("display serif at 12vw so the type carries the brand"). Keep the reason, and make a new decision that fits this project's concept. Copying is allowed only as a private exercise inside the ATM workflow below, and nothing ships until its Modifikasi gate passes. Check a font's license before using the same face.
- **Rule:** R-40, R-43.

### Importing the Reference's Defaults

- **Tell:** adopting what the reference does just because it ranked well, including its own slop flags (Inter, 16px radius everywhere, glass navbar).
- **Why:** award winners carry defaults too, and effects alone do not move the score.
- **Fix:** treat every slop flag in the report as something not to inherit. Take the reference's ratios and restraint (how few colors, how large the display type, how quiet the motion) rather than its components.
- **Rule:** R-40.

### Trusting Lab Numbers Blindly

- **Tell:** quoting the crawler's LCP or page weight as the reference's real performance, or trusting a report whose stylesheets failed to load.
- **Why:** the numbers are lab values from one unthrottled run. If the report warns that stylesheets or fonts failed, the type and color data show browser defaults.
- **Fix:** use the numbers to compare, not as field data. When the report carries a load warning, check the screenshots and rerun from an unrestricted network before drawing conclusions.
- **Rule:** C-6.

## ATM: Amati, Tiru, Modifikasi

Observe, imitate, modify: the way designers learn from a site they admire. Copy the page raw, rebuild it as closely as you can to learn how it works, then change it until it is your own. Each step has a script, so "close" and "your own" are measured, not guessed.

| Step | Goal | Script | Output |
| --- | --- | --- | --- |
| Amati | Save a raw local copy and study it | `snapshot-site.mjs` and `crawl-reference.mjs` | `atm/<host>/<page>/original/` and `reference-crawl/<host>/` |
| Tiru | Rebuild it in your own project until it matches | `compare-build.mjs --mode tiru` | similarity scores and red diff images |
| Modifikasi | Turn the rebuild into your site | `compare-build.mjs --mode modifikasi` | PASS, or exit code 2 with what still belongs to the original |

```bash
node <skill-dir>/scripts/snapshot-site.mjs https://reference.example/work
node <skill-dir>/scripts/crawl-reference.mjs https://reference.example --pages 3
node <skill-dir>/scripts/compare-build.mjs --original atm/reference.example/work --build build/index.html --mode tiru
node <skill-dir>/scripts/compare-build.mjs --original atm/reference.example/work --build http://localhost:4321 --mode modifikasi
```

**Amati.** `snapshot-site.mjs` loads the page in Chromium, scrolls it so lazy content loads, and saves:

- `index.html`: the rendered DOM with scripts removed, so it opens offline as a stable static copy.
- `index.live.html`: the server HTML with scripts kept, for studying behavior. It may not run offline.
- `assets/`, holding every CSS, JS, image, font, and media file it loaded. Image and font URLs referenced only in CSS (other breakpoints, hover states) are fetched too, and every URL is rewritten to the local copy.
- `manifest.json`, mapping each URL to its local path, type, and hash.
- Desktop and mobile screenshots.

Options: `--out DIR` (default `atm/`), `--max-mb N` total asset budget (default 150), `--ignore-robots` (only for a site the user owns). Read the copy in DevTools: the grid, the type scale, how the signature moment is built. Run the crawler on the same site for the measured report.

**Tiru.** Rebuild the page in the project's own stack and code, not by editing the snapshot. Writing it yourself is where the learning happens, and it keeps the original's code out of the project. Use the snapshot as the visual target and run `--mode tiru` after each pass. It renders both pages at desktop and mobile and reports:

- **Layout similarity:** 16px blocks compared, so it measures composition.
- **Pixel similarity:** exact rendering.
- **Height drift** between the two pages.
- **Diff images:** `diff-*.png` marks every differing region in red.

Aim for 90% layout similarity on the desktop fold before moving on; the remaining red is usually font rendering and image crops.

**Modifikasi.** Change the rebuild into this project's site: its concept, content, brand, imagery, and type, keeping the structural lessons. `--mode modifikasi` fails (exit code 2) while any of these remain:

- More than 5% of the original's phrases (20+ characters) reappear in the build's text (`--max-text-reuse`).
- Any image, font, media file, or stylesheet is byte-identical to the original or to its snapshot copy.
- Any request still goes to the original host.
- The original brand name, taken from its title and domain, appears in the build.
- The desktop fold is still 90% or more similar in layout (`--max-similarity`). From 75%, it warns that the page still reads as the original.

Sharing a font family with the original raises a warning to check the license. Treat passing the gate as the minimum: the page still has to pass the silhouette test and the rest of this skill.

### Shipping the Copy

- **Tell:** deploying the snapshot or the Tiru rebuild, committing `atm/` to the repo, or "modifying" only the colors and the logo.
- **Why:** the copy is someone else's work, and a recolor is still their page. It is infringement, Awwwards rejects it as derivative, and it is the most generic outcome possible.
- **Fix:** add `atm/` and `reference-crawl/` to `.gitignore`. Ship only a build that passes `--mode modifikasi` and the UI checklist. Never snapshot pages behind a login or a paywall.
- **Rule:** R-43, R-40.

## Concept

### No Concept

- **Tell:** the page has a style but no idea. Swap the logo and the copy and it could sell anything.
- **Why:** this is the root of every other tell. Without a concept, every decision falls back to the most common choice, which is the statistical average the model learned.
- **Fix:** before any markup, write one sentence that says what the site is about and how it should feel, drawn from the subject itself: its material, history, place, or behavior. Every later decision (type, color, motion, layout) must trace back to that sentence. If it cannot, it is a default.
- **Rule:** R-40, R-31.

### Silhouette Test

- **Tell:** blur the page or reduce it to grey blocks, and it looks like every other landing page.
- **Why:** award-level layouts are recognizable from their shape alone; generated ones share one shape.
- **Fix:** run the test on the hero and two inner sections. If the block outline is generic, change the composition (scale, crop, grid break, asymmetry), not the colors.
- **Rule:** R-40.

### Effects Without a Signature

- **Tell:** a preloader, a custom cursor, smooth scroll, a WebGL blob, magnetic buttons, and text-split reveals, all at once, none tied to the subject.
- **Why:** a stack of effects is a checklist, not an idea, and each one costs load time and usability.
- **Fix:** choose one signature moment that expresses the concept (a scroll sequence, a transition, an interaction with the product). Define its trigger, timing, mobile version, and reduced-motion version. Everything else stays quiet so the signature reads.
- **Rule:** R-40, R-41.

## Typography

### Default Typeface

- **Tell:** Inter, or the system font stack, for every role, with no display face.
- **Why:** it is the default of nearly every AI tool, component library, and site builder. It reads as "nobody picked a font."
- **Fix:** pick a display face that comes from the concept, and pair it with a text face for reading. Two families is usually enough. Load them properly (`font-display: swap`, preloaded, subset) and set fallback metrics to avoid layout shift.
- **Rule:** R-40, C-4.

### The Second-Order Default Font

- **Tell:** swapping Inter for the fonts every "tasteful" AI output now reaches for: Space Grotesk, Geist, Instrument Serif, Fraunces, a mono for eyebrows.
- **Why:** escaping one default into the next most common choice is still a default.
- **Fix:** ask why this face, for this subject. If the only answer is "it looks designed," keep looking: a foundry release, a revival tied to the subject's era, or a custom-drawn wordmark.
- **Rule:** R-40.

### Timid Scale

- **Tell:** a 48-64px hero headline on a 1440px screen, body at 16px, and every heading one step bigger than the last.
- **Why:** a flat scale has no hierarchy and no voice. Winning sites use type as the main visual, often at very large display sizes, with a sharp contrast between display and text sizes.
- **Fix:** set a deliberate scale with fluid sizes (`clamp()`), let the display size be a decision you can defend (very large, or deliberately small), and set tracking and line height per size rather than one value for all.
- **Rule:** R-40, R-31.

### Font Declared but Not Loaded

- **Tell:** `font-family: "Something"` in the CSS with no `@font-face` or link, so the browser falls back silently.
- **Why:** the design shipped is not the design chosen, and nobody checked.
- **Fix:** verify in the network panel that every declared face loads, in every weight used.
- **Rule:** C-4, C-6.

## Color

### Purple-to-Blue Gradient

- **Tell:** an indigo, violet, or purple gradient fading to blue or cyan behind the hero, often with a blurred glow blob.
- **Why:** it is the single most cited marker of generated UI, inherited from framework defaults.
- **Fix:** derive the palette from the concept. Most winning palettes are small: two core colors, often with one or none saturated. Assign roles (background, text, one accent) instead of decorating.
- **Rule:** R-40.

### Gradient Headline Text

- **Tell:** `background-clip: text` gradients on the headline, or one word in the headline set in the accent color or in italic serif.
- **Why:** the accent word is the visual form of "It's not just X, it's Y": emphasis applied whether or not it is earned.
- **Fix:** let the scale, weight, and layout carry emphasis. If one word truly needs it, the reason must come from the content.
- **Rule:** R-40, R-36.

### Second-Wave "Tasteful" Palettes

- **Tell:** cream background with a terracotta accent; near-black with one acid-green or vermilion accent; beige with a forest green.
- **Why:** these are what models produce when told to avoid the purple gradient. They read as a style preset.
- **Fix:** same as above: the palette comes from the subject (its photography, materials, place). If it still lands on cream and terracotta, that is fine when you can say why in one sentence.
- **Rule:** R-40, R-37.

### Low-Contrast Muted Text

- **Tell:** light grey body text on white, or grey-on-grey captions that look refined in a screenshot.
- **Why:** it fails readers and fails WCAG, and usability is 30% of the score.
- **Fix:** body text meets WCAG AA (4.5:1), large text 3:1, and UI components and focus indicators 3:1. Check in both light and dark themes.
- **Rule:** R-42.

## Layout

### The Stock Landing Page

- **Tell:** pill badge, centered headline, subhead, two buttons ("Get started", "Learn more"), then a logo strip, a three-card feature grid, a stats row, three-tier pricing with the middle one highlighted, a CTA band, and a four-column footer.
- **Why:** this is the order the model has seen most. Every section exists because the template had one (R-05), not because this product needs it.
- **Fix:** design the page from what this visitor needs, in the order they need it. Cut sections that have nothing specific to say (C-3). Break the grid where the content earns it.
- **Rule:** R-05, C-3, R-40.

### Identical Card Grids

- **Tell:** three or six cards with an icon in a rounded square, a bold title, and two lines of grey text, all the same size and weight.
- **Why:** equal weight means no hierarchy, and the icon-in-a-square is one of the loudest generated-UI tells.
- **Fix:** rank the content and show the ranking: one lead item large, the rest smaller, or a list instead of cards. Replace generic icons with real product imagery or nothing.
- **Rule:** R-40, R-31.

### Bento With Soft 3D

- **Tell:** a bento grid of rounded tiles, each with a soft-rendered 3D object or a gradient mesh.
- **Why:** it became the default "modern" layout for generated sites, and it shows content shaped to fit tiles instead of tiles shaped to content.
- **Fix:** use bento only when the content has naturally different sizes and weights. Otherwise use a layout that follows the content.
- **Rule:** R-40, R-05.

### Template Chrome

- **Tell:** tracked all-caps or monospace eyebrows over every section, `01 / 02 / 03` numbering, `A · B · C` meta strings, fake browser window dots, hairline rules imitating a newspaper.
- **Why:** these are decoration borrowed from a style, applied to every section whether or not there is a sequence or a category to show.
- **Fix:** numbering appears only for a real sequence; an eyebrow appears only when it adds information the heading does not.
- **Rule:** R-40, R-31.

## Components

### Default Radius, Shadow, and Blur

- **Tell:** `rounded-2xl`, `shadow-lg`, and `backdrop-blur` on everything; untouched component-library themes.
- **Why:** framework defaults applied wholesale are the visual equivalent of "Update code."
- **Fix:** set radius, elevation, and borders as tokens derived from the concept (sharp, soft, or none), and use them on purpose. Restyle library components to the system.
- **Rule:** R-40.

### Reflexive Glassmorphism

- **Tell:** frosted-glass navbars and cards over a gradient blob.
- **Why:** it hurts contrast and performance, and it is a style preset rather than a decision.
- **Fix:** use translucency only when content actually scrolls beneath it and the text still meets contrast.
- **Rule:** R-40, R-42.

### Stock Icons and the AI Sparkle

- **Tell:** the default Lucide or Heroicons set at default stroke, the sparkle glyph meaning "AI," and arrows on every button.
- **Why:** the icons are the most recognizable piece of the template.
- **Fix:** use fewer icons. Where an icon is needed, pick or draw a set that matches the type's weight and the concept, and drop decorative arrows.
- **Rule:** R-40, R-04.

### Missing States

- **Tell:** no hover, focus, active, disabled, loading, empty, or error state; no 404 page; no favicon or social share image.
- **Why:** jurors click through, and the craft pass is where generated sites are thinnest.
- **Fix:** design every state for every interactive component, plus the 404, favicon, and Open Graph image.
- **Rule:** R-26, R-27.

## Motion

### Fade-Up Everything

- **Tell:** every section and card fades up 20px on scroll with the same duration and easing.
- **Why:** identical motion everywhere is noise, not choreography. It also delays content.
- **Fix:** define a motion language: two or three easing curves and durations as tokens, motion that explains (where something came from, what changed), and stillness elsewhere.
- **Rule:** R-41.

### Bounce, Count-Up, and Decorative Loops

- **Tell:** bouncy spring easing on UI, stats that count up from zero, infinitely looping marquee logos and floating blobs.
- **Why:** these are animation presets applied by default, and count-ups often animate invented numbers (R-18).
- **Fix:** keep motion that serves the concept or the signature moment; cut the rest.
- **Rule:** R-41, R-18.

### Scroll-Jacking

- **Tell:** scroll that is slowed, snapped, or redirected so the user loses control, or content that only appears after a long pinned sequence.
- **Why:** it is one of the usability failures jurors name most, especially on touch devices.
- **Fix:** scroll-linked motion follows the user's input and never blocks reaching content. Keep native scroll on mobile unless the concept truly needs otherwise, and test it there.
- **Rule:** R-41, R-26.

### Ignoring Reduced Motion

- **Tell:** parallax, auto-playing video, and WebGL that run regardless of `prefers-reduced-motion`.
- **Why:** it is an accessibility failure and the developer jury checks it.
- **Fix:** gate non-essential motion behind `prefers-reduced-motion: no-preference`, and give the signature moment a still or crossfade equivalent.
- **Rule:** R-41, R-42.

## Libraries

Choose tools after the concept, from the shortlist in `references/libraries.md`: animation (GSAP, Motion, anime.js), scroll (Lenis, Locomotive Scroll, CSS scroll-driven animations), page transitions (View Transitions, Swup, Taxi.js, Barba.js), text splitting (GSAP SplitText), 3D and canvas (Three.js, React Three Fiber, TresJS, OGL, PixiJS, Spline), and vector animation (Rive, dotLottie). It lists versions, when each fits, starting stacks per site type, and a Lenis + GSAP + reduced-motion setup.

### Library Soup

- **Tell:** GSAP and Motion in one bundle, Barba next to Swup, AOS fade-ups on top of ScrollTrigger, a Spline scene for a spinning logo.
- **Why:** overlapping libraries fight over the same frames and bloat the bundle, and preset packs produce the stock-effect tells.
- **Fix:** native CSS and browser APIs first, then one library per job, each with a reduced-motion path and cleanup on navigation.
- **Rule:** R-41, C-6.

## Content and Imagery

### Placeholder Content

- **Tell:** lorem ipsum, stock photos of people at laptops, placeholder avatars, invented testimonials, logo strips of companies that are not customers.
- **Why:** content is 10% of the score, and invented social proof is fabrication.
- **Fix:** real copy and real imagery, art-directed to the concept. Where real material is missing, mark it (`[REAL DATA]`) and say so.
- **Rule:** R-17, R-23, R-38.

### Generic Copy in the UI

- **Tell:** "Elevate your workflow," "Seamless," "Powerful," "Get Started →."
- **Why:** the copy carries the same default as the layout.
- **Fix:** apply the core wording rules. Buttons name the action and the result.
- **Rule:** R-15, R-16, R-36.

## Usability and Build Quality

### Performance

- **Tell:** a 10 MB hero video, an uncompressed WebGL scene on load, a multi-second preloader hiding slow assets.
- **Why:** slow loading is the most objective usability failure a juror sees.
- **Fix:** meet Core Web Vitals "good" at the 75th percentile at minimum (LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less), and aim well under that on a throttled mid-range phone. Lazy-mount 3D when it enters the viewport and pause its render loop off-screen. Serve modern image formats at the right size.
- **Rule:** R-26, C-6.

### Mobile as an Afterthought

- **Tell:** the desktop layout squeezed into one column; hover-only interactions; tap targets under 24px.
- **Why:** jurors check on phones, and a desktop masterpiece that breaks there loses.
- **Fix:** design the mobile composition separately; give every hover interaction a touch equivalent; keep tap targets at 24×24 CSS px or more (44px recommended).
- **Rule:** R-03, R-26, C-4.

### Keyboard and Semantics

- **Tell:** `div` buttons, removed focus outlines, no skip link, a custom cursor that hides the real one, content only in canvas.
- **Why:** the developer jury reviews markup and accessibility, and keyboard users cannot use the page.
- **Fix:** semantic HTML (`button`, `nav`, `main`, headings in order), a visible focus style designed as part of the system, a skip link, no keyboard traps, and text alternatives for anything drawn in canvas or WebGL.
- **Rule:** R-42.

### Inconsistent Inner Pages

- **Tell:** a crafted home page and template inner pages with different type, spacing, radius, or nav.
- **Why:** jurors open inner pages, and consistency is part of the design score.
- **Fix:** one token set across every page. Check two inner pages for every change to the home page.
- **Rule:** R-40, C-4.

## Self-Score

Before delivery, score the page like a juror, in a real browser on desktop and a throttled phone:

1. Design (40%): hierarchy, type, color, spacing, consistency across pages.
2. Usability (30%): speed, navigation, mobile, accessibility, measured not guessed (C-6).
3. Creativity (20%): is there one idea a visitor would remember and describe?
4. Content (10%): real, specific, art-directed.

Write the score for each, the three changes that would raise it most, and whether the limit is the concept or the execution. If it is the concept, say so; polishing will not fix it.

## UI Skill Checklist

Run these alongside the Delivery Gate in `antiai-core`. Every line below must be true:

- [ ] Reference sites, if any, were crawled and studied for decisions, not copied (R-40)
- [ ] If ATM was used: `compare-build.mjs --mode modifikasi` passes, and `atm/` is not committed or deployed (R-43)
- [ ] One library per job from `references/libraries.md`, native first, each with a reduced-motion path (R-41)
- [ ] A one-sentence concept exists, and type, color, layout, and motion trace back to it (R-40)
- [ ] The page passes the silhouette test; it could not belong to anyone else (R-40)
- [ ] One signature moment, with mobile and reduced-motion versions; other effects stay quiet (R-40, R-41)
- [ ] Typefaces are chosen, loaded, and paired; no Inter or second-order default without a reason (R-40, C-4)
- [ ] No purple-blue gradient, gradient text, accent-word headline, or preset "tasteful" palette without a reason (R-40)
- [ ] No stock landing-page skeleton, identical card grid, or template chrome (R-05, R-40, C-3)
- [ ] Radius, shadow, blur, and icons are system tokens, not framework defaults (R-40)
- [ ] Motion has a language; no fade-up-everything, bounce, count-up, or scroll-jacking (R-41)
- [ ] `prefers-reduced-motion` is honored everywhere (R-41, R-42)
- [ ] Text contrast meets WCAG AA; focus is visible; keyboard and semantics work (R-42)
- [ ] Every interactive state, the 404, favicon, and OG image are designed (R-26, R-27)
- [ ] Core Web Vitals measured in a real browser on a throttled phone, not estimated (C-6)
- [ ] Real content and imagery; missing material is marked, not invented (R-17, R-23, R-38)
- [ ] Inner pages match the home page system (R-40, C-4)
