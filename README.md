# Mike's Pub website

Infrastructure baseline for the Mike's Pub website project in Sætre, Norway. WHO-14 deliberately
contains no product pages, components, visual design, content or assets.

## Current boundary

- Static-first Astro project with strict TypeScript and plain CSS when UI work is later approved.
- No server runtime, CMS, database, authentication, analytics, forms, maps or embeds.
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

| Command                | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev`          | Start Astro's local development server.                       |
| `npm run build`        | Produce the portable static `dist/` output.                   |
| `npm run preview`      | Preview an existing production build locally.                 |
| `npm run format`       | Format supported repository files.                            |
| `npm run format:check` | Check formatting without changing files.                      |
| `npm run lint`         | Run ESLint and Stylelint.                                     |
| `npm run check`        | Run Astro and TypeScript checks.                              |
| `npm run test:unit`    | Run infrastructure policy tests.                              |
| `npm run test:e2e`     | Build and run infrastructure checks in five browser profiles. |
| `npm run verify`       | Run the local non-browser quality gate.                       |

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
src/pages/.gitkeep       Required empty Astro pages directory; no UI exists in WHO-14
tests/unit/              Repository-policy tests
tests/e2e/               Infrastructure-only browser tests
```

Product directories and files will be created only by their approved Linear issues after WHO-32.

## Documentation

- [Architecture decision](docs/adr/0001-static-first-architecture.md)
- [Dependencies and licences](docs/dependencies.md)
- [Environment safety](docs/environment.md)
- [Quality gates](docs/quality-gates.md)
- [Security reporting](SECURITY.md)

## Licence

The project is proprietary and marked `UNLICENSED`. See [LICENSE.md](LICENSE.md).
