# Quality gates

Every proposed change must pass the required validation gate. Hosted GitHub Actions remains
configured and is preferred when available. If Actions cannot run for account, billing or platform
reasons, the complete local gate below is authoritative when Q has approved that fallback.

An unavailable hosted runner is neither a pass nor a code failure. Any actual formatting, lint, type,
test, browser, accessibility, security or build failure remains blocking in either validation mode.
Rerun the complete required gate after every subsequent change before recording final evidence.

## Complete local gate

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run check`
5. `npm run test:unit`
6. `npm run build`
7. `npm audit --audit-level=high`
8. `npm run test:e2e`

Then run and record these supply-chain and repository checks:

9. `npm audit signatures`
10. `npm approve-scripts --allow-scripts-pending --json` and confirm no install scripts await approval
11. `npm ls --all`
12. Actionlint against every file in `.github/workflows/`
13. OSV-Scanner against `package-lock.json`
14. Gitleaks against the repository history with redaction enabled
15. Generate an SPDX SBOM with `npm sbom --sbom-format spdx` and confirm every package has a declared licence
16. Confirm each GitHub Action reference is an immutable 40-character commit SHA and matches the intended official release tag
17. Confirm the diff contains no generated output, dependency directory, secret, private environment file, unapproved asset, content or product UI

Use the approved verifier versions, obtain standalone verifiers from their official releases, verify
their published checksums before execution, and record the versions and results with the commit SHA.
Do not bypass dependency resolution, disable checks or suppress compatibility warnings.

The Playwright configuration contains Chromium, Firefox, WebKit, Mobile Chrome and Mobile Safari.
The normal configuration exercises the static production output and intentionally missing routes.
The separate design-system configuration exercises the isolated WHO-15 component preview in the
same five profiles. `npm run test:e2e` runs both configurations.

The production-isolation assertion rejects a built `/design-system/` route, preview fixture marker or
preview-only script in `dist/`. The preview has explicit `srcDir`, `outDir` and `cacheDir` values and
never changes the normal Astro configuration.

Fresh visual evidence is generated with `npm run evidence:design-system`. It captures 1440px, 768px,
375px and 320px views plus focused and forced-colors evidence under ignored `output/playwright/`.
Evidence images and reports are attached to Linear, not committed.

WHO-17 navigation evidence is generated with `npm run evidence:mobile-navigation`. It captures
closed/focused and open/focused states at 320px, 375px, 768px and 1023px, plus navigation focus,
forced-colors, no-JavaScript fallback and 200% layout-equivalent evidence under ignored
`output/playwright/who-17/`. Actual Chrome 200% zoom is verified separately and recorded with the
same review evidence. Rerun both the complete local gate and the WHO-17 evidence command after any
subsequent WHO-17 code or documentation change.

`@axe-core/playwright` is installed for accessibility checks once an approved UI exists. Automated
checks never replace manual keyboard, focus, reading-order, zoom/reflow, reduced-motion, contrast and
real-device review.

Stylelint covers external `src/**/*.css` files. WHO-15 keeps all production component styling in that
external CSS boundary; it introduces no component-scoped `<style>` blocks.

WHO-14 builds zero pages, so a numeric product performance budget would be untestable and invented.
The accepted ADR requirement remains an explicit open decision for WHO-32/WHO-19, when approved UI
assets, CSS and client-JavaScript behavior exist to measure.

## Hosted gate

When available, GitHub Actions runs quality, browser and dependency-review jobs. Action versions are pinned to full
commit SHAs, and the repository policy test rejects future mutable remote Action references.
If Actions cannot start, leave the workflows configured and use the complete local gate above; do not
claim that hosted CI passed. Dependency updates are proposed weekly for npm and GitHub Actions and
must pass the required validation gate. A separate weekly scheduled CI run refreshes the dependency
audit and browser infrastructure when hosted Actions is available; Q can also trigger the workflow
manually.

Generated `dist/`, Playwright reports and test output are evidence only and are not committed.
