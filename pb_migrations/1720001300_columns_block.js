/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `columns` block type — a side-by-side multi-column layout whose text
 * columns live in the existing JSON `data` field ({ cols: string[] }). Reuses
 * the `data` field added for tables, so this only extends the type select.
 * Additive: existing blocks stay valid.
 */
const WITH_COLUMNS = [
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
  'table',
  'columns',
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_COLUMNS;
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_COLUMNS.filter((t) => t !== 'columns');
    app.save(blocks);
  },
);
