<!-- Detail for the antiai-flow skill, stage 4. Answer the questions in order and stop at the first "yes". -->

# Choosing the Stack

Ask these in order and stop at the first question answered "yes". Write each answer and the reason into `.antiai/04-stack.md`. The tree is tuned for a web agency in Indonesia; when the brief says otherwise, the brief wins.

| # | Question | Yes | No |
| --- | --- | --- | --- |
| 1 | Must the client edit page layouts visually, by themselves? | WordPress + Elementor (V4 Atomic Elements for new builds) | next |
| 2 | Is there an online shop with stock and a local payment gateway (Midtrans, Xendit) or local shipping rates? | WordPress + WooCommerce, or Shopify when the client wants SaaS and accepts USD billing | next |
| 3 | Is the content structured, edited (not designed) by the client, and is the team strong in Laravel? | Statamic 6 (flat file, Blade or Antlers) | next |
| 4 | Is the content structured, on cheap shared hosting, and in need of the plugin ecosystem? | WordPress custom theme + ACF Flexible Content | next |
| 5 | Is it an application: accounts, dashboards, business logic? | Laravel + Blade or Livewire | next |
| 6 | Is it a static marketing or portfolio site with heavy motion or 3D? | Astro, or Next.js when the concept needs React or React Three Fiber | Webflow when a non-developer marketing team owns it |

Then pick libraries from the antiai-ui library shortlist (libraries.md), one per job, and write them with versions under "Libraries".

## Notes per answer

- **Elementor:** generate templates as JSON and import them with WP-CLI rather than clicking through the editor; antiai-convert covers what the JSON may contain. Complex scroll motion stays in GSAP through Custom Code.
- **WooCommerce:** prefer hooks and filters over copying templates into the theme; copied templates must be rechecked on every WooCommerce template update.
- **Statamic:** one page section becomes one Replicator set that imports a fieldset, rendered by a partial.
- **Astro or Next.js:** motion must clean up on page transitions (`gsap.context()` and `ctx.revert()`, or `useGSAP()` in React).
- **Any stack:** tokens come from `.antiai/tokens.tokens.json` through antiai-ui's build-tokens.mjs, never retyped by hand.
