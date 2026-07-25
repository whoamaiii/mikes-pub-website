# Environment safety

The Astro application requires no environment variables. The approved private-preview deployment
adds one server-only Cloudflare Pages secret named `PREVIEW_PASSWORD`.

## Rules

- Real values belong only in ignored local `.env` files or an approved secret store.
- For local Pages emulation, copy `.dev.vars.example` to ignored `.dev.vars`; never commit the copy.
- `.env`, `.env.*`, `.envrc` and `.direnv/` are ignored; `.env.example` is the only committable
  environment file.
- The production `PREVIEW_PASSWORD` must be entered into Cloudflare as an encrypted secret, must be
  at least 12 characters and must never appear in a shell command, screenshot or repository file.
- Commit variable names and safe explanatory comments only in `.env.example`.
- Never commit tokens, credentials, personal information or private client data.
- Astro variables prefixed with `PUBLIC_` are bundled into browser-visible code and must never contain
  secrets.
- Do not introduce any additional CI secret, deployment variable or protected configuration without
  a visibility/privacy review and explicit approval.
- If a secret is exposed, revoke or rotate it immediately. Removing it from the newest commit does
  not remove it from Git history.

The repository policy test rejects tracked environment files other than `.env.example`, rejects
tracked `.direnv/` content and rejects Finder `.DS_Store` metadata.
