# ADR-002: Password-protected private preview deployment

- **Status:** Accepted for the owner sales preview
- **Date:** 19 July 2026
- **Authority:** Q's explicit deployment and password-protection approval in the active session

## Context

The sales demo needs a real URL that Q can share with the prospective owner without presenting the
proposal as Mike's Pub's official public website. GoDaddy Websites + Marketing cannot upload the
portable Astro build or provide the required server-side password boundary.

## Decision

Keep Astro's portable static `dist/` output and deploy it to Cloudflare Pages by direct upload. A
Pages Function runs before every route and asset, renders a branded Norwegian password screen and
serves the static output only after a valid encrypted-secret-backed session is present.

The preview password is stored only as Cloudflare's encrypted `PREVIEW_PASSWORD` secret. The
repository contains the variable name and validation rules, never the value. The session cookie is
HttpOnly, Secure, SameSite Strict, host-only and valid for seven days. Version 2 signs the issue time,
expiry time and a random per-login nonce, and enforces expiry on the server for every page and asset.
Legacy timeless tokens are rejected. Every response remains non-indexable and non-cacheable.

Use `www.mikespub.no` as the Cloudflare Pages custom subdomain while GoDaddy remains authoritative
for DNS. The apex `mikespub.no` may temporarily forward to the protected `www` URL. This avoids a
nameserver migration and keeps domain ownership with Q.

## Consequences

- The core site remains a portable static Astro build; Cloudflare is a removable preview-hosting
  adapter rather than a content or application dependency.
- Anyone who receives the shared password can pass it on. This is appropriate for a low-sensitivity
  sales preview, but it is not individual user authorization or digital-rights management.
- Changing `PREVIEW_PASSWORD` invalidates every existing session cookie.
- Logout clears the cookie in that browser. This stateless preview has no per-session revocation
  store: a copied token remains usable until its signed expiry or password rotation. Immediate
  revocation of an individual session requires a separately approved persistent session service.
- Cloudflare account recovery and GoDaddy domain recovery must remain under Q's control.
- Remove this deployment by deleting the Pages project, DNS/forwarding records, `functions/`,
  `wrangler.jsonc`, the preview scripts and Wrangler dependency. The static site remains buildable.
