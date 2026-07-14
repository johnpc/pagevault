/// <reference path="../pb_data/types.d.ts" />

/**
 * Multi-user collaboration, slice 2 — make the "edit" invite role actually grant
 * editing. Slice 1 (1720001900_page_shares) added shares + broadened READ, but
 * left writes owner-only, so an invitee joined as `edit` still couldn't save.
 *
 * This broadens WRITE on blocks + pages to also allow a member whose shares row
 * for that page has role = 'edit'. The membership predicate mirrors the read
 * rule and binds to a single row via the unique (page, user) index:
 *   @collection.shares.page ?= <page id>
 *   && @collection.shares.user ?= @request.auth.id
 *   && @collection.shares.role ?= 'edit'
 *
 * Deliberately NOT changed:
 *   - blocks.create: an edit member may add blocks, but the client stamps
 *     owner = its own id (the create rule only needs auth), so this already
 *     works — a member's new blocks are owned by them and readable via the
 *     shared-page read rule. Left as-is.
 *   - pages.delete / blocks.delete stay owner-only? No — an edit member must be
 *     able to delete blocks they're editing, so blocks.delete opens to edit
 *     members too. pages.delete stays OWNER-ONLY: a collaborator must never be
 *     able to trash the owner's page.
 *   - view / comment roles get NO write access here (role ?= 'edit' only).
 */
migrate(
  (app) => {
    const member =
      '(page.id ?= @collection.shares.page && @collection.shares.user ?= @request.auth.id ' +
      "&& @collection.shares.role ?= 'edit')";
    const pageMember =
      '(id ?= @collection.shares.page && @collection.shares.user ?= @request.auth.id ' +
      "&& @collection.shares.role ?= 'edit')";

    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.updateRule = `owner = @request.auth.id || ${member}`;
    blocks.deleteRule = `owner = @request.auth.id || ${member}`;
    app.save(blocks);

    // An edit member can update a page's own fields (title, icon, cover…) but
    // NOT delete it — delete stays owner-only.
    const pages = app.findCollectionByNameOrId('pages');
    pages.updateRule = `owner = @request.auth.id || ${pageMember}`;
    app.save(pages);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.updateRule = 'owner = @request.auth.id';
    blocks.deleteRule = 'owner = @request.auth.id';
    app.save(blocks);

    const pages = app.findCollectionByNameOrId('pages');
    pages.updateRule = 'owner = @request.auth.id';
    app.save(pages);
  },
);
