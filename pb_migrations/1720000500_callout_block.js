/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `callout` block type — a tinted highlight box (💡 tip/note). Reuses
 * the text `content`. Additive: extends the select values, so stored blocks
 * stay valid.
 */
const WITH_CALLOUT = [
  'text',
  'heading',
  'subheading',
  'todo',
  'quote',
  'divider',
  'bullet',
  'numbered',
  'code',
  'image',
  'callout',
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_CALLOUT;
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_CALLOUT.filter((t) => t !== 'callout');
    app.save(blocks);
  },
);
