/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `table` block type — a simple database/table (Notion-style) whose grid
 * lives in a JSON `data` field ({ columns: string[], rows: string[][] }). Keeping
 * the grid in one JSON field means no per-cell rows to manage and it round-trips
 * as a single block. Additive + non-required, so existing blocks stay valid.
 */
const WITH_TABLE = [
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
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_TABLE;
    blocks.fields.add(new JSONField({ name: 'data', required: false, maxSize: 2000000 }));
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_TABLE.filter((t) => t !== 'table');
    blocks.fields.removeByName('data');
    app.save(blocks);
  },
);
