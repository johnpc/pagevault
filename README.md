<p align="center">
  <img src="assets/banner.png" alt="PageVault — your self-hosted workspace for notes & docs" width="100%" />
</p>

<p align="center">
  <img src="https://github.com/johnpc/pagevault/actions/workflows/ci.yml/badge.svg" alt="CI status" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
  <img src="https://img.shields.io/badge/backend-PocketBase-informational" alt="PocketBase" />
</p>

# PageVault

**Your self-hosted workspace for notes & docs.** A fast, Notion-style app — pages of blocks
organized in a nested sidebar — where **you own all the data**. The entire backend is a single
[PocketBase](https://pocketbase.io) container you bring up with one `docker compose` command. No cloud
account, no third-party service, no lock-in.

> Sign in, and everything you write lives in your own database on your own machine.

## Features

| Feature                                                                                     | Status |
| ------------------------------------------------------------------------------------------- | ------ |
| Email/password accounts (private, owner-scoped)                                             | ✅     |
| Page templates (Meeting notes, To-do, Blank)                                                | ✅     |
| Home screen with recently edited pages                                                      | ✅     |
| Nested pages in a collapsible sidebar tree                                                  | ✅     |
| Move / reparent a page (cycle-safe picker)                                                  | ✅     |
| Sub-pages + breadcrumb navigation                                                           | ✅     |
| Archive to trash → restore or delete forever                                                | ✅     |
| Favorite pages (pinned Favorites section)                                                   | ✅     |
| Page footer: word/block count + last edited                                                 | ✅     |
| Duplicate a page (with all its blocks)                                                      | ✅     |
| Export a page as Markdown                                                                   | ✅     |
| Export the whole workspace as one Markdown file (Settings)                                  | ✅     |
| Blocks — text, 3 heading levels, lists, to-dos, quotes, code, images, callouts              | ✅     |
| Code blocks — one-click copy button                                                         | ✅     |
| Code blocks — language label/picker (fenced language on export)                             | ✅     |
| Code blocks — syntax highlighting (highlight.js, lazy-loaded, light/dark themed)            | ✅     |
| Callout blocks — pick the leading icon (💡 / ⚠️ / ✅ …) + background color                  | ✅     |
| Toggle blocks — collapse/expand to fold away nested content                                 | ✅     |
| To-do blocks — checking one strikes through & dims it (done state)                          | ✅     |
| Collapse all / expand all toggles on a page (one header action)                             | ✅     |
| Column layouts — 2–4 side-by-side text columns                                              | ✅     |
| Table of contents block — auto-lists headings, click to scroll                              | ✅     |
| Table blocks — typed columns (text/number/checkbox/select/date), GFM export                 | ✅     |
| Select columns — pick from a popover, or create a new option inline from the cell           | ✅     |
| Select / multiselect options render as colored tag pills (auto-colored by name)             | ✅     |
| Board columns & grouped-table headers show the group value as its colored tag               | ✅     |
| Gallery cards render select / multiselect fields as colored tag pills                       | ✅     |
| Table rows — drag to reorder (mouse + touch/pen), click a header to sort                    | ✅     |
| Table keyboard nav — Enter/↑/↓ move between rows, ←/→ across at the text edge               | ✅     |
| Table rows — duplicate a row (inserts a copy below)                                         | ✅     |
| Table columns — duplicate a column (copies header + cells, refs follow)                     | ✅     |
| Table board view — kanban grouped by a select column (drag cards, mouse + touch)            | ✅     |
| Table gallery view — browse rows as a responsive grid of cards                              | ✅     |
| Table calendar view — rows on a month grid by a date column (navigate months)               | ✅     |
| Grouped table — collapsible sections grouped by a select column                             | ✅     |
| Table filter — multi-condition filters, match all (AND) or any (OR)                         | ✅     |
| Saved views — name & switch filter/board/visibility configs on a table                      | ✅     |
| Table summaries — count/sum/avg/min/max/median/range/checked over visible                   | ✅     |
| Number columns — display format (plain / comma / percent / $ € £)                           | ✅     |
| Date columns — display format (ISO / medium / long / relative "in 3 days")                  | ✅     |
| Table columns — hide/show via Properties (data preserved)                                   | ✅     |
| Table columns — wrap-text toggle (multi-line cells) per column                              | ✅     |
| Table columns — drag a header to reorder (cells + filters follow; mouse + touch)            | ✅     |
| Multi-select column — tag a row with several options; create / remove tags inline           | ✅     |
| Relation column — link a table row to a page; search the page list, Esc/focus-trap picker   | ✅     |
| Relation columns sort & filter by the linked page's title                                   | ✅     |
| Markdown shortcuts (`# `, `- `, `1. `, `[] `, `> `, ` ``` `)                                | ✅     |
| Enter splits at the caret into a block below (Notion-smooth typing)                         | ✅     |
| Enter / ↓ in the page title jumps the caret into the first block                            | ✅     |
| ↑ / Backspace at the start of the first block goes back up into the title                   | ✅     |
| Click the empty space below the page to start a new block                                   | ✅     |
| Block gutter "+" button — hover a block to add an empty block right below it                | ✅     |
| Enter continues a list; an empty item exits / outdents the list                             | ✅     |
| Slash command menu (`/` to pick a block type — mid-line, grouped Basic/Media/Advanced)      | ✅     |
| Turn into — convert an existing block to another type, keeping content                      | ✅     |
| Page icons — searchable emoji picker (keyword filter + remove)                              | ✅     |
| Page cover banners (gradient or uploaded image)                                             | ✅     |
| Full-width page toggle (per page)                                                           | ✅     |
| Page font style — Default / Serif / Mono (per page)                                         | ✅     |
| Live sync across open tabs/devices (PocketBase realtime)                                    | ✅     |
| Light / dark / system theme (Settings switcher)                                             | ✅     |
| Skeleton loading placeholders on list screens (sidebar, trash)                              | ✅     |
| Save-failure toast — a failed change tells you instead of silently reverting                | ✅     |
| Keyboard shortcut help overlay (?)                                                          | ✅     |
| Accessible popovers — Escape/outside-click close, focus-trapped while open                  | ✅     |
| Toggle the sidebar with ⌘\ / Ctrl+\ (floating restore button)                               | ✅     |
| Installable PWA                                                                             | ✅     |
| Mobile sidebar drawer — hamburger opens a slide-over (backdrop, Esc, focus-trap)            | ✅     |
| Public link sharing (read-only /shared/<token>, no login)                                   | ✅     |
| Collaborate — invite another user to a page via link (view/comment/edit)                    | ✅     |
| Live presence — avatars of who else is viewing a page right now                             | ✅     |
| Live cursors — see which block each collaborator is working in                              | ✅     |
| Self-hosted via `docker compose`                                                            | ✅     |
| Inline markdown — bold, italic, code, strikethrough, underline                              | ✅     |
| Formatting shortcuts — Cmd/Ctrl+B/I/E/U + ⇧S wrap the selection (bold…strike)               | ✅     |
| Floating selection toolbar — select text → bold / italic / underline / strike / code / link | ✅     |
| @-mentions — type `@` to link another page inline                                           | ✅     |
| @-date inserts — `@today` / `@tomorrow` / `@yesterday` / `@now` drop the date               | ✅     |
| Backlinks — "Linked references" of every page that mentions this one                        | ✅     |
| Page comments — timestamped notes on a page (Cmd/Ctrl+Enter to post)                        | ✅     |
| Block color & background highlight (text + `-bg` palette)                                   | ✅     |
| Block text alignment (left / center / right)                                                | ✅     |
| Duplicate a block (inserts below; ⌘D / Ctrl+D or the block menu)                            | ✅     |
| Copy link to a block — deep link scrolls to + flashes it on open                            | ✅     |
| Nested lists — Tab / Shift-Tab to indent & outdent blocks                                   | ✅     |
| Drag-to-reorder blocks (optimistic; mouse drag + touch/pen pointer drag)                    | ✅     |
| Move a block up/down with the keyboard (⌘/Ctrl+⇧+↑/↓)                                       | ✅     |
| Select multiple blocks — Shift+↑/↓, Shift+Click, Cmd/Ctrl+A, or click a ⋮⋮ handle           | ✅     |
| Multi-block action bar — turn-into, color, copy, duplicate, or delete a whole selection     | ✅     |
| Duplicate a whole block selection — ⌘D / Ctrl+D copies the selected blocks below            | ✅     |
| Copy a block selection to the clipboard as Markdown (⌘C / Ctrl+C) — paste anywhere          | ✅     |
| Cut a block selection (⌘X / Ctrl+X) — copies to the clipboard, then removes them            | ✅     |
| Paste Markdown as blocks — pasted blocks land at the paste location, not the page end       | ✅     |
| Undo a block deletion — an Undo action on the delete toast restores them                    | ✅     |
| Undo / redo block edits — ⌘Z / ⌘⇧Z, document-level history                                  | ✅     |
| Arrow-key block navigation — ↑/↓ at a block edge move the caret between blocks              | ✅     |
| Backspace at a block start merges it into the block above (caret at the join)               | ✅     |
| Delete at a block end pulls the next block up into it (caret at the join)                   | ✅     |
| Drag-to-reorder pages in the sidebar (same-parent siblings; mouse + touch)                  | ✅     |
| Bookmark blocks — rich link cards (title, blurb, thumbnail, favicon; scraped)               | ✅     |
| Video/audio embed — media files + YouTube, Vimeo, Spotify, Loom, CodePen, Figma             | ✅     |
| Inline links — `[text](url)` and bare URLs render as clickable links                        | ✅     |
| Link on paste — select text, paste a URL → it becomes a `[text](url)` link                  | ✅     |
| Image blocks (embed by URL)                                                                 | ✅     |
| Image uploads (stored in PocketBase, served same-origin)                                    | ✅     |
| Paste an image from the clipboard — a screenshot becomes an image block                     | ✅     |
| Quick-find search (⌘K, ranked, match-highlighted, titles + content)                         | ✅     |
| Native iOS / Android builds (Capacitor)                                                     | ⬜     |

## Quick start (self-host in two commands)

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) (with Compose) and Node 22+.

```bash
# 1. Bring up the backend (PocketBase on http://localhost:8090)
docker compose up -d --build

# 2. Install deps and start the app
npm install
npm run dev            # http://localhost:5173
```

Create the first superuser + a seeded demo account:

```bash
# Create the PocketBase superuser (used by the Admin UI and the seed script)
docker compose exec pocketbase /pb/pocketbase superuser upsert admin@pagevault.local 'AdminPass123!'

# Seed a demo user (test@example.com / TestPassw0rd!) with starter pages
npm run seed
```

Open http://localhost:5173, sign in with `test@example.com` / `TestPassw0rd!` (or register your own),
and start writing. The PocketBase Admin UI lives at http://localhost:8090/_/.

### Install as a PWA

Open the app in a Chromium browser and use **Install app** from the address bar — PageVault runs in
its own window and is available offline-capable as a standalone workspace.

## How it works

PageVault is a **thin client over PocketBase**:

- **Client** — Ionic 8 + React 19 + TypeScript (strict), Vite, Capacitor. A desktop/PWA-first layout:
  a persistent sidebar (the page tree) beside a document editor. Server state flows through
  react-query wrapping the PocketBase JS SDK; there are no bare fetches in components.
- **Backend** — a single **PocketBase** binary (auth + SQLite + REST + realtime + file storage) run
  by `docker-compose.yml`. Its schema is **version-controlled JavaScript migrations** in
  `pb_migrations/`, auto-applied on boot, so a fresh `docker compose up` always has the right tables.

### Where the data lives

Everything is stored in **`./pb_data`** (a gitignored volume): the SQLite database and any uploads.
Back it up by copying that folder; move it to another host and your whole workspace comes with it.

- **`users`** — accounts (email/password).
- **`pages`** — a document: title, icon, a self-referential `parent` for the nested tree, and an
  `owner`.
- **`blocks`** — the ordered content of a page (text / heading / subheading / to-do / quote /
  divider).

### Privacy model

PageVault is **account-first and owner-scoped**. Every collection's access rules are
`owner = @request.auth.id` at the database level, so a user can only ever read or write their own
pages and blocks — enforced by PocketBase, not just the UI. There is no guest/anonymous surface.

## Development

```bash
npm run quality      # full gate: lint + format + line-length + feature-coverage + tests(80%) + CRAP + build
npm run test         # unit tests (Vitest)
npm run test:e2e     # Gherkin acceptance tests (Playwright + playwright-bdd)
npm run pb:logs      # tail the PocketBase container
npm run gen:icons    # regenerate app icons from assets/icon*.png
```

Quality is non-negotiable and enforced by a husky pre-commit hook + CI: no `any`, every logic file
≤ 100 lines, ≥ 80% coverage, CRAP ≤ 15 per function, Gherkin acceptance tests, and a clean build. See
[`CLAUDE.md`](./CLAUDE.md) for the full engineering charter.

## License

MIT
