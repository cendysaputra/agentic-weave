<!-- Detail for the weave-ui skill. -->

# Build Quality and Content

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
