<!-- Detail for the antiai-convert skill: Elementor V4 (Atomic Editor). Sources: developers.elementor.com data-structure pages and the Elementor 4.0 developer update, checked 2026-10-29. -->

# Elementor V4

## What is documented

- New Elementor sites use the V4 Atomic Editor by default; older sites must switch it on. V3 widgets still work and can sit on the same page.
- A template file has `title`, `type` (`page`, `header`, `footer`, `popup`, `error-404`, and others), `version` (`"0.4"` for atomic pages), `page_settings`, and `content`.
- Each element has `id`, `elType`, `isInner`, `settings`, and `elements` (its children). Atomic elements also carry `version`, `editor_settings`, `styles` (local styles, including responsive variants and pseudo-states), and `interactions` (event-based behaviors).
- Documented atomic layout elements: `e-div-block`, `e-flexbox`, `e-grid`. They nest freely.
- Global Classes are stored as `e_global_class` posts and exposed through the REST API (`global-classes`, `global-classes/styles?ids=`). Color Variables can sync to V3 Global Colors.
- Elementor has not opened an API for creating atomic elements programmatically, and atomic Loop and Grid were still in development at the 4.0 release.

## How an agent builds a template

1. On a staging site, build one page by hand that uses every atomic widget the design needs (heading, paragraph, button, image, svg). Export it and keep it as `sample-export.json` in the project.
2. Write the new template by rearranging and refilling structures from that export. Never invent an element type, widget type, or setting key.
3. Validate: `node <skill-dir>/scripts/validate-elementor.mjs template.json --sample sample-export.json`. It rejects element or widget types and setting keys that are not in the export, duplicate or malformed ids, and widgets without `widgetType`.
4. Import on staging first: `wp elementor library import template.json --returnType=ids`.
5. Map tokens to Variables (colors, sizes) and Classes (type styles), not to per-element styles.
6. Keep complex motion (scroll-linked, pinned, split text) in GSAP through Custom Code, following `gsap-lifecycle.md`. Use V4 Interactions only for simple micro-interactions.

## Not verified yet

The schema of individual atomic widgets, bulk import of Variables and Classes, and how V4 Interactions compare with GSAP. The sample export is the source of truth until Elementor documents them.
