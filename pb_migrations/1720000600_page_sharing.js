/// <reference path="../pb_data/types.d.ts" />

/**
 * Public link sharing. Adds `isPublic` (bool) + `shareToken` (random slug) to
 * pages, and relaxes the READ rules on pages + blocks so that a public page and
 * its blocks are readable by ANYONE (including unauthenticated visitors), while
 * every write and all private reads stay owner-scoped.
 *
 * Rule shape:
 *   pages.viewRule/listRule: owner = @request.auth.id || isPublic = true
 *   blocks.viewRule/listRule: owner = @request.auth.id || page.isPublic = true
 * Create/update/delete rules are unchanged (still owner-only), so sharing grants
 * read, never write.
 */
migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.add(new BoolField({ name: 'isPublic', required: false }));
    pages.fields.add(new TextField({ name: 'shareToken', required: false, max: 40 }));
    pages.listRule = 'owner = @request.auth.id || isPublic = true';
    pages.viewRule = 'owner = @request.auth.id || isPublic = true';
    app.save(pages);

    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.listRule = 'owner = @request.auth.id || page.isPublic = true';
    blocks.viewRule = 'owner = @request.auth.id || page.isPublic = true';
    app.save(blocks);
  },
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.removeByName('isPublic');
    pages.fields.removeByName('shareToken');
    pages.listRule = 'owner = @request.auth.id';
    pages.viewRule = 'owner = @request.auth.id';
    app.save(pages);

    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.listRule = 'owner = @request.auth.id';
    blocks.viewRule = 'owner = @request.auth.id';
    app.save(blocks);
  },
);
