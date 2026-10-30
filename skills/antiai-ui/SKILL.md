---
name: antiai-ui
description: "Design and review web UI that does not look AI-generated and meets Awwwards jury standards: concept first, decided type and color, purposeful motion, Core Web Vitals, accessibility. Includes a reference crawler, ATM snapshot and compare scripts, and a library shortlist. Use for websites, landing pages, portfolios, app UI. Load with antiai-core."
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

- **Effects are not the score.** In one unofficial analysis of 808 winners, GSAP, smooth scroll, full-screen WebGL, preloaders, and custom cursors each appear on half or more of winning sites, and none separates high scorers from low ones. What separated Sites of the Month and Year from Sites of the Day was creativity: a concept carried through the whole page.
- **Usability is 30%.** A slow, confusing, or inaccessible site loses more than a beautiful one gains. Treat performance and accessibility as design constraints from the first sketch, not a final pass.

## Reference Sites and ATM

When the user names reference websites, crawl them before designing with `scripts/crawl-reference.mjs`. It reports type, palette, components, motion stack, performance, accessibility, and slop flags, with screenshots. To learn a page by rebuilding it, use ATM (Amati, Tiru, Modifikasi): `scripts/snapshot-site.mjs` saves a local copy, and `scripts/compare-build.mjs` scores the rebuild (`--mode tiru`) and then gates originality (`--mode modifikasi`, exit code 2 on failure).

Read `references/reference-sites.md` before running the crawler and `references/atm.md` before running ATM. They hold the commands, options, outputs, and thresholds.

Four rules hold whichever path you take:

- Study the reference's decisions and their reasons, then make new ones from this project's concept. Do not inherit its fonts, palette, layout, or signature moment (R-40).
- Treat every slop flag in a crawl report as something not to inherit (R-40).
- Crawler numbers are lab values from one run. When a report warns that stylesheets or fonts failed to load, rerun before drawing conclusions (C-6).
- Copies under `atm/` and `reference-crawl/` stay local: never commit, deploy, or ship them. Nothing ships until `compare-build.mjs --mode modifikasi` passes. Never snapshot pages behind a login or paywall (R-43).

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

Choose tools after the concept, from the shortlist in `references/libraries.md`. It covers animation, scroll, page transitions, text splitting, 3D and canvas, and vector animation, with versions, starting stacks per site type, and a Lenis + GSAP + reduced-motion setup.

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
