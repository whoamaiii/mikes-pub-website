# Coded design system

WHO-15 implements the frozen WHO-10 tokens and WHO-12 component contracts as native Astro
components and external plain CSS. The approved WHO-32 implementation brief governs visual and
responsive decisions. Generated references remain local-only guidance and are never imported.

## Scope

The coded system contains global foundations and reusable primitives for navigation, controls,
filters, event presentation, feedback, location and footer composition. WHO-15 deliberately created
no product route; WHO-18 now composes the accepted system on Home. WHO-17 provides the approved
mobile-navigation behavior, and WHO-20 composes the same system on the private-demo Program route.

## Token policy

Raw palette values exist only in `src/styles/tokens.css`. Production components use semantic aliases.

| Pairing                              | Use                              |
| ------------------------------------ | -------------------------------- |
| Cream on facade or green             | Primary text                     |
| Muted on facade or green             | Secondary text                   |
| Gold on facade or green              | Text, rules and controls         |
| Facade or green on gold              | Filled controls                  |
| Lantern on facade                    | Large, non-essential accent only |
| Cream on gold                        | Prohibited                       |
| Lantern on gold                      | Prohibited                       |
| Lantern on green at normal text size | Prohibited                       |

Spacing follows the frozen 4px scale. Component spacing uses 8/12/16/24px; section spacing uses
48/64/96px. Layout uses 4, 6 and 12 columns with reference breakpoints at 30, 48, 64 and 80rem.
Because native CSS custom properties cannot be used in media conditions, the breakpoint variables
are documented centrally and policy tests reject media queries outside those four values.

Focus uses a 2px cream outline with a 2px offset. Forced-colors mode uses system colors. Reduced
motion reduces non-essential transitions to effectively immediate changes.

## Component boundaries

- `SiteHeader` composes desktop navigation and the WHO-17 mobile-menu boundary.
- `MobileMenuTrigger` renders only the controller-owned closed state. Callers cannot set runtime
  expanded or disabled state.
- `MobileMenu` progressively enhances a complete server-rendered `details` disclosure to a native
  modal `dialog` only after capability and element validation. Unsupported or disabled JavaScript
  therefore never exposes a dead button.
- The dependency-free controller owns accessible naming, focus entry/containment/return, Escape and
  close actions, native modal inertness, scroll restoration and 1024px breakpoint cleanup. It adds
  no backdrop-click dismissal or motion.
- `CategoryFilter` renders supplied URLs and optional current state. WHO-20 adds a separate,
  dependency-free Program controller so the component remains presentation-only.
- `EventRow` accepts a status-aware presentation union. Concept rows may omit time; scheduled,
  cancelled and expired rows require time; postponed rows require the prior time and show a
  replacement only when both replacement values exist.
- Draft records have no renderable row variant because WHO-32 forbids publishing them.
- WHO-20 validates its local date-neutral concept boundary. Production publication validation
  remains outside the private-demo component contract.
- Missing optional descriptions, actions and images collapse without broken placeholders.
- `BrandLogo` renders a plain typographic placeholder until an authorized logo master is supplied.

## Local-only preview

The preview uses `astro.design-system-preview.config.mjs` with explicit, separate source, output and
cache directories:

```text
source: tests/design-system-preview/
output: .design-system-preview/dist/
cache:  .design-system-preview/cache/
Vite:   .design-system-preview/vite-cache/
route:  /design-system/ (preview build only)
```

Run it locally with:

```sh
npm run build:design-system-preview
npm run preview:design-system
```

The production `astro.config.mjs` remains unchanged. Production isolation tests require the normal
build to contain no design-system route, preview fixture marker or preview-only script. Preview
fixtures are explicitly non-factual and are never loaded by product components.

WHO-17 behavior remains covered by this isolated preview and is also composed by the approved WHO-18
Home route. Navigation evidence is generated under ignored `output/playwright/who-17/`; it is never
part of the production build.

## Font provenance and integrity

Font software remains under its upstream SIL Open Font License 1.1 and is separate from the
repository's proprietary `UNLICENSED` application code.

### Barlow Condensed

- Copyright: 2017 The Barlow Project Authors
- Upstream tag: `1.422`
- Pinned commit: `697600fcece1685b0ba409eb82868546def9a84e`
- Source: <https://github.com/jpt/barlow/tree/697600fcece1685b0ba409eb82868546def9a84e>
- Licence: `LICENSES/barlow-condensed-OFL-1.1.txt`

| Upstream path                                | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `fonts/woff2/BarlowCondensed-Medium.woff2`   | `8b0b644245c0dcb466ef855f77ae775fe6b441a02ae9bc8d5b1740014682798b` |
| `fonts/woff2/BarlowCondensed-SemiBold.woff2` | `21a97c42410e968fbb5bd5d413ad1da01c21d1efce0eb51f03cdcbc899c51459` |
| `fonts/woff2/BarlowCondensed-Bold.woff2`     | `b8c0e6116eab19c30e2529326bc6a459e7c851a9881acc7215dab22ec8014176` |
| `OFL.txt`                                    | `186d750eb496a4c17a76385f82be6aea2ac1cf2de074a811d63786cf374ea73f` |

### Source Sans 3

- Copyright: 2010–2022 Adobe, with Reserved Font Name “Source”
- Upstream tag: `3.052R`
- Pinned commit: `ed1808970eb3c7301c9a523bee26473ba0bb62fa`
- Source: <https://github.com/adobe-fonts/source-sans/tree/ed1808970eb3c7301c9a523bee26473ba0bb62fa>
- Licence: `LICENSES/source-sans-3-OFL-1.1.md`

| Upstream path                              | SHA-256                                                            |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `WOFF2/TTF/SourceSans3-Regular.ttf.woff2`  | `53492fb3a0def77354f166a55d09b63a10855e91c206c7620a81cf56e97f8ec3` |
| `WOFF2/TTF/SourceSans3-Semibold.ttf.woff2` | `47b9b661b9f395fe7f0d0e119637fba5c8dad97bde3df60066fd24229c0792f4` |
| `WOFF2/TTF/SourceSans3-Bold.ttf.woff2`     | `8d35c6d40e750a4ee23bbbba2bd604ad098d172907369b43281507e16b8e2e7a` |
| `LICENSE.md`                               | `89ad2c4f66dd29127527493e729c31e731f111cf10faf5774c3db9275ed0c22c` |

All six `@font-face` rules use `font-display: swap` and approved system fallbacks. Unit tests verify
every binary and licence hash. Removing the fonts means deleting the files, upstream licences and
`@font-face` declarations; the fallback stacks remain usable.

## Icon provenance

`src/components/ui/Icon.astro` contains a small original line-icon set authored for WHO-15. It does
not import, trace or derive paths from an external or generated icon source. The icons are part of
the proprietary application code and can be replaced centrally without changing component APIs.
