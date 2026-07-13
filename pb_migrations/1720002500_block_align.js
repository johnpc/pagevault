/// <reference path="../pb_data/types.d.ts" />

/**
 * Add an `align` field to blocks — the text alignment token ('center' or
 * 'right'; '' = default left), Notion-style per-block alignment. Additive +
 * non-required (defaults ''), so existing blocks stay valid and left-aligned.
 */
migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.add(new TextField({ name: 'align', required: false, max: 10 }));
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.removeByName('align');
    app.save(blocks);
  },
);
