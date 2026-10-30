<!-- Detail for the weave-ui skill. Read it when the user names reference websites or asks for ATM. -->

# Reference Sites

When the user names one or more reference websites, crawl them before designing. The crawler in `scripts/crawl-reference.mjs` loads each page in Chromium (desktop 1440×900 and mobile 390×844) and reports what the reference decided: type families and scale per tag, largest above-fold size in `vw`, background and text palette by share, radius, shadow, and blur usage, the motion stack (GSAP, ScrollTrigger, Lenis, Three.js and WebGL, Rive, Lottie, page-transition libraries, custom cursor), reduced-motion support, lab LCP and CLS, page weight, accessibility basics (contrast, alt text, landmarks, skip link, heading order, tap targets), and slop flags from this skill. It saves screenshots of each page.

```bash
npm i -D playwright && npx playwright install chromium
node <skill-dir>/scripts/crawl-reference.mjs https://reference.example --pages 5
```

Options: `--pages N` (default 5, same origin, nav links first), `--out DIR` (default `reference-crawl/`), `--delay MS` between pages (default 1000), `--no-screenshots`, and `--ignore-robots` (only for a site the user owns). Output goes to `reference-crawl/<host>/report.md`, `report.json`, and the PNG screenshots.

## Finding References

When the user names no reference site, browse these galleries with the user and pick one to three sites whose decisions fit the project's concept. Crawl the chosen sites, not the gallery pages.

- https://muuuuu.org/
- https://sankoudesign.com/
- https://io3000.com/
- https://webdesignclip.com/
- https://www.s5-style.com/
- https://81-web.com/

Added at the project owner's request on 2026-10-30. Not verified from this repository: the sites could not be reached from the build environment, so their content, filters, and language are unchecked. They are understood to be curated web design galleries, mostly of Japanese sites; confirm before describing them further.

## Copying the Surface

- **Tell:** the shipped design reuses the reference's fonts, palette, layout, and signature interaction, so it reads as a clone.
- **Why:** a derivative site loses the creativity score, and shipping someone else's markup, copy, images, logos, or licensed fonts is infringement.
- **Fix:** read the report and the screenshots, then write each finding as a decision and its reason ("display serif at 12vw so the type carries the brand"). Keep the reason, and make a new decision that fits this project's concept. Copying is allowed only as a private exercise inside the ATM workflow (`atm.md`), and nothing ships until its Modifikasi gate passes. Check a font's license before using the same face.
- **Rule:** R-40, R-43.

## Importing the Reference's Defaults

- **Tell:** adopting what the reference does just because it ranked well, including its own slop flags (Inter, 16px radius everywhere, glass navbar).
- **Why:** award winners carry defaults too, and effects alone do not move the score.
- **Fix:** treat every slop flag in the report as something not to inherit. Take the reference's ratios and restraint (how few colors, how large the display type, how quiet the motion) rather than its components.
- **Rule:** R-40.

## Trusting Lab Numbers Blindly

- **Tell:** quoting the crawler's LCP or page weight as the reference's real performance, or trusting a report whose stylesheets failed to load.
- **Why:** the numbers are lab values from one unthrottled run. If the report warns that stylesheets or fonts failed, the type and color data show browser defaults.
- **Fix:** use the numbers to compare, not as field data. When the report carries a load warning, check the screenshots and rerun from an unrestricted network before drawing conclusions.
- **Rule:** C-6.
