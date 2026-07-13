/// <reference path="../pb_data/types.d.ts" />

/**
 * Collaboration presence — "who is viewing this page right now". Each viewer
 * keeps ONE heartbeat row per page (unique page+user index, upserted every few
 * seconds); a viewer is "active" if their row's `updated` is recent. The client
 * derives liveness from `updated`, so no extra timestamp field is needed.
 *
 * Access: a viewer manages only their OWN presence row (create/update/delete
 * where user = the caller). READ is broadened so anyone who can see the page can
 * see who else is on it — owner, a public page, or a member via `shares`. This
 * mirrors the page read rule so presence never leaks beyond page access.
 */
migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    const users = app.findCollectionByNameOrId('users');

    const presence = new Collection({
      type: 'base',
      name: 'presence',
      // See who is on a page you can access (owner / public / shared member).
      listRule:
        'page.owner = @request.auth.id || page.isPublic = true || ' +
        '(@collection.shares.page ?= page.id && @collection.shares.user ?= @request.auth.id)',
      viewRule:
        'page.owner = @request.auth.id || page.isPublic = true || ' +
        '(@collection.shares.page ?= page.id && @collection.shares.user ?= @request.auth.id)',
      // You manage only your own heartbeat row.
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
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
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_presence_page_user ON presence (page, user)'],
    });
    app.save(presence);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('presence'));
  },
);
