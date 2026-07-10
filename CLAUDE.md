# PageVault

**PageVault is a fast, self-hosted Notion-style workspace** — pages of blocks (text, headings,
to-dos, quotes, dividers) organized in a nested sidebar tree, all private to each user. The entire
backend is a single **PocketBase** container you run with **`docker compose up`**; there is no cloud
dependency. The client is an **Ionic 8 + React 19** app tuned for desktop/PWA use (with native
mobile shells available via Capacitor).

The architecture, quality bar, and toolchain descend from the **spork** app (`~/repo/spork`) — when a
frontend pattern is unclear, that's the reference. The one deliberate divergence is the backend:
spork uses AWS Amplify; PageVault uses self-hosted PocketBase (see [Decisions](#decisions)).

## How we work together (read this first)

The person directing you may be **non-technical** — an "idea guy" who owns the **product**. They
define **WHAT**: features, intent, and Gherkin acceptance scenarios. **You own the HOW**:
architecture, code quality, testing, and every technical decision below.

- **Never ask them to make a technical call.** Don't surface coverage numbers, CRAP, lint,
  file-length, library choices, or schema design as questions. Decide them yourself, silently.
- **Translate vague ideas into Gherkin.** When they describe a feature, propose concrete `.feature`
  scenarios (Given/When/Then) and confirm those — that's the spec you build to.
- **Only escalate genuine _product_ questions** — ambiguous behavior, scope, copy, what a screen
  should do. Everything technical is yours.

## Workflow: specs-first vertical slices

Every feature ships as one **thin vertical slice** — UI + hook + API + backend collection + tests,
just enough for the scenario, nothing speculative.

1. **Spec first.** Write/confirm Gherkin scenarios in `e2e/features/<slice>/*.feature`, steps in
   `e2e/steps/`.
2. **Scaffold backend only as the slice needs it** — add a PocketBase collection + rules via a new
   `pb_migrations/<timestamp>_*.js` migration for exactly this slice's read/write patterns.
3. **Implement to pass the spec** — follow the architecture and file conventions below.
4. **Run the full quality gate** (`npm run quality`) and get it green locally.
5. **Restart the backend + reseed** if the schema changed (`docker compose up -d --build`,
   `npm run seed`).
6. **Conventional commit, push, CI green.** Open a PR; CI blocks the merge.

### PR titles (what shipped, not the backstory)

The **title** is a conventional-commit line: `type(scope): what changed` — the feature/behavior from
the reader's point of view. No phase numbers, no issue-number soup (reference issues in the body with
`Closes #N`). All context belongs in the description.

Good: `feat(pages): nest pages in the sidebar tree` · `fix(blocks): keep block order after reload`

### PR demo artifacts (screenshot or video of the new feature)

When a PR changes anything a user can **see or interact with**, the description MUST include a
screenshot or short video of it working, generated from the slice's own Gherkin test (Playwright
records a `.webm` with `VIDEO=1`; or `page.screenshot`). Upload to `files.jpc.io` and paste the
permanent `/d/` URL — GitHub renders `.webm`/`.mp4`/`.png`/`.gif` inline. A `curl -I` returning a 307
is expected (it re-signs S3 each render); the `/d/` link never expires. All `aws` calls use
`AWS_PROFILE=personal`; never inline keys.

```bash
FILE_PATH="test-results/<…>/video.webm"
FILENAME=$(basename "$FILE_PATH")
HASH=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 5)
AWS_PROFILE=personal aws s3 cp "$FILE_PATH" \
  "s3://amplify-d1wnjkkkrwiiql-mai-imagehostbucketaac3bfe7-aark0f5h8nw8/public/public/${HASH}-${FILENAME}" \
  --region us-west-2
echo "https://files.jpc.io/d/${HASH}-${FILENAME}"
```

## Stack

- **Client:** Ionic 8 + React 19 + TypeScript (strict), Vite, Capacitor (iOS/Android). Desktop/PWA is
  the primary layout target; the mobile shells reuse the same code.
- **Backend:** **PocketBase** (a single Go binary: auth + SQLite + REST + realtime + file storage),
  run via `docker compose`. Schema is version-controlled JS migrations in `pb_migrations/`.
- **Server state:** `pocketbase` JS SDK wrapped in react-query. No cloud, no AWS.

## Backend: PocketBase via docker-compose

- **`docker-compose.yml`** builds a pinned PocketBase (`Dockerfile`, `PB_VERSION`) and mounts
  `./pb_data` (the SQLite DB + uploads — **gitignored**), `./pb_migrations` (schema), and `./pb_hooks`
  (optional server JS). Admin UI: `http://localhost:8090/_/`. API: `http://localhost:8090/api/`.
- **Schema lives in `pb_migrations/`** — one timestamped `.js` file per change, auto-applied on boot.
  It's the source of truth; `src/lib/pbTypes.ts` is the client's typed view and must be kept in sync.
  A relation field can't be created with a blank `collectionId`, so a self-referential relation (e.g.
  `pages.parent`) is added in a **second** `app.save()` after the collection has an id.
- **Bump `PB_VERSION`** deliberately in both `Dockerfile` and `docker-compose.yml`; migrations replay
  on the new binary. Validate a migration by booting the container (or the raw binary) before shipping.

### Auth & authorization contract (account-first, owner-scoped)

PageVault is **account-first**: notes are private, so there is no guest surface. Every collection is
**owner-scoped** — its list/view/update/delete rules are `owner = @request.auth.id`, and create
requires `@request.auth.id != ''`. The client **stamps `owner` = the current user id** on every
create so the rule passes; a missing/foreign owner returns empty or 403, never another user's data.
The `users` collection is locked to own-record access. Keep this contract on every new collection.

## Code organization (vertical slices)

