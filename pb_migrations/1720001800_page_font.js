/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `font` field to pages — the per-page typeface (Notion's "Style":
 * '' or 'default' = the sans reading font, 'serif', 'mono'). Additive +
 * non-required (defaults ''), so existing pages render in the default font.
 */
migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.add(new TextField({ name: 'font', required: false, max: 10 }));
    app.save(pages);
  },
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.removeByName('font');
    app.save(pages);
  },
);
