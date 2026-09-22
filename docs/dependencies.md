# Dependencies and licences

All packages are development/build tooling; the generated static site has no Node.js server runtime.
Exact resolved versions and transitive packages are recorded in `package-lock.json`.

| Package                     | Version | Licence           | Purpose                                              |
| --------------------------- | ------: | ----------------- | ---------------------------------------------------- |
| Astro                       |   7.3.1 | MIT               | Static site framework and build output               |
| TypeScript                  |   6.0.2 | Apache-2.0        | Strict static type checking                          |
| `@types/node`               | 24.13.3 | MIT               | Node 24 API types                                    |
| `@astrojs/check`            |   0.9.9 | MIT               | Astro and TypeScript diagnostics                     |
| ESLint                      |  10.7.0 | MIT               | JavaScript and TypeScript lint engine                |
| `@eslint/js`                |  10.0.1 | MIT               | Official ESLint flat recommended rules               |
| `eslint-plugin-astro`       |   3.0.0 | MIT               | Astro-aware lint rules                               |
| `typescript-eslint`         |  8.63.0 | MIT               | TypeScript parser and lint rules                     |
| Stylelint                   | 17.14.0 | MIT               | CSS lint engine                                      |
| `stylelint-config-standard` |  40.0.0 | MIT               | Standard CSS rules                                   |
| Prettier                    |   3.9.5 | MIT               | Deterministic formatting                             |
| `prettier-plugin-astro`     |  0.14.1 | MIT               | Astro formatting support                             |
| Vitest                      |  4.1.11 | MIT               | Unit and repository-policy tests                     |
| Playwright Test             |  1.61.1 | Apache-2.0        | Browser regression infrastructure                    |
| `@axe-core/playwright`      |  4.12.1 | MPL-2.0           | Automated accessibility checks for later approved UI |
| Wrangler                    | 4.136.2 | MIT OR Apache-2.0 | Cloudflare Pages local runtime and direct deployment |

GitHub Actions use official releases pinned to complete immutable commit SHAs. Checkout, setup-node,
upload-artifact and dependency-review-action are MIT licensed and affect CI only.

Astro resolves MIT-licensed `esbuild@0.28.1` transitively. Its required platform-binary install
script is explicitly pinned in npm's `allowScripts` policy; all other unreviewed dependency scripts
remain blocked.

Playwright and Vite resolve optional MIT-licensed macOS file watchers `fsevents@2.3.2` and
`fsevents@2.3.3`. Their native install scripts are also pinned explicitly so clean Mac installs do
not broaden script permission to other versions or packages.

Wrangler resolves Apache-2.0 `workerd@1.20260921.1`; its pinned install script selects Cloudflare's
matching local runtime binary and is explicitly allowed. The lockfile resolves Apache-2.0
`sharp@0.35.4` for both Astro and Miniflare; it has no install script. Unreviewed scripts remain
blocked by default.

The Q-approved 6 September 2026 security update pins Astro 7.3.1 and Wrangler 4.129.0 and refreshes
the affected transitive packages, including PostCSS, Nanoid, js-yaml, fast-uri and brace-expansion.
It introduces no direct dependencies or product features. The framework and deployment-tool
updates retain the existing static output, Node 24 requirement and documented removal paths.

The Q-approved 22 September 2026 hosting-readiness fixes update Vitest to 4.1.11 and Wrangler to
4.136.2, with compatible transitive updates including SVGO 4.1.0, devalue 5.9.4 and colord 2.10.0.
This removes the affected older sharp copy from Miniflare and addresses the known npm advisories
found during the hosting audit. There are no new direct dependencies or browser runtime libraries.
The existing test/deployment-tool licences and removal paths remain applicable. Validation results
are recorded separately for the reviewed working tree; these versions are not a promise against
future advisories.

No package is admitted to justify a product feature in WHO-14. Remove a tool by deleting its config,
scripts and direct package entry, then regenerate the lockfile and rerun all remaining gates.

## Self-hosted font assets

The project adds no runtime font dependency. It self-hosts six WOFF2 files plus one TTF so typography
works without a third-party request. The fonts remain under SIL Open Font License 1.1; the
application remains proprietary and `UNLICENSED`.

