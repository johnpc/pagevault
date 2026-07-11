/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `color` field to blocks — a token name (e.g. "red", "blue", or a "*-bg"
 * background variant) that tints the block's text or background, Notion-style.
 * Additive + non-required (defaults ''), so existing blocks stay valid and
 * render with the default color.
 */
migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.add(new TextField({ name: 'color', required: false, max: 20 }));
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.removeByName('color');
    app.save(blocks);
  },
);
