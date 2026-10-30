<!-- Detail for the weave-convert skill: Statamic 6 and Laravel Boost. Sources: statamic.dev, statamic.com/blog/statamic-6, laravel.com Boost docs, checked 2026-10-29. -->

# Statamic

- Statamic 6 was released on 28 January 2026. Its Control Panel uses Vue 3, Inertia.js, and Tailwind CSS 4.
- Blueprints are YAML files in `resources/blueprints` (for example `resources/blueprints/collections/blog/basic_post.yaml`). Fieldsets live in `resources/fieldsets` and can be imported into Grid, Replicator, or Bard fields.
- Templates can be Antlers or Blade. Renaming `view.antlers.html` to `view.blade.php` gives the same data; an Antlers template can use a Blade layout; `@antlers ... @endantlers` embeds Antlers in Blade. Antlers loop helpers (`first`, `last`, `count`, `index`, `total_results`) do not exist in Blade.
- Laravel Boost loads custom guidelines from `.ai/guidelines/*` (`.md` or `.blade.php`) on `boost:install`; a file at the same path as a built-in guideline replaces it.

## Mapping ATM sections

One section becomes one Replicator set that imports a fieldset, rendered by `resources/views/sets/{handle}.blade.php` (or `.antlers.html`). Where set definitions live (inline in the blueprint or imported) is not confirmed in the docs read; follow the project's existing convention.

Tokens: generate the Tailwind `@theme` block with weave-ui's build-tokens.mjs into the site stylesheet, so the front end uses the same Tailwind 4 pipeline as the Control Panel.

Add `.ai/guidelines/agentic-weave.md` with a short summary of the weave-core rules, so agents using Laravel Boost load them.
