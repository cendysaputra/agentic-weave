<!-- Detail for the antiai-convert skill. Read it before wiring motion into any target. Verified against the npm packages named below on 2026-10-30. -->

# Motion Lifecycle

Every target has the same problem: pages change without a full reload (Swup, Barba, Astro View Transitions, React routes, Elementor previews), and motion created for the old page keeps running. Each page's motion must be created in one place and reverted in one place.

## One mount, one revert

`gsap.context()` (GSAP 3.11 and later) records every animation, ScrollTrigger, and SplitText created inside it; `ctx.revert()` kills them and restores the original inline styles. `gsap.matchMedia()` creates a context internally, so use it instead of a separate context when motion depends on a media query such as reduced motion.

```js
// motion.js: one function per page or section root.
export function mount(root) {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Every tween and ScrollTrigger for this page, scoped to root.
  });
  return () => mm.revert();
}
```

Lenis (1.3.27) exposes `destroy()`, `stop()`, `start()`, and `resize()`. Create one instance per site, `stop()` it during a page transition, `resize()` after new content is in, and `destroy()` only when the site tears down.

## Where to call mount and revert

| Router | Mount after | Revert before | Verified in |
| --- | --- | --- | --- |
| Swup 4 | `swup.hooks.on('page:view', ...)` | `swup.hooks.before('content:replace', ...)` | `swup` 4.10.0 |
| Barba 2 | `afterEnter` | `beforeLeave` | `@barba/core` 2.10.3 types (also `beforeOnce`, `afterOnce` for the first load) |
| Astro View Transitions | `document.addEventListener('astro:page-load', ...)` | `astro:before-swap` | `astro` 7.4.1 |
| React / Next.js | `useGSAP(() => { ... }, { scope: ref })` from `@gsap/react` 2.1.2 | automatic on unmount; wrap event handlers in `contextSafe` | `@gsap/react` 2.1.2 |
| Plain multi-page site | `DOMContentLoaded` | not needed: every page loads fresh | |

## Checks

- After ten back-and-forth navigations, the number of ScrollTriggers (`ScrollTrigger.getAll().length`) is the same as after the first load.
- With reduced motion on, every element is in its final visible state.
