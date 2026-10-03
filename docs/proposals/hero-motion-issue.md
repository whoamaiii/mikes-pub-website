# Hero shader and hover micro-interactions

**Status:** proposal drafted for Linear; not yet filed or approved scope.
**Type:** UI enhancement (motion). **Branch:** `who-XX-hero-motion`.
**Prototype:** [`prototypes/motion-lab/`](../../prototypes/motion-lab/README.md), reviewed by Q on 23 September 2026.

## Outcome

Make Home feel lit and alive, and make every interactive element say "you can click this", without slowing the page, hurting accessibility or adding dependencies.

1. **Hero shader.** Raw WebGL1 painted over the existing exterior photo. It has lantern flicker, warm glow and an event-driven sign glint, plus a cursor lantern and parallax on mouse devices.
2. **Hover and micro-interactions.** CSS-first states on existing components: buttons and links, gallery, visit actions, Program rows and the category filter.

## Decisions (Q, 23 September 2026)

- [x] **ADR:** approve a new ADR-003 for decorative, progressively enhanced client WebGL with no libraries. ADR-001 limits client JS to "verified interactions", so the ADR has to exist before any code lands.
- [x] **JS budget:** raise the Home external-script ceiling in `docs/quality-gates.md` from **8 KiB to 14 KiB**. Home already ships 4.6 KiB. The prototype shader is 7.9 KiB minified with its lab controls (3.6 KiB gzip); the target is 6.5 KiB or less without them.
- [x] **WCAG 2.2.2 (Level A):** no pause button. Ambient flicker stops by itself after 5 s (see Motion limit below).
- [x] **Order:** land this _after_ the separate design-refinement issue from the 23 September audit, so hover states are built on the final markup.
- [x] **Devices:** Q has a mid-range Android phone and an iPhone for the real-device check.

**Blocked by:** WHO-19 closing, because UI changes now would invalidate its QA evidence, and by the design-refinement issue.

## Scope

### A. Hero shader (`/` only)

- **Layering.** A `<canvas>` sits between the unchanged `<picture>` and the existing CSS scrim. The `<img>` stays the LCP element, and the preload and responsive sources are untouched. The canvas fades in only after it has drawn its first frame.
- **Load gate.** A tiny gate script imports the WebGL module only after the hero image has decoded, and only when all of these are true:
  - WebGL is available,
  - `prefers-reduced-motion: no-preference`,
  - Save-Data is not on.

  Otherwise there is no canvas and no module request. Visitors see the photo exactly as today, and without JavaScript nothing changes.

- **Effects:**
  - **Lantern flicker:** warm pixels vary in brightness by a small amount, each area on its own rhythm.
  - **Warm glow:** a 16-tap bloom around warm pixels.
  - **Sign glint:** a sweep of about 1.1 s. It fires about 0.9 s after the canvas fades in, when the hero comes back into view (at least 60% visible after dropping below 35%), when the tab becomes visible again, when a mouse pointer enters the sign, and on a tap on the sign. It has a 3 s cooldown and never runs on a timer.
  - **Cursor lantern and parallax:** only for `(hover: hover) and (pointer: fine)`.
- **Crop parity.** The shader reads the rendered `<img>`'s `currentSrc` and computed `object-position`. That covers all three current positions: desktop `50% 50%`, the tablet rule `50% 20%` and mobile `65% 60%`. There should be no visible jump when the canvas replaces the photo. The sign box is stored per image in typed data (`src/data/home.ts`), not hard-coded in the script.
- **Tokens.** Glow, glint and lantern colours come from new semantic tokens in `tokens.css`, read at init. There are no raw colour values outside `tokens.css`.
- **Cost controls:**
  - DPR is capped at 1.5, and the context requests `powerPreference: 'low-power'`.
  - The loop pauses when the hero is off-screen or the tab is hidden.
  - On `webglcontextlost`, it fades back to the photo.
- **Auto-degrade.** After the first 60 frames: if the average frame time is above 22 ms, glow is dropped. If it's still above 22 ms, the shader stops and the photo returns.
- **Motion limit (WCAG 2.2.2).**
  - The flicker runs in windows of 5 s at most. One starts when the canvas fades in, and one runs alongside each glint trigger.
  - It fades in over 0.4 s and out over 1.2 s.
  - After that the render loop stops completely and leaves a still frame, with the warm glow staying as a static effect.
  - The cursor lantern and parallax run only while the visitor moves the mouse.
  - There is no pause button. This behaviour is already verified in the prototype: the loop stops about 5.5 s after load and wakes on the sign.
- **Contrast.** The CSS scrim stays above the canvas. Hero text keeps WCAG AA contrast in the brightest state, including the cursor lantern directly behind the headline.

### B. Hover and micro-interactions

These are CSS-first, use only `--duration-*` / `--ease-*` tokens, and animate only transform, opacity, filter and background-color.

- **ActionLink / Button:** the arrow nudges on hover and focus. The outlined variant fills with a brass wipe (ink text on brass, a permitted token pairing). Everything presses slightly on `:active`.
- **VenueGallery:** "lights come up". The image scales up to 1.045 and brightens. The existing caption-arrow nudge stays.
- **VisitActions:** a brass edge rule grows in, the background tints and the arrow slides.
- **EventRow (Program):** the row tints, the date turns brass, and the title and description shift by at most 0.35 rem. This applies to the row layout delivered by the design-refinement issue.
- **CategoryFilter:** the selected highlight slides to the new category, using a same-document View Transition inside `program-filter.ts`. Browsers without View Transitions switch instantly. No-JS fragment filtering, history, focus and keyboard behaviour stay exactly as they are.
- **Rules for all of them:**
  - Every effect also applies on `:focus-visible`.
  - Transforms that only happen on hover sit inside `@media (hover: hover)`, so taps don't leave elements stuck in their hover state.
  - Everything is disabled under reduced motion by the existing global rule.

