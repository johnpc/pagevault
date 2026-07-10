/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `favorite` flag to pages so users can pin pages to a Favorites section
 * in the sidebar. Additive + non-required (defaults false), so existing pages
 * stay valid. Applied on boot after the earlier migrations.
 */
migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.add(new BoolField({ name: 'favorite', required: false }));
    app.save(pages);
  },
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.removeByName('favorite');
    app.save(pages);
  },
);