| Family           | Version and commit                                   | Files                               | Licence                                 | Runtime/security impact                                                               | Removal path                                                                       |
| ---------------- | ---------------------------------------------------- | ----------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Barlow Condensed | `1.422`, `697600fcece1685b0ba409eb82868546def9a84e`  | Medium 500, SemiBold 600, Bold 700  | `LICENSES/barlow-condensed-OFL-1.1.txt` | SemiBold and Bold are active local heading faces; Medium is retained for traceability | Replace the heading token and face rules, then delete the three files and licence  |
| Source Sans 3    | `3.052R`, `ed1808970eb3c7301c9a523bee26473ba0bb62fa` | Regular 400, Semibold 600, Bold 700 | `LICENSES/source-sans-3-OFL-1.1.md`     | Static local WOFF2 only; no script or network request; SHA-256 policy enforced        | Delete three files, licence and matching `@font-face` rules; body fallback remains |
| UnifrakturCook   | Google Fonts specimen, local pinned bytes            | Bold 700                            | `public/fonts/unifraktur-cook/OFL.txt`  | Static local TTF only; no script or network request; SHA-256 policy enforced          | Delete the TTF, licence and matching `@font-face`; serif fallback remains          |

Exact upstream paths, copyrights and SHA-256 hashes are recorded in
[`docs/design-system.md`](design-system.md). The small SVG icon subset is original repository code,
not a dependency or third-party asset.

## Admission review

Reviewed on 12 July 2026 against the npm registry, the accepted ADR and the locked dependency graph.

| Group                                                                                                                                       | Exact problem and why built-ins are insufficient                                                                                                                                          | Maintenance and security posture                                                                                                                                                  | Runtime impact and removal path                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Astro, TypeScript, `@types/node`, `@astrojs/check`                                                                                          | Native HTML and Node do not provide the accepted static component build, Astro diagnostics or strict typed project boundary.                                                              | Compatible maintained releases were selected; TypeScript 6 is inside both checker and linter peer ranges. Clean npm and OSV audits found no known vulnerabilities at review time. | Build/type tooling only; no Node server ships. Replacing it requires an approved ADR, a replacement static build, and removal of the Astro/TypeScript configs and scripts.     |
| ESLint, `@eslint/js`, `eslint-plugin-astro`, `typescript-eslint`, Stylelint, `stylelint-config-standard`, Prettier, `prettier-plugin-astro` | The language and framework compilers do not enforce repository-wide code, Astro, CSS or formatting rules.                                                                                 | Exact current compatible releases were registry-verified. The lockfile has integrity hashes and npm reports a valid peer tree and no known vulnerabilities at review time.        | Development-only; no production bundle impact. Remove the relevant config and scripts, uninstall the group, regenerate the lockfile, and replace the lost gate before merging. |
| Vitest, Playwright Test, `@axe-core/playwright`                                                                                             | Node/Astro do not supply unit testing, five-engine browser automation or automated accessibility analysis.                                                                                | Exact compatible releases were registry-verified; browser binaries are installed by Playwright in CI. npm and OSV found no known vulnerabilities at review time.                  | Test-only; no production bundle impact. Remove test/config files and scripts only after an approved replacement preserves equivalent evidence.                                 |
| Wrangler                                                                                                                                    | GoDaddy's site builder cannot run the server-side password boundary or upload the portable Astro output; Cloudflare's supported CLI provides local Pages emulation and direct deployment. | Exact version and dual MIT/Apache-2.0 licence were registry-verified. It is maintained by Cloudflare and is used only for the approved preview host.                              | Development/deployment only; no browser bundle impact. Delete the Pages project, deployment files and scripts, uninstall Wrangler and regenerate the lockfile to remove it.    |
| GitHub checkout, setup-node, upload-artifact and dependency-review Actions                                                                  | GitHub runners do not natively check out this repository, install its exact Node release, retain failed browser evidence or review dependency diffs.                                      | Official current releases and MIT licences were verified against their GitHub repositories. Every reference is pinned to the release's immutable 40-character commit SHA.         | Hosted-CI only; no site bundle impact. Remove or replace a step only when the same gate and least-privilege permissions remain covered.                                        |

All 514 installed registry packages had valid npm signatures during the 19 July 2026 review; 145 also supplied
verified attestations. These are dated findings, not a guarantee against future disclosures.
