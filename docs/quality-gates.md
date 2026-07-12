# Quality gates

Every proposed change must pass the same commands locally and in GitHub Actions.

## Local gate

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run check`
5. `npm run test:unit`
6. `npm run build`
7. `npm audit --audit-level=high`
8. `npm run test:e2e`

The Playwright configuration contains Chromium, Firefox, WebKit, Mobile Chrome and Mobile Safari.
WHO-14 exercises only the static preview infrastructure and an intentionally missing probe route; it
does not create or test product UI.

`@axe-core/playwright` is installed for accessibility checks once an approved UI exists. Automated
checks never replace manual keyboard, focus, reading-order, zoom/reflow, reduced-motion, contrast and
real-device review.

Stylelint currently covers external `src/**/*.css` files. Component-scoped Astro `<style>` blocks
must not be introduced until a later approved dependency decision adds compatible Astro style
parsing or the approved UI architecture requires external styles only.

WHO-14 builds zero pages, so a numeric product performance budget would be untestable and invented.
The accepted ADR requirement remains an explicit open decision for WHO-32/WHO-19, when approved UI
assets, CSS and client-JavaScript behavior exist to measure.

## Hosted gate

GitHub Actions runs quality, browser and dependency-review jobs. Action versions are pinned to full
commit SHAs, and the repository policy test rejects future mutable remote Action references.
Dependency updates are proposed weekly for npm and GitHub Actions and must pass CI. A separate weekly
scheduled CI run refreshes the dependency audit and browser infrastructure even when no pull request
or push occurs; Q can also trigger the workflow manually.

Generated `dist/`, Playwright reports and test output are evidence only and are not committed.
