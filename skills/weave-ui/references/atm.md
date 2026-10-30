<!-- Detail for the weave-ui skill. Read it when the user names reference websites or asks for ATM. -->

# ATM: Amati, Tiru, Modifikasi

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

Options: `--out DIR` (default `atm/`), `--max-mb N` total asset budget (default 150), `--video`, `--ignore-robots` (only for a site the user owns).

The static `index.html` drops scripts, so GSAP, WebGL, and smooth-scroll motion are lost there. `--video` records the page scrolling into `video/`: `desktop.webm` (1440×900, scrolled with the mouse wheel so smooth-scroll and ScrollTrigger play as designed), `desktop-reduced-motion.webm` (the same with `prefers-reduced-motion: reduce`, to see whether the reference respects it), and `mobile.webm` (390×844). Videos are recorded at full viewport size and capped at about a minute of scrolling. Study the choreography from them: what moves, in what order, with what easing, and what stays still. Read the copy in DevTools: the grid, the type scale, how the signature moment is built. Run the crawler on the same site for the measured report.

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

## Shipping the Copy

- **Tell:** deploying the snapshot or the Tiru rebuild, committing `atm/` to the repo, or "modifying" only the colors and the logo.
- **Why:** the copy is someone else's work, and a recolor is still their page. It is infringement, Awwwards rejects it as derivative, and it is the most generic outcome possible.
- **Fix:** add `atm/` and `reference-crawl/` to `.gitignore`. Ship only a build that passes `--mode modifikasi` and the UI checklist. Never snapshot pages behind a login or a paywall.
- **Rule:** R-43, R-40.
