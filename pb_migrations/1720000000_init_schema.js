/// <reference path="../pb_data/types.d.ts" />

/**
 * PageVault schema — version-controlled and auto-applied on PocketBase boot.
 *
 * Collections:
 *   users  — built-in auth collection (email/password). We only tighten its
 *            rules so a signed-in user can read/update their OWN record.
 *   pages  — a document in the workspace. Self-referential `parent` gives the
 *            Notion-style nested tree; `owner` scopes every row to one user.
 *   blocks — the ordered content of a page (text / heading / todo / …).
 *
 * Auth model (see CLAUDE.md "Decisions"): PageVault is account-first — notes are
 * private. Every rule is owner-scoped so one user can never read another's data.
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');

    // ---- pages -------------------------------------------------------------
    const pages = new Collection({
      type: 'base',
      name: 'pages',
      listRule: 'owner = @request.auth.id',
      viewRule: 'owner = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'owner = @request.auth.id',
      deleteRule: 'owner = @request.auth.id',
      fields: [
        { type: 'text', name: 'title', required: false, max: 255 },
        { type: 'text', name: 'icon', required: false, max: 16 },
        { type: 'bool', name: 'archived', required: false },
        { type: 'number', name: 'sort', required: false },
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
    app.save(pages);
    // Add the self-referential `parent` now that `pages` has an id — a relation
    // field can't be saved with a blank collectionId, so it can't be inlined
    // above (the collection doesn't exist yet at construction time).
    pages.fields.add(
      new RelationField({
        name: 'parent',
        required: false,
        maxSelect: 1,
        collectionId: pages.id,
        cascadeDelete: true,
      }),
    );
    app.save(pages);

    // ---- blocks ------------------------------------------------------------
    const blocks = new Collection({
      type: 'base',
      name: 'blocks',
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
        {
          type: 'select',
          name: 'type',
          required: true,
          maxSelect: 1,
          values: ['text', 'heading', 'subheading', 'todo', 'quote', 'divider'],
        },
        { type: 'text', name: 'content', required: false, max: 5000 },
        { type: 'bool', name: 'checked', required: false },
        { type: 'number', name: 'sort', required: false },
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
    app.save(blocks);

    // ---- users: own-record access -----------------------------------------
    users.listRule = 'id = @request.auth.id';
    users.viewRule = 'id = @request.auth.id';
    users.updateRule = 'id = @request.auth.id';
    app.save(users);
  },
  (app) => {
    for (const name of ['blocks', 'pages']) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (_) {
        /* already gone */
      }
    }
  },
);
