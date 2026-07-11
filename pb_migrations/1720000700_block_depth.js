/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `depth` field to blocks for list indentation (Tab / Shift-Tab). Additive
 * + non-required (defaults 0), so existing blocks stay valid and render at the
 * top level. Applied on boot after the earlier migrations.
 */
migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.add(new NumberField({ name: 'depth', required: false }));
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.removeByName('depth');
    app.save(blocks);
  },
);
