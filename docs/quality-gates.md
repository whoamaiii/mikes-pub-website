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

When available, GitHub Actions runs quality, browser and dependency-review jobs. Action versions are pinned to full
commit SHAs, and the repository policy test rejects future mutable remote Action references.
If Actions cannot start, leave the workflows configured and use the complete local gate above; do not
claim that hosted CI passed. Dependency updates are proposed weekly for npm and GitHub Actions and
must pass the required validation gate. A separate weekly scheduled CI run refreshes the dependency
audit and browser infrastructure when hosted Actions is available; Q can also trigger the workflow
manually.

Generated `dist/`, Playwright reports and test output are evidence only and are not committed.
