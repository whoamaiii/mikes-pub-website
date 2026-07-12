# ADR-001: Static-first sales demo architecture

- **Status:** Accepted
- **Date:** 12 July 2026
- **Authority:** Linear WHO-13 and its accepted ADR-001

## Decision

Use Astro with native `.astro` components, strict TypeScript, semantic HTML and plain modern CSS.
Production output is a portable static `dist/` directory. Client JavaScript is allowed only for
verified interactions and essential information must work without it.

Node.js 24 LTS is used for development and CI, with the exact release in `.nvmrc`, npm's lockfile
committed and `npm ci` used in CI.

## Exclusions

React, Vue, Svelte, Tailwind, UI or animation frameworks, server runtime, database, authentication,
CMS, analytics, forms, maps, social embeds, booking, domain and production hosting are excluded from
the baseline.

## Consequences

- Static delivery limits privacy, security and operational exposure.
- Native platform and Astro primitives keep ownership and handover understandable.
- Typed content boundaries can later support an approved CMS without coupling page components to a
  vendor.
- Browser and accessibility automation supplements, but never replaces, manual review.

This repository summary does not supersede the authoritative Linear ADR. Material changes require a
new approved architecture decision.
