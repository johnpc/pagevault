/// <reference path="../pb_data/types.d.ts" />

/**
 * Add an `emoji` field to blocks — the leading icon of a `callout` block (e.g.
 * 💡, ⚠️, ✅). '' falls back to the default 💡. Additive + non-required, so
 * existing callouts keep the default icon. Only callouts use it today.
 */
migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.add(new TextField({ name: 'emoji', required: false, max: 16 }));
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.removeByName('emoji');
    app.save(blocks);
  },
);
