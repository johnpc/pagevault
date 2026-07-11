/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `toggle` block type (a collapsible section, Notion-style) plus a
 * `collapsed` bool that hides its nested (deeper-`depth`) children when set.
 * Additive: extends the select values and adds a non-required field, so stored
 * blocks stay valid and render expanded by default.
 */
const WITH_TOGGLE = [
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
  'toggle',
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_TOGGLE;
    blocks.fields.add(new BoolField({ name: 'collapsed', required: false }));
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_TOGGLE.filter((t) => t !== 'toggle');
    blocks.fields.removeByName('collapsed');
    app.save(blocks);
  },
);
