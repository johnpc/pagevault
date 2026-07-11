/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `image` block type. An image block stores its URL in `content`.
 * Additive — extends the existing select values, so stored blocks stay valid.
 */
const WITH_IMAGE = [
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
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_IMAGE;
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_IMAGE.filter((t) => t !== 'image');
    app.save(blocks);
  },
);