## Out of scope (separate issues)

- **Structural design refinements from the audit** ([`2026-09-23-design-review.md`](2026-09-23-design-review.md)):
  - the hero button's target and filled style,
  - pairing activities with photos,
  - the side-by-side location layout,
  - the Program date block and newest-first order,
  - removing duplicate links,
  - spacing and the heading font.
- Cross-page View Transitions between Home and Program (possible follow-up).
- three.js or any other dependency; any third-party request.
- Merge, deployment and marking the issue Done.

## Likely files

- `src/components/home/HomeHero.astro`: the canvas and the sign-box data attributes.
- `src/scripts/hero-shader.ts` (new gate) and `src/scripts/hero-shader-gl.ts` (new, imported lazily).
- `src/types/home.ts`, `src/data/home.ts`: the typed sign box for each hero image.
- `src/styles/tokens.css`: new semantic hover and shader tokens.
- `src/styles/home.css`: hero layers and gallery hover.
- `src/styles/components.css`: ActionLink, Button and VisitActions.
- `src/styles/program.css`: EventRow and filter.
- `src/scripts/program-filter.ts`: the View Transition wrapper.
- `tests/e2e/home.spec.ts`: the budget check (count lazily loaded chunks from network responses), plus shader fallback, the 5-second limit, reduced motion and no-WebGL tests.
- `tests/e2e/program.spec.ts`: filter regressions.
- `tests/unit/home-content.test.ts`: every hero image has a valid sign box.
- `docs/design-system.md` (motion section), `docs/quality-gates.md` (budget) and `docs/adr/0003-decorative-webgl.md` (new).

## Acceptance criteria

- [ ] **Unchanged when the shader doesn't run.** With reduced motion, no WebGL, Save-Data or no JS, Home renders exactly as today: the shader module is never requested and all current Home tests pass.
- [ ] **No crop jump.** The shader crop matches the photo at 375, 768, 1024 and 1440 px. There is no visible jump at fade-in, and screenshot pairs are attached as evidence.
- [ ] **Glint triggers.** The glint fires on load, on hero re-entry, on tab return, on pointer entry into the sign and on a tap on the sign. It respects the 3 s cooldown and never repeats on its own.
- [ ] **5-second limit.** No ambient motion window lasts longer than 5 s. Afterwards the rAF count stays flat and hero pixels are identical over 1 s. Pointer entry into the sign, a tap on it, hero re-entry and tab return each start one new window.
- [ ] **Stopping when unseen.** The loop stops when the hero is off-screen or the tab is hidden, which is verified by counting rAF calls. Context loss returns the photo.
- [ ] **Auto-degrade.** The degrade path is verified by simulating slow frames.
- [ ] **No flashing.** No area changes luminance by more than 10% more than 3 times per second (WCAG 2.3.1).
- [ ] **Hero contrast.** Hero text meets AA in the brightest measured frame.
- [ ] **Hover states.** Every hover state also works on `:focus-visible`, doesn't stick on touch, and is off under reduced motion.
- [ ] **Program filter.** All existing Program filter, no-JS and hosting e2e tests pass unchanged.
- [ ] **Budgets and policy.** Budgets are held: JS within the ceiling Q approves, CSS ≤ 48 KiB (44.6 KiB on 23 September), HTML ≤ 24 KiB (20.8 KiB). There are no raw colours outside `tokens.css`, and no new dependency or third-party request.
- [ ] **Real devices.** On a mid-range Android phone (Chrome) and an iPhone (Safari), the hero shader averages 50 fps or more over 2 minutes with no visible jank. Colour matches the photo; watch for Safari P3/sRGB drift.

## Verification plan

1. **While working:** targeted ESLint, Stylelint and Prettier on touched files, `npm run check`, the affected unit tests, and Chromium Home and Program e2e runs.
2. **Before review:** the complete local gate in `docs/quality-gates.md`, all five browser profiles, `npm run evidence:home` and `npm run evidence:program`.
3. **New evidence:** shader running, resting, off and with reduced motion at 375, 768 and 1440 px; short screen recordings of the glint, the 5-second rest and the cursor lantern.
4. **Manual checks:** keyboard pass through every hover state, 200% zoom, forced colours, a real-device fps log, and a written comparison against the prototype.

## Risks

- **Weak GPUs and battery:** mitigated by the auto-degrade logic, stopping when unseen, and the loop being idle outside the 5 s windows.
- **Tight CSS budget:** about 3.4 KiB of headroom is left, so the hover CSS must stay small.
- **Safari colour management:** WebGL may render slightly differently from the `<img>`. It's checked on an iPhone and falls back to the photo if the difference is visible.
- **Replacing the hero photo:** a new photo needs a new sign box. The unit test catches a missing one.

## Stop point

Open a PR with the evidence above and record it in Linear. Stop before merge, deployment or marking the issue Done.

- [ ] Q approval
