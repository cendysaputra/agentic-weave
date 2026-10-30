<!-- Detail for the weave-convert skill: Laravel Blade, Astro, and React or Next.js targets. -->

# Laravel Blade, Astro, React

These targets share one pattern: a section becomes a component, its text and images become props or data, tokens come from weave-ui's build-tokens.mjs, and motion follows `gsap-lifecycle.md`.

| Target | Section component | Data | Tokens | Motion hook |
| --- | --- | --- | --- | --- |
| Laravel Blade | anonymous component in `resources/views/components/`, used as `<x-hero />` | controller, config, or a model | Tailwind `@theme` file loaded through Vite | plain page load, or Swup hooks |
| Astro | `.astro` component per section; islands only where interaction needs JS | content collections | Tailwind `@theme` or `:root` variables | `astro:page-load` / `astro:before-swap` |
| React / Next.js | one component per section | props from the CMS or MDX | Tailwind `@theme` or CSS variables | `useGSAP` with `scope` |

The Laravel and Astro conventions in the first two columns are long-standing framework conventions, not re-verified for this release; check the framework version the project uses.
