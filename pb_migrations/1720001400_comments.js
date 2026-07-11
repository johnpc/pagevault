/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `comments` collection — timestamped notes a user attaches to their own
 * page (Notion-style page comments; owner-scoped, so private like everything
 * else). Cascade-deleted with the page and the owner. New collection, additive.
 */
migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    const users = app.findCollectionByNameOrId('users');

    const comments = new Collection({
      type: 'base',
      name: 'comments',
      listRule: 'owner = @request.auth.id',
      viewRule: 'owner = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'owner = @request.auth.id',
      deleteRule: 'owner = @request.auth.id',
      fields: [
        {
          type: 'relation',
          name: 'page',
          required: true,
          maxSelect: 1,
          collectionId: pages.id,
          cascadeDelete: true,
        },
        { type: 'text', name: 'body', required: true, max: 2000 },
        {
          type: 'relation',
          name: 'owner',
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
    });
    app.save(comments);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('comments'));
  },
);
