/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `cover` field to pages — the id of a curated gradient banner (or '' for
 * none). Additive + optional, so existing pages stay valid. Applied on boot
 * after the earlier migrations.
 */
migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.add(new TextField({ name: 'cover', required: false, max: 32 }));
    app.save(pages);
  },
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.removeByName('cover');
    app.save(pages);
  },
);
