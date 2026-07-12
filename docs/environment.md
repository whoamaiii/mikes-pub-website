# Environment safety

WHO-14 requires no environment variables, credentials or deployment configuration.

## Rules

- Real values belong only in ignored local `.env` files or an approved secret store.
- `.env`, `.env.*`, `.envrc` and `.direnv/` are ignored; `.env.example` is the only committable
  environment file.
- Commit variable names and safe explanatory comments only in `.env.example`.
- Never commit tokens, credentials, personal information or private client data.
- Astro variables prefixed with `PUBLIC_` are bundled into browser-visible code and must never contain
  secrets.
- Do not introduce CI secrets, deployment variables or protected configuration without an approved
  issue and a visibility/privacy review.
- If a secret is exposed, revoke or rotate it immediately. Removing it from the newest commit does
  not remove it from Git history.

The repository policy test rejects tracked environment files other than `.env.example`, rejects
tracked `.direnv/` content and rejects Finder `.DS_Store` metadata.
