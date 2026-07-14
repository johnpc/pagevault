# RFC: Editor architecture — closing the Notion "feel" gap

Status: **Draft / proposed.** Author: automated agent. Date: 2026-07 (relative).

## 1. Why this exists

Feedback (owner): PageVault has a broad block **catalog** but is not close to Notion's
**interaction fabric**, and prior "parity complete" claims measured the wrong thing (the
README block list, not the felt experience). This RFC names the real gaps, identifies the
one architectural decision that gates most of them, and proposes a staged path that ships
value early without a big-bang rewrite.

The three gaps that define "feels like Notion", in priority of felt impact:

1. **Document-level undo/redo (Cmd+Z / Cmd+Shift+Z)** — today only a delete-toast exists.
2. **Floating selection toolbar** — select text → bold/italic/link/turn-into popup.
3. **Inline WYSIWYG typing** — marks render as you type; raw `**` never shows.

## 2. Current architecture (ground truth)

- **Editing surface:** one `<textarea class="pv-block-input">` per block (`BlockTextarea.tsx`).
  One block == one PocketBase `blocks` row.
- **Storage:** `blocks.content` is a **plain markdown-ish string** — `**bold**`, `_i_`,
  `` `code` ``, `@[Title](id)` mentions, `[t](url)` links are all stored **literally**.
- **Rendering (idle):** `parseInline(content)` → styled segments → `FormattedText`
  (`inlineMarkdown.ts`, `inlineLinks.ts`). Shown when a block is not focused.
- **Editing:** focus swaps the formatted preview for the raw textarea (`TextBlockBody`:
  `showPreview = !focused && hasInlineMarkup(value)`). **This swap is the visible seam** —
  you see `**bold**` while editing, styled only after blur.
- **Persistence:** optimistic; `useUpdateBlock` rewrites the react-query cache per keystroke.
- **Key insight:** because `content` is already a serialized string, **the storage model does
  not have to change** to get WYSIWYG. Only the _editing surface_ changes. This is what makes
  a staged migration feasible.

## 3. What each gap actually requires

### 3a. Undo/redo — **does NOT need the rewrite. Do first.**

- Scope: a per-page undo stack of inverse operations (edit content, add/remove/move/indent
  block, type change). We already have discrete, pure mutations (`useBlockActions`) — each can
  push an inverse onto a stack.
- Approach: a `usePageHistory(pageId)` that records `{ do, undo }` entries as mutations fire,
  bound to Cmd+Z / Cmd+Shift+Z at the page level (like `useCollapseAll`/keyboard hooks already
  do). Coalesce consecutive same-block content edits into one undo step (debounced) so a word
  of typing isn't 20 undos.
- Risk: realtime/optimistic cache interplay — undo must reissue a mutation (server round-trips),
  not just mutate the cache, so collaborators converge. Medium.
- **Ships independently, no architectural dependency.**

### 3b. Selection toolbar — **does NOT need the rewrite. Do second.**

- On `select` within a `.pv-block-input`, compute the selection rect
  (`textarea` supports `selectionStart/End`; use a mirror-div or `getClientRects` on a range
  proxy) and float a toolbar with the actions we already have as pure fns
  (`wrapSelection` → bold/italic/code/underline/strike, link-on-paste's link wrap, `turnInto`).
- Works in the textarea model because it just calls the existing `applyFormatKey`/`wrapSelection`.
- Risk: positioning across scroll/resize + mobile long-press selection. Medium.

### 3c. Inline WYSIWYG typing — **NEEDS the editing-surface migration.**

A `<textarea>` cannot render bold/italic glyphs; an overlay drifts once glyph widths change
(verified earlier). Real inline styling requires a `contentEditable` surface with a document
model. Options:

- **Option A — ProseMirror / TipTap (recommended).** Battle-tested schema + transactions +
  built-in history (free undo/redo!) + input rules (markdown-as-you-type) + a plugin ecosystem
  (mentions, slash, selection toolbar). Cost: a real dependency (~large), a schema mapping
  layer, and rewriting `BlockTextarea` + the key handlers (`blockEditKey`, `useMention`,
  slash) as PM plugins.
- **Option B — hand-rolled `contentEditable`.** Full control, no dep, but we'd reimplement
  selection/IME/history/paste sanitization — the exact swamp ProseMirror exists to drain.
  Not recommended.
- **Option C — stay textarea, fake it.** Rejected: overlay drift is unfixable for variable
  glyph widths.

**Recommendation: Option A, but scoped to the _block body_ only.** PageVault's
"flat list of block rows" stays; each text-ish block becomes a small single-line PM instance
(or one PM doc spanning the page — see §5 open question). The block list, DnD, tables, and
storage-as-string are preserved; `content` serializes from the PM node on change (markdown
serializer we mostly already have in `inlineMarkdown` + `inlineToMarkdown`).

## 4. Staged plan (each stage ships independently, gated by CI + quality)

- **Stage 0 (this RFC).** Agree the direction; no code.
- **Stage 1 — Undo/redo. ✅ SHIPPED.** `usePageHistory` wraps `editBlock`, records content
  edits (reading `before` from the live query cache to avoid render-lag staleness), and binds
  Cmd/Ctrl+Z / ⇧Z / Ctrl+Y. Edits commit on blur (one undo step each; no per-keystroke
  coalescing needed). Undo/redo reissue the mutation so collaborators converge. No arch change.
  Follow-ups: extend history to add/remove/move/indent + type changes (content-only for now).
- **Stage 2 — Selection toolbar.** Float on select; reuse `wrapSelection`/`turnInto`; e2e.
- **Stage 3 — WYSIWYG spike.** ONE block type (paragraph) on ProseMirror behind a flag
  (`VITE_PM_EDITOR`), reading/writing the same `content` string. Prove: markdown input rules,
  caret parity, mention + slash + selection toolbar as PM plugins, undo via PM history.
  Measure bundle + perf on a 250-block page.
- **Stage 4 — Migrate remaining text-ish blocks** to PM; delete the textarea path; fold
  Stage-1 undo into PM history if the spike proves it cleaner.
- **Stage 5 — Richness on the new base:** richer block gutter menu (color/turn-into/copy-link/
  move-to/comment), then inline DB views / more column types as separate RFCs.

Stages 1–2 deliver most of the _felt_ improvement with zero architectural risk, and de-risk the
Stage-3 decision by letting us compare "textarea + toolbar + undo" against a PM spike head to head.

## 5. Open questions (resolve before Stage 3, not now)

- **One PM doc per page vs. one PM instance per block?** Per-page doc is closer to Notion
  (cross-block selection, drag, `/` anywhere) but collides with the row-per-block storage and
  block-level realtime/presence. Per-block keeps the current model; loses cross-block select.
  Leaning per-block first, re-evaluate after the spike.
- **Bundle budget.** ProseMirror/TipTap is sizable; must stay lazy-loaded like highlight.js so
  the initial load doesn't regress (current: hljs is a lazy chunk, initial load lean).
- **Collab.** Char-level cursors/OT is out of scope here; block-level presence stays.

## 6. Non-goals

Native mobile builds; real-time OT/CRDT; synced blocks; formula columns — all separate tracks.

## 7. Decision

Proceed with **Stages 1 → 2 immediately** (no arch risk, high felt value). Treat **Stage 3**
as a spike whose result decides the editing-surface migration. Do **not** big-bang rewrite.
