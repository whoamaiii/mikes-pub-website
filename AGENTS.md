# Mike's Pub Website — Agent Instructions

## Mission

Build a professional, commercially sellable and maintainable website for Mike's Pub in Sætre, Norway. This is not a hobby project. Optimize for reliability, accessibility, privacy, clear ownership, easy content updates and long-term handover.

## Authority

Use this order when instructions conflict:

1. Q's explicit instruction in the active session.
2. The active Linear issue and latest comments.
3. WHO-31 and the Codex Mac Execution Protocol.
4. Approved scope, verified facts, rights and compliance records.
5. Approved design/behaviour specifications and ADRs.
6. Accepted code and tests in this repository.

Stop and ask Q if authoritative sources conflict. Never silently choose. Read only the active Linear issue, its blockers and directly relevant links. Do not reread or reproduce the whole project.

## Rejected work

The scratch prototype created before this fresh Mac repository was rejected in full. Treat it as nonexistent. Never retrieve, copy, imitate, refactor, deploy or cite it as completed work. Generated mockups are visual references only, never production assets.

## One issue at a time

- Work on exactly one unblocked Linear issue.
- Do not continue into another issue automatically.
- Do not expand scope because adjacent work looks useful.
- Propose a follow-up issue for out-of-scope discoveries; do not implement them.
- Keep at most one primary implementation issue In Progress.
- Q is the approval gate for scope, UI and completion.
- Never mark an issue Done merely because code builds or tests pass.

## Mandatory workflow

### 1. Orient

Before edits:

- Confirm repository, branch, active issue and blockers.
- Inspect `git status`; preserve user changes.
- Read only relevant files and documents.
- Check Definition of Ready.
- Identify likely files, risks, assumptions and the smallest adequate verification plan.

### 2. Plan and stop

Present a concise plan with scope, exclusions, likely files, tests and blocking questions.

**STOP and wait for Q before editing**, unless Q explicitly requested immediate implementation in the current prompt.

### 3. Implement narrowly

After approval:

- Change only what the active issue requires.
- Prefer simple, readable platform/framework primitives.
- Separate content, presentation and external-service adapters.
- Do not add speculative abstractions, fallbacks or future features.
- Preserve unrelated user changes.

### 4. Verify and stop

Run targeted checks during iteration and the full relevant gate before review. Report outcome, changed files, commands/results, acceptance status, content/asset provenance and limitations.

If Q authorized end-to-end delivery in the approved plan or active prompt, continue through routine edits, checks, commit, push and PR without repeated approval requests. Otherwise stop before the first unauthorized external action. Always stop before merge, deployment, paid-service changes or Linear completion unless those actions were explicitly included.

## GPT-5.6-Sol usage discipline

AGENTS.md cannot select model, effort, speed or permissions; Q controls those in Codex.

- Intended model: GPT-5.6-Sol.
- Q may select any available reasoning effort from normal/default through the maximum level.
- Work correctly at the selected effort; do not warn merely because Q chose a higher or lower level.
- Never change, downgrade or upgrade Q's selected model or reasoning effort.
- Never spawn subagents unless Q explicitly asks in the current prompt.
- Never delegate, parallelize through agents or launch background agents automatically.
- If Q requests subagents, first confirm their exact number, bounded tasks and stop point; do not create an open-ended agent tree.
- Do not enable Fast mode unless Q explicitly selects it.
- Higher/max reasoning does not expand scope, remove stop points or authorize extra subagents.
- Do not use expensive modes to compensate for an unclear prompt; clarify scope instead.
- Keep analysis and updates concise; do not restate entire specifications.
- Prefer targeted `rg` and file reads over broad scans.
- Batch independent read-only checks when useful.
- Do not reread unchanged files or repeat completed searches.
- Use existing evidence before another tool call.
- Research the web only when current/external facts are required.
- After two materially similar failed attempts, stop and report instead of looping.
- Run the smallest relevant test first; reserve full suites for review gates.
- Stop when acceptance criteria pass. Do not keep polishing without a request.
- Every long task must have an explicit stop point; if none exists, propose one and wait for Q.

## Permission model

- Intended Codex permission mode: Full Access, selected by Q in the CLI.
- Do not repeatedly request approval for routine in-scope file edits, commands, tests, builds or network access after Q approves the plan.
- Approval of a plan authorizes every clearly listed, reversible implementation step in that plan.
- If the approved plan names a dependency, branch, commit, push or PR, perform it without asking again.
- Full Access is technical permission, not permission to change scope or make business decisions.
- Still stop for destructive Git/history operations, secrets/credentials, repository visibility changes, paid services, production data, merge, deployment, publication or material scope/architecture changes unless explicitly authorized.

