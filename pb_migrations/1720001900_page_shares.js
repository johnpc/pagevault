/// <reference path="../pb_data/types.d.ts" />

/**
 * Multi-user collaboration, slice 1 — invite-link membership.
 *
 * Adds an invite link to a page (a random `inviteToken` + the `inviteRole` it
 * grants: view/comment/edit), and a `shares` collection recording which users
 * have joined which page and at what role. Joining goes through the server hook
 * POST /api/join/{token} (pb_hooks/invite.pb.js), which looks the page up BY
 * TOKEN and sets `role = page.inviteRole` server-side — the shares createRule is
 * null so a client can never create a membership directly (no self-escalation,
 * and the token stays a secret rather than a guessable page id).
 *
 * Read access broadens so a member can read a shared page + its blocks. Writes
 * stay owner-only in this slice; edit/comment enforcement lands in slice 2.
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    const pages = app.findCollectionByNameOrId('pages');

    // Invite link on the page: a token + the role it grants. '' role/token =
    // no active invite link.
    pages.fields.add(new TextField({ name: 'inviteToken', required: false, max: 40 }));
    pages.fields.add(
      new SelectField({
        name: 'inviteRole',
        required: false,
        maxSelect: 1,
        values: ['view', 'comment', 'edit'],
      }),
    );
    app.save(pages);

    // shares: one row per (page, user) — the membership.
    const shares = new Collection({
      type: 'base',
      name: 'shares',
      // A user sees only their OWN membership rows.
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      // createRule is null (superuser-only): joins go exclusively through the
      // server hook POST /api/join/{token}, which sets the role from the page's
      // inviteRole. This makes the invite token a real secret — a client can't
      // create a membership directly (no self-escalation, no id-guessing).
      createRule: null,
      // Leaving a page = deleting your own membership row.
      deleteRule: 'user = @request.auth.id',
      // No update rule: role changes come from re-joining, not client edits.
      fields: [
        {
          type: 'relation',
          name: 'page',
          required: true,
          maxSelect: 1,
          collectionId: pages.id,
          cascadeDelete: true,
        },
        {
          type: 'relation',
          name: 'user',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        {
          type: 'select',
          name: 'role',
          required: true,
          maxSelect: 1,
          values: ['view', 'comment', 'edit'],
        },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_shares_page_user ON shares (page, user)'],
    });
    app.save(shares);

    // Broaden READ so a member can read the shared page + its blocks. The
    // membership check is bound to a single row via the unique (page,user)
    // index — see the empirical validation before shipping.
    pages.listRule =
      'owner = @request.auth.id || isPublic = true || ' +
      '@collection.shares.page ?= id && @collection.shares.user ?= @request.auth.id';
    pages.viewRule = pages.listRule;
    app.save(pages);

    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.listRule =
      'owner = @request.auth.id || page.isPublic = true || ' +
      'page.id ?= @collection.shares.page && @collection.shares.user ?= @request.auth.id';
    blocks.viewRule = blocks.listRule;
    app.save(blocks);
  },
  (app) => {
    // Restore the pre-membership read rules, then drop shares + invite fields.
    const pages = app.findCollectionByNameOrId('pages');
    pages.listRule = 'owner = @request.auth.id || isPublic = true';
    pages.viewRule = pages.listRule;
    app.save(pages);

    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.listRule = 'owner = @request.auth.id || page.isPublic = true';
    blocks.viewRule = blocks.listRule;
    app.save(blocks);

    app.delete(app.findCollectionByNameOrId('shares'));

    pages.fields.removeByName('inviteToken');
    pages.fields.removeByName('inviteRole');
    app.save(pages);
  },
);
