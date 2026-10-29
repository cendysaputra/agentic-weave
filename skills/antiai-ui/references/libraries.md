# Library Choices for antiai-ui

A shortlist the agent picks from, by job. Choose the concept first, then the smallest set of tools that carries it. Every library is a cost against the performance budget, and none of them raises the score by itself (see "What the jury scores" in `SKILL.md`).

Versions are the latest on npm as of 2026-10-29. Check `npm view <package> version` before installing, and pin exact versions in `package.json`.

## Rules for the agent

1. **Native first.** Use CSS transitions, the Web Animations API, CSS scroll-driven animations, and View Transitions before adding a library. Add one only when native cannot do the job or browser support is not good enough for the audience.
2. **One library per job.** One animation engine, one scroll layer, one transition router. GSAP and Motion together, or Barba and Swup together, is a smell.
3. **Every library gets a reduced-motion path.** Initialize motion inside a `prefers-reduced-motion: no-preference` check, and give the signature moment a still or crossfade version.
4. **Clean up on navigation.** Kill ScrollTriggers and timelines, destroy smooth-scroll instances, and dispose WebGL geometries, materials, and textures when a page transition swaps content.
5. **Load heavy things late.** Mount 3D, Rive, and Lottie when they enter the viewport (IntersectionObserver), and pause render loops off-screen.
6. **No preset effect packs.** AOS, animate.css, particles backgrounds, typewriter heroes, and copy-pasted Aceternity or Magic UI components produce the "Fade-Up Everything" and stock-effect tells. Write the motion the concept needs.

## Animation engine

| Pick | Package | Version | Use when |
| --- | --- | --- | --- |
| GSAP | `gsap` | 3.15.0 | Timelines, scroll choreography, text and SVG effects. Default choice for award-style motion. All plugins (ScrollTrigger, SplitText, Flip, MorphSVG, ScrollSmoother, and others) ship in the public package at no charge since Webflow's acquisition; read the license at gsap.com/standard-license. React helper: `@gsap/react` 2.1.2 (`useGSAP`). |
| Motion | `motion` | 14.7.1 | React or vanilla projects that want declarative, layout, and exit animations (formerly Framer Motion). |
| anime.js | `animejs` | 4.5.0 | A lighter engine for timelines and SVG without the GSAP ecosystem. |
| Native | CSS, Web Animations API | - | Hover, focus, and state transitions. Most UI motion needs nothing more. |

## Scroll

| Pick | Package | Version | Use when |
| --- | --- | --- | --- |
| Lenis | `lenis` | 1.3.27 | Smooth scroll that keeps native scrolling semantics. Default choice. `@studio-freight/lenis` is the old, deprecated name. |
| Locomotive Scroll v5 | `locomotive-scroll` | 5.0.1 | Lenis plus data-attribute parallax and in-view detection, when you want those without writing them. |
| GSAP ScrollSmoother | in `gsap` | 3.15.0 | Smooth scroll when GSAP is already the engine and you want effects tied to it. Needs its wrapper/content DOM structure. |
| CSS scroll-driven animations | `animation-timeline: scroll()` / `view()` | - | Progress bars, reveals, and parallax without JS. Chrome and Edge 115+, Safari 26+; Firefox was still behind a flag in mid-2026, so wrap in `@supports (animation-timeline: scroll())` with a static fallback. |

Smooth scroll is not required. Keep native scroll on touch devices unless the concept needs otherwise, and never hijack the user's scroll speed or direction (see "Scroll-Jacking").

## Page transitions

| Pick | Package | Version | Use when |
| --- | --- | --- | --- |
| View Transitions (cross-document) | `@view-transition { navigation: auto; }` | - | First choice for multi-page sites. Chrome and Edge 126+, Safari 18.2+; Firefox support was partial as of 2026, and unsupported browsers simply navigate normally. |
| Swup | `swup` | 4.10.0 | Multi-page sites that need JS-controlled transitions, with an active plugin ecosystem (head, scripts, preload, forms). |
| Taxi.js | `@unseenco/taxi` | 2.0.0 | Lightweight router plus transitions for multi-page sites, from Unseen Studio. |
| Barba.js | `@barba/core` | 2.10.3 | The classic choice with many tutorials. Last release August 2024, so it works but is quiet; prefer Swup or Taxi for new work. |
| Framework router | Astro, Next.js, Nuxt, SvelteKit | - | In a framework, use its router with View Transitions or Motion's `AnimatePresence` instead of a separate library. |

