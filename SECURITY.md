# Security policy

Do not open a public issue containing a credential, private client information or an exploitable
security detail.

Use GitHub private vulnerability reporting only when the repository's Security settings show it is
enabled. Otherwise, contact the repository owner through an existing private channel. If no private
channel is available, open a public issue that asks for one without including vulnerability details.

If a credential is exposed, revoke or rotate it first; deleting it from a later commit is not
sufficient.

The repository currently requires no application or deployment secrets. GitHub secret scanning and
push protection are enabled while the repository is public.
