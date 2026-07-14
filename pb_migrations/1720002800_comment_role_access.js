/// <reference path="../pb_data/types.d.ts" />

/**
 * Multi-user collaboration, slice 3 — make the "comment" invite role work.
 *
 * Comments were owner-scoped: a collaborator couldn't even SEE the page's
 * comment thread (listRule owner-only), and createRule was any-authed (too
 * loose — a view-only member could still post). This ties comments to page
 * membership:
 *   - list/view: owner OR ANY member of the comment's page (view/comment/edit
 *     can all read the thread).
 *   - create:    owner OR a member whose role is 'comment' or 'edit' (a
 *     view-only member cannot post). The rule checks the NEW comment's page
 *     against the caller's shares row via the unique (page,user) index.
 *   - update/delete stay OWNER-of-the-comment (deleteRule already = owner);
 *     a member manages only their own comments — unchanged.
 *
 * Mirrors the read/write predicates from slices 1–2 (page_shares,
 * edit_role_writes). Validated on the real binary before shipping.
 */
migrate(
  (app) => {
    const comments = app.findCollectionByNameOrId('comments');

    // Any member can read the thread.
    const memberOfPage =
      'page.id ?= @collection.shares.page && @collection.shares.user ?= @request.auth.id';
    comments.listRule = `owner = @request.auth.id || (${memberOfPage})`;
    comments.viewRule = comments.listRule;

    // Only the PAGE owner or a comment/edit member can post. NOTE: a comment's
    // own `owner` field is the commenter (client stamps owner = self), so an
    // `owner = @request.auth.id` branch would let ANYONE post — the ownership
    // check must be on the comment's PAGE (page.owner), not the comment itself.
    const canComment =
      'page.id ?= @collection.shares.page && @collection.shares.user ?= @request.auth.id ' +
      "&& (@collection.shares.role ?= 'comment' || @collection.shares.role ?= 'edit')";
    comments.createRule = `@request.auth.id != '' && (page.owner = @request.auth.id || (${canComment}))`;

    app.save(comments);
  },
  (app) => {
    const comments = app.findCollectionByNameOrId('comments');
    comments.listRule = 'owner = @request.auth.id';
    comments.viewRule = 'owner = @request.auth.id';
    comments.createRule = "@request.auth.id != ''";
    app.save(comments);
  },
);
