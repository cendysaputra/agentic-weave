---
name: weave-ui
description: "Design and review web UI that does not look AI-generated and meets Awwwards jury standards: concept first, decided type and color, purposeful motion, Core Web Vitals, accessibility. Includes a reference crawler, ATM snapshot and compare scripts, and a library shortlist. Use for websites, landing pages, portfolios, app UI. Load with weave-core."
---

# weave-ui

> Agentic Weave: Rules for AI Coding Agents. Visual UI skill

> Part of the Agentic Weave system. Read together with `weave-core`. Filters interfaces that look generated and sets the bar at what an Awwwards jury rewards.

## How to use this skill

- Load together with `weave-core` whenever the task produces or reviews a web page or app screen. Add `weave-ui-id` for an Indonesian product and `weave-copywriting-id` for Indonesian copy.
- Work in order: reference sites (optionally ATM), concept, art direction, build, the tells below, build quality, then the self-score.
- Pick tools after the concept from `references/libraries.md`: one per job, native first, with reduced-motion paths and cleanup on navigation.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- A tell marks an unchosen default, not proof of AI. A default chosen on purpose, justified in one sentence, and applied consistently is not slop (R-37). The test: could this page belong to anyone?
- The Delivery Gate in `weave-core` remains the gate. The checklist at the end supplements it.

## The Bar and How It Is Scored

Awwwards scores Design 40%, Usability 30%, Creativity 20%, Content 10%. Effects do not move the score; a concept carried through the page does, and a slow or inaccessible site loses more than a beautiful one gains. Jury process and self-score: `references/awwwards-rubric.md`. Performance, mobile, keyboard, consistency, and content tells: `references/build-quality.md`.

## Reference Sites and ATM

Crawl reference sites with `scripts/crawl-reference.mjs`; learn by rebuilding through ATM (`scripts/snapshot-site.mjs`, `scripts/compare-build.mjs`). Read `references/reference-sites.md` and `references/atm.md` first. Always:

- Study the reference's decisions and reasons, then decide anew from this project's concept; never inherit its fonts, palette, layout, signature moment, or slop flags (R-40).
- Crawler numbers are lab values; rerun when a report warns that stylesheets or fonts failed (C-6).
- `atm/` and `reference-crawl/` stay local and never ship; nothing ships until `compare-build.mjs --mode modifikasi` passes; never snapshot behind a login or paywall (R-43).

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

### Default Tailwind Theme

- **Tell:** `bg-indigo-500`, `from-purple-500 to-pink-500`, `rounded-2xl`, `shadow-lg`, and `font-sans` across the page: Tailwind's built-in scales used as the design.
- **Why:** the default theme is the most common source of the generated look, and while it exists an agent will reach for it.
- **Fix:** generate `@theme` from the project's tokens with `scripts/build-tokens.mjs --to tailwind` (`references/design-tokens.md`); it resets the default scales so only project utilities exist.
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

## UI Skill Checklist

Run these alongside the Delivery Gate in `weave-core`. Every line below must be true:

- [ ] References were studied for decisions, not copied; any ATM build passes `compare-build.mjs --mode modifikasi` and `atm/` is not committed (R-40, R-43)
- [ ] One library per job, native first (R-41)
- [ ] A one-sentence concept exists, and type, color, layout, and motion trace back to it (R-40)
- [ ] The page passes the silhouette test; it could not belong to anyone else (R-40)
- [ ] One signature moment, with mobile and reduced-motion versions; other effects stay quiet (R-40, R-41)
- [ ] Typefaces are chosen, loaded, and paired; no Inter or second-order default without a reason (R-40, C-4)
- [ ] No purple-blue gradient, gradient text, accent-word headline, or preset "tasteful" palette without a reason (R-40)
- [ ] No stock landing-page skeleton, identical card grid, or template chrome (R-05, R-40, C-3)
- [ ] Radius, shadow, blur, and icons are system tokens, not framework defaults; Tailwind defaults are reset in `@theme` (R-40)
- [ ] Motion has a language, honors `prefers-reduced-motion`, and has no fade-up-everything, bounce, count-up, or scroll-jacking (R-41, R-42)
- [ ] Text contrast meets WCAG AA; focus is visible; keyboard and semantics work (R-42)
- [ ] Every interactive state, the 404, favicon, and OG image are designed (R-26, R-27)
- [ ] Core Web Vitals measured in a real browser on a throttled phone, not estimated (C-6)
- [ ] Real content and imagery; missing material is marked, not invented (R-17, R-23, R-38)
- [ ] Inner pages match the home page system (R-40, C-4)
