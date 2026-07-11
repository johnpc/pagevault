/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `fullWidth` bool to pages — a per-page layout option that widens the
 * content area beyond the default reading column (Notion's "Full width").
 * Additive + non-required (defaults false), so existing pages keep the narrow
 * reading layout.
 */
migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.add(new BoolField({ name: 'fullWidth', required: false }));
    app.save(pages);
  },
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.removeByName('fullWidth');
    app.save(pages);
  },
);
