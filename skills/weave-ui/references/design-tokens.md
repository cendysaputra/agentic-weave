<!-- Detail for the weave-ui skill. Read it before writing a project's design tokens or generating CSS from them. -->

# Design Tokens

Tokens are the bridge between the concept and the code: one file holds every color, font, size, radius, shadow, and easing decision, and each target (Tailwind, CSS variables, a CMS theme) is generated from it. Use the W3C Design Tokens format (DTCG), so other tools can read the same file.

## The file format

Verified against the Design Tokens Format Module 2025.10 source (github.com/design-tokens/community-group, `technical-reports/`, checked 2026-10-30):

- An object with `$value` is a token; an object without it is a group. `$type` on a group applies to every token inside it unless a token sets its own. A token with no resolvable type is invalid.
- Aliases are strings in curly braces: `"{color.ink}"`. Token and group names must not start with `$` or contain `{`, `}`, or `.`.
- `$schema`: `https://www.designtokens.org/schemas/2025.10/format.json`. File extension `.tokens` or `.tokens.json`.
- **color**: an object, never a bare hex string: `{ "colorSpace": "oklch", "components": [0.62, 0.17, 35], "alpha": 1, "hex": "#d2562c" }`. `alpha` and the 6-digit `hex` fallback are optional. Color spaces: `srgb`, `srgb-linear`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `display-p3`, `a98-rgb`, `prophoto-rgb`, `rec2020`, `xyz-d50`, `xyz-d65`. A component may be `"none"` (for example the hue of a grey).
- **dimension**: `{ "value": 2, "unit": "rem" }`. Units are only `px` and `rem`.
- **duration**: `{ "value": 600, "unit": "ms" }`, unit `ms` or `s`.
- **fontFamily**: a string or an array of strings. **fontWeight**: 1 to 1000, or a keyword such as `semi-bold`. **cubicBezier**: four numbers. **number**: a JSON number.
- **shadow**: `color`, `offsetX`, `offsetY`, `blur`, `spread` (optional `inset`), or an array of those. **typography**: `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight`.

## Workflow

1. **Study the reference (optional).** After `crawl-reference.mjs`, draft the reference's tokens:
   `node <skill-dir>/scripts/build-tokens.mjs --from-report reference-crawl/<host>/report.json`
   It writes `reference.tokens.json` next to the report: background and text colors by share (converted to OKLCH with the hex kept), the top font families, the size, weight, and line height per tag, and the common radii. The file is marked as the reference's, and the generator warns if you try to build CSS from it.
2. **Decide the project's tokens.** Write the project's own `tokens.tokens.json` from the concept, with a one-line reason per decision in `DESIGN.md`. The reference file is evidence for ratios and restraint (how many colors, how large the display type), not a source of values (R-40, R-43).
3. **Generate CSS.**
   - Tailwind CSS v4: `node <skill-dir>/scripts/build-tokens.mjs tokens.tokens.json --to tailwind --out src/tokens.css`, then `@import "./tokens.css";` after `@import "tailwindcss";`.
   - Plain CSS: `--to css` writes `:root` variables.
4. **Regenerate, never hand-edit.** The CSS file says where it came from. Change the tokens file and run the script again.

## Tailwind output

The `@theme` block starts by resetting the default scales (`--color-*: initial`, `--font-*: initial`, `--radius-*: initial`, `--shadow-*: initial`). Tested with Tailwind CSS 4.3.3: after the reset, `bg-indigo-500`, `rounded-2xl`, `shadow-lg`, and `font-sans` produce no CSS, while project utilities such as `bg-ink`, `font-display`, `text-hero`, and `shadow-lift` work. The default palette is no longer something an agent can reach for. Pass `--keep-defaults` only for an existing project that still depends on them.

Group names decide the Tailwind namespace: colors become `--color-*`, font families `--font-*`, shadows `--shadow-*`, cubic Béziers `--ease-*`, and dimensions under `radius`, `spacing`, `text` (or `font.size`), and `breakpoint` become `--radius-*`, `--spacing`, `--text-*`, and `--breakpoint-*`. A single dimension token named `spacing` becomes `--spacing`, the base that drives `p-4`, `gap-2`, and the rest. Everything else (font weights, durations, numbers) becomes a plain `:root` variable. Typography composites are not mapped yet; the script lists anything it skipped.

## Not supported yet

WordPress `theme.json` and Elementor V4 Variables are not generated: their exact mappings are still unverified (tracked in the research backlog of the agentic-weave repository). Map them by hand from the generated CSS variables until then.
