# Private owner preview deployment

The only approved hosted state is a password-protected, non-indexable sales preview. It is not the
official Mike's Pub website.

## Architecture

- Astro builds portable static files into `dist/`.
- Cloudflare Pages serves those files through `functions/_middleware.ts`.
- The middleware runs before every page and asset, so there is no public bypass path.
- `PREVIEW_PASSWORD` exists only as an encrypted Cloudflare secret.
- `www.mikespub.no` is a GoDaddy-managed CNAME to the Pages project.
- `mikespub.no` temporarily forwards to `https://www.mikespub.no`.

## Local verification

1. Copy `.dev.vars.example` to ignored `.dev.vars`.
2. Replace the example with a unique passphrase of at least 12 characters.
3. Run `npm run preview:protected`.
4. Verify a private window cannot load `/`, `/program`, `/_astro/*` or `/404.html` before login.
5. Verify the correct password returns to the originally requested path.

Never put the real passphrase in a command, documentation, screenshot, Git commit or `PUBLIC_`
Astro variable.

## First deployment

1. Sign in to the Cloudflare account owned by Q.
2. Run `npm run cloudflare:login` if Wrangler is not authenticated.
3. Create the direct-upload project with
   `npm run cloudflare:create-project`.
4. Run `npm run cloudflare:set-password` and type the passphrase only into Wrangler's masked prompt.
5. Run `npm run deploy:protected`.
6. Test the generated `mikes-pub-private-preview.pages.dev` URL before connecting DNS.
7. In Cloudflare Pages, add `www.mikespub.no` as a custom domain before adding its GoDaddy CNAME.
8. In GoDaddy DNS, replace the generated website-builder `www` record with a CNAME to
   `mikes-pub-private-preview.pages.dev`.
9. Forward the apex domain to `https://www.mikespub.no` with a temporary redirect.

Cloudflare custom-domain association must happen before the CNAME or the hostname will not activate.
DNS and certificate propagation can take time. Do not remove password protection, the concept
banner, `noindex` metadata or response-level `X-Robots-Tag` for this preview.

## Password rotation and removal

- Rotate: run `npm run cloudflare:set-password`, then verify old and new browser sessions.
- Local sign-out endpoint: send `POST /__preview/logout`; changing the password invalidates all old
  cookies immediately.
- Take down: remove GoDaddy forwarding/CNAME first, then delete the Pages custom domain and project.