Features live under `src/features/<feature>/`; tests are colocated. File conventions:

- **`useX.ts`** — hooks hold all logic/orchestration; client state via Context + Hook + Provider
  (`AuthContext.ts` + `useAuth.ts` + `AuthProvider.tsx`).
- **`xApi.ts`** — all server state through react-query wrapping the `pb` client. No PocketBase calls
  in components; no bare `fetch`.
- **`X.tsx`** — components only render.
- **`x.ts`** helpers — pure functions for non-trivial logic (unit-testable, keeps files short) —
  e.g. `pageTree.ts`, `blockText.ts`.
- **`X.css`** — consume the `--pv-*` design tokens / role classes from `src/theme/variables.css`.
  **Never hardcoded hex/px** in feature CSS. Light + dark ship from the same tokens; an explicit
  Light/Dark/System override is applied via `[data-theme]` on `<html>` (`src/features/shell/theme.ts`).

### Load / error / empty states

Every data screen has **four** outcomes. Use the shared `LoadState` component (loading / error-with-
retry / empty / children) on every list + editor screen. Error takes priority over empty. Every fetch
hook exposes `isError` + `refetch` alongside `isLoading` — a hook that only exposes `isLoading` is a
latent infinite-spinner hang.

### Routing (Ionic + react-router v5)

`IonRouterOutlet` matches only its **direct** `<Route>` children — spread routes directly (never wrap
them in a fragment) or later routes get 404-shadowed. See `src/features/shell/Workspace.tsx`.

## Quality gates (non-negotiable — CI + husky pre-commit enforce them)

Run `npm run quality` for the full set. **Enforce them yourself; when one fails, fix the code, never
the gate.** Scope covers `src/` and `seed/` LOGIC; only fixture DATA (`seed/fixtures/**`) and the seed
runner entrypoint (`seed/seed.ts`) are exempt.

- **No `any`, ever.** ESLint `@typescript-eslint/no-explicit-any: error`.
- **Every `.ts`/`.tsx` logic file ≤ 100 lines** (`npm run check:lines`). Over → extract a real helper
  (a sub-hook, a pure function, a subcomponent). Never raise the limit; never game it by deleting
  comments/blank lines.
- **≥ 80% coverage** on every logic file. Fix by writing tests — never exclusions.
- **CRAP ≤ 15 per function** (`npm run crap`).
- **Acceptance tests are always Gherkin** (`.feature` + steps), run via Playwright + playwright-bdd.
  `check:features` fails if a `.feature` file isn't mapped to a CI matrix area.
- **Build must pass** (`npm run build`). **Format clean** (Prettier).
- **Determinism:** pure helpers take injected randomness/time — no bare `Math.random()`/`Date.now()`
  in logic under test.

### Honest e2e

Every data-reading flow asserts on **rendered real (seeded) data**, not just a URL or element
visibility — e.g. reopening a page and asserting the block's actual text is on screen. Wait for the
signed-in session (the sidebar's "+ New page") before reading data on authenticated flows.

## Definition of done

A slice is done only when **all** hold:

1. `npm run quality` green locally (pre-commit enforces it on commit).
2. Gherkin acceptance scenarios + colocated unit tests added and passing.
3. Backend restarted + reseeded if any migration changed (`docker compose up -d --build`, `npm run seed`).
4. Conventional commit, branch pushed, PR open, **CI green**.
5. PR description includes a demo artifact for any user-visible change.
6. README updated if user-facing behavior changed (treat a stale README as a defect).

## Commands

```bash
npm run dev            # Vite dev server (http://localhost:5173)
npm run pb:up          # boot PocketBase via docker compose (http://localhost:8090)
npm run pb:down        # stop PocketBase (pb_data persists)
npm run seed           # reset the test user's workspace to the starter state (idempotent)
npm run quality        # full local gate: lint + format + check:lines + check:features + coverage + crap + build
npm run test:e2e       # Gherkin acceptance tests (bddgen + Playwright)
npm run gen:icons      # regenerate app icons from assets/icon*.png
```

## Key facts

- **Repo:** `johnpc/pagevault`. Bundle id `com.johncorser.pagevault`.
- **Backend URL:** `VITE_PB_URL` (defaults to `http://localhost:8090`). Superuser + test-user creds
  live in `.env.local` (gitignored) and, for CI, the workflow env.
- **Local editor/test user:** `test@example.com` / `TestPassw0rd!` (created by `npm run seed`).
- **CI:** `.github/workflows/ci.yml` — a `quality` job + a Gherkin acceptance **matrix** (one area per
  feature) that boots PocketBase via `docker compose`, seeds it, and runs Playwright. Grows a matrix
  entry per feature area as slices land (`check:features` enforces this).

## Decisions

Significant, hard-to-reverse choices — read before re-opening a settled question.

- **Self-hosted PocketBase, not a cloud backend.** The whole backend is one `docker compose` service
  with a pinned binary + version-controlled migrations. Chosen for zero-dependency self-hosting; the
  user owns their data. Revisit only if multi-node scale or managed hosting becomes a requirement.
- **Account-first, owner-scoped (no guest mode).** Notes are inherently private, so unlike spork's
  guest-first games there is no anonymous surface; every collection is owner-scoped at the DB rule
  level. Revisit only if public/shared pages are wanted (add a `public` flag + a read rule then).
- **Desktop/PWA-first layout.** A Notion-style workspace is a sidebar + document editor; the layout is
  designed desktop-first and reflows to a slim rail on phones. The Capacitor mobile shells are
  secondary and reuse the same components.
- **Blocks are a flat, sorted list per page.** Content is `blocks` rows ordered by `sort`, not a
  nested rich document — simplest model that supports the Notion block feel. A rich/nested block tree
  is a future migration, not a rewrite.