## Definition of Ready

An issue is ready only when blockers are Done, scope is unambiguous, relevant sources are linked, acceptance criteria are testable, facts/assets are verified or safely substituted, material decisions are resolved, and Q has named any required workflow. Otherwise report the blocker and do not code.

## Definition of Done

Done requires all acceptance criteria, relevant formatting/lint/type/test/build checks, appropriate accessibility/browser evidence, desktop/mobile evidence for UI work, no unverified claims or assets, documented dependency/licence changes, updated docs/ADR when behaviour changed, required validation evidence (hosted CI when available; otherwise the complete documented local gate approved by Q), known limitations, and explicit Q approval.

## Git and public-repository safety

- One issue per branch; include the WHO issue ID.
- Do not commit directly to `main` unless Q explicitly authorizes it.
- Use small intentional commits and inspect the diff first.
- Do not amend, force-push, rewrite history, delete branches or run destructive Git commands without approval.
- Do not commit dependencies, builds, caches, logs, secrets or local environment files.
- Commit/push/open a PR without re-asking when they are included in Q's approved plan or active prompt; otherwise stop at the workflow boundary.

This repository is currently public by Q's decision. Until it becomes private, never commit secrets, credentials, personal data, contracts, private notes, client account details, unapproved pub assets, private demo passwords or protected deployment configuration.

## Project gates

- WHO-14 is infrastructure only: no product UI.
- WHO-32 is the mandatory fresh UI/UX planning gate.
- Do not implement design system, homepage, mobile navigation or Program before WHO-32 approval.
- Do not deploy before WHO-19 QA passes.
- Do not select or implement a production CMS before WHO-23 and client approval.

## Facts, content, rights and compliance

- Never invent opening hours, contacts, event dates, policies or services.
- Distinguish verified, likely, unknown and demo-only content.
- No production fact without a source, owner and verification status.
- No asset without recorded ownership, permitted use, modification rights, duration and credits.
- Generated mockups cannot replace licensed production photography.
- Add no analytics, pixels, cookies, embeds, forms, maps, booking or third-party scripts without an approved issue.
- Preserve Norwegian privacy, accessibility and alcohol-marketing constraints.

## Engineering principles

Follow accepted ADRs. The planning baseline is static-first Astro with strict TypeScript, but initialize/change the stack only when the active issue authorizes it.

Prefer semantic HTML, progressive enhancement, minimal client JavaScript, centralized tokens, reusable components with explicit contracts, typed validation, stable identifiers, portable content/hosting, and documented ownership/recovery.

Accessibility includes keyboard operation, visible focus, headings, landmarks, contrast, zoom/reflow, reduced motion and meaningful alternatives.

Event facts must not be hard-coded in presentation components. Use a typed validated content boundary that can later connect to an approved CMS. Support draft, scheduled, cancelled, postponed, completed, empty, expired and missing-image states.

## Dependencies

Before adding a runtime dependency, present the exact problem, why existing code is insufficient, licence, maintenance status, security/bundle impact and removal path. Approval of a plan that names the dependency counts as approval; do not ask twice. Keep dependencies few and purposeful.

## Commands and verification

Discover commands from repository files; do not invent them or claim checks passed without running them. Use proportionate formatting, lint, type, unit/component, E2E, accessibility, production-build and browser checks.

Automated accessibility tests are not proof of conformance; include relevant manual keyboard, focus, zoom/reflow and visual review.

Hosted GitHub Actions remains configured and is preferred when available. If it is unavailable for account, billing or platform reasons and Q approves the fallback, the complete local gate documented in `docs/quality-gates.md` is authoritative. An actual formatting, lint, type, test, browser, accessibility, security or build failure remains blocking in either mode. Rerun the complete required gate after every subsequent change before recording final evidence.

## Linear evidence

Before requesting approval, record outcome/scope, files changed, acceptance checklist, exact checks/results, required validation/preview/screenshots, facts/assets and their status, known limitations/follow-ups, and an incomplete Q-approval checkbox.

## Stop conditions

Stop and ask Q when facts/rights are missing, the issue is blocked, required tools are unavailable, repository changes are unexplained, criteria conflict, visual requirements are materially ambiguous, work needs a dependency/integration/account/cost/architecture change, compliance may weaken, or completion requires unrelated work.

Do not solve material ambiguity by guessing.
