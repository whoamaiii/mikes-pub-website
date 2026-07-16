# Mike's Pub website

Static-first Astro website with responsive Home and Program routes and a reusable coded design
system for the Mike's Pub website project in Sætre, Norway. Other product routes remain deferred.

## Current boundary

- Static-first Astro project with strict TypeScript, native components and plain external CSS.
- WHO-18 provides the first approved responsive product route at `/` with verified concept content.
- WHO-20 provides an honest Program route at `/program`. Until verified events exist, the route
  presents clearly labelled, date-neutral concept examples (validated demo-only records) so the
  directory and filters are demonstrable; verified events replace them without layout changes.
- WHO-15 components and tokens are available through an isolated local-only preview build.
- No server runtime, CMS, database, authentication, analytics, forms, third-party maps or embeds.
  Home uses a code-native locator diagram paired with an explicit Google Maps directions link.
- The repository is currently public by Q's explicit decision. Do not add secrets, private sales
  material, client credentials, protected deployment configuration or unapproved assets.
- Repository visibility must be reviewed before private demo content or protected deployment
  configuration is introduced.

## Requirements

- Node.js 24.18.0, activated through a version manager
- npm 11.16.0, bundled with the approved Node release

With `fnm`:

```sh
fnm install
fnm use
npm ci
```

## Commands

| Command                               | Purpose                                                       |
| ------------------------------------- | ------------------------------------------------------------- |
| `npm run dev`                         | Start Astro's local development server.                       |
| `npm run build`                       | Produce the portable static `dist/` output.                   |
| `npm run build:design-system-preview` | Build the isolated component preview.                         |
| `npm run preview`                     | Preview an existing production build locally.                 |
| `npm run preview:design-system`       | Serve the isolated component preview locally.                 |
| `npm run format`                      | Format supported repository files.                            |
| `npm run format:check`                | Check formatting without changing files.                      |
| `npm run lint`                        | Run ESLint and Stylelint.                                     |
| `npm run check`                       | Run Astro and TypeScript checks.                              |
| `npm run test:unit`                   | Run infrastructure policy tests.                              |
| `npm run test:e2e`                    | Run production and component-preview checks in five profiles. |
| `npm run evidence:design-system`      | Capture ignored WHO-15 visual evidence.                       |
| `npm run evidence:mobile-navigation`  | Capture ignored WHO-17 navigation evidence.                   |
| `npm run evidence:home`               | Capture ignored WHO-18 Home evidence.                         |
| `npm run test:e2e:program`            | Run the targeted WHO-20 Chromium browser checks.              |
| `npm run evidence:program`            | Capture ignored WHO-20 Program evidence.                      |
| `npm run verify`                      | Run the local non-browser quality gate.                       |

## Validation policy

Hosted GitHub Actions remains configured and is the preferred validation path when it is available.
If Actions cannot run for account, billing or platform reasons, the complete local gate in
[`docs/quality-gates.md`](docs/quality-gates.md) is authoritative when Q has approved that fallback.

An unavailable hosted runner is not a passed check, but it is also not a code or test failure. Any
actual local formatting, lint, type, test, browser, accessibility, security or build failure remains
blocking. Rerun the complete required gate after every subsequent change before recording final
evidence.

## Repository structure

```text
.github/                 GitHub Actions and dependency update policy
docs/                    Architecture, dependency, environment and quality documentation
src/env.d.ts             Astro type references
src/pages/               Approved responsive Home and Program routes
src/assets/images/       Rights-recorded, optimized Home derivatives
src/components/          Reusable WHO-15 native Astro components
src/data/                Typed, source-classified page content
src/styles/              Frozen tokens and external CSS foundations
public/fonts/            Approved self-hosted OFL font binaries
LICENSES/                Upstream font copyright and licence text
tests/design-system-preview/  Isolated, non-production component preview
tests/unit/              Repository and design-system policy tests
tests/e2e/               Production and isolated-preview browser tests
```

The Home build uses Astro's local image pipeline to generate responsive WebP widths from the two
approved art-directed derivatives. The source crops, alternative text and focal points remain
unchanged; viewport-matched preload metadata reuses the same generated source sets.

All product routes beyond Home and Program remain deferred to their dedicated Linear issues.

## Documentation

- [Architecture decision](docs/adr/0001-static-first-architecture.md)
- [Dependencies and licences](docs/dependencies.md)
- [Coded design system and font provenance](docs/design-system.md)
- [Home asset provenance](docs/assets/home-assets.md)
- [Environment safety](docs/environment.md)
- [Quality gates](docs/quality-gates.md)
- [Security reporting](SECURITY.md)

## Licence

The project is proprietary and marked `UNLICENSED`. See [LICENSE.md](LICENSE.md).