## Text splitting

| Pick | Package | Version | Use when |
| --- | --- | --- | --- |
| GSAP SplitText | in `gsap` | 3.15.0 | Split lines, words, and characters with masks and screen-reader-safe output. Default choice now that it is free. |
| Splitting.js | `splitting` | 1.1.0 | CSS-variable-driven splits for pure CSS animation. |
| SplitType | `split-type` | 0.3.4 | Last published 2023; avoid for new work. |

Split text must stay readable to assistive technology: keep the original string in `aria-label` or let SplitText handle it, and never split body copy.

## 3D, WebGL, and 2D canvas

| Pick | Package | Version | Use when |
| --- | --- | --- | --- |
| Three.js | `three` | 0.186.1 | General 3D and shader work. Add `postprocessing` 6.39.5 for bloom, grain, and passes. |
| React Three Fiber | `@react-three/fiber` | 9.8.2 | Three.js in React. Helpers: `@react-three/drei` 10.7.9, `maath` 0.10.8. |
| TresJS | `@tresjs/core` | 5.10.1 | Three.js in Vue and Nuxt. |
| OGL | `ogl` | 1.0.11 | Minimal WebGL for one shader plane or image distortion where Three.js is too much. |
| PixiJS | `pixi.js` | 8.22.0 | Fast 2D: sprites, filters, image transitions, many moving elements. |
| Spline | `@splinetool/runtime` | 2.0.118 | A designer-authored scene embedded quickly. Heavy and less controllable; budget for it. |
| curtains.js | `curtainsjs` | 8.1.6 | DOM images as WebGL planes. Last release 2024. |

3D must earn its weight: one scene that carries the concept, lazy-mounted, paused off-screen, with a static image for reduced motion and low-power devices.

## Vector and interactive animation

| Pick | Package | Version | Use when |
| --- | --- | --- | --- |
| Rive | `@rive-app/canvas` / `@rive-app/webgl2` | 2.49.0 | Interactive, state-machine animation (buttons, characters, illustrations that react to input). React: `@rive-app/react-canvas` 4.38.0. |
| dotLottie | `@lottiefiles/dotlottie-web` | 0.81.0 | After Effects animations in the smaller `.lottie` format. React: `@lottiefiles/dotlottie-react` 0.20.0. |
| lottie-web | `lottie-web` | 5.13.0 | Legacy JSON Lottie only. Prefer dotLottie. |

## Interaction helpers

| Pick | Package | Version | Use when |
| --- | --- | --- | --- |
| Embla Carousel | `embla-carousel` | 8.6.0 | A headless carousel or drag strip you style yourself. Avoid a library carousel's default look. |
| Matter.js | `matter-js` | 0.20.0 | 2D physics for a playful signature moment. |

## Development only

`lil-gui` 0.21.0, `tweakpane` 4.0.5, and `stats-gl` 4.2.3 for tuning values and watching frame rate. Remove them from production builds.

## Starting stacks

| Site | Stack |
| --- | --- |
| Portfolio or editorial, multi-page | Astro or plain HTML, GSAP (ScrollTrigger, SplitText), Lenis, native View Transitions with Swup or Taxi as fallback |
| React marketing or product site | Next.js, Motion or GSAP with `@gsap/react`, Lenis, React Three Fiber only if the concept needs 3D |
| Vue or Nuxt | Nuxt, GSAP, Lenis, TresJS if 3D |
| No-JS-first, fastest | CSS scroll-driven animations and View Transitions behind `@supports`, nothing else |

## Wiring Lenis, GSAP, and reduced motion

```js
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  // Signature moment and other scroll motion go here.

  return () => {
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
});
// Under reduced motion nothing above runs: native scroll, final states shown.
```
