/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `lang` field to blocks — the programming language of a `code` block
 * (e.g. "js", "python", "" for plain). Used to label the code block in the UI
 * and to emit a fenced language on Markdown export (```lang). Additive +
 * non-required (defaults ''), so existing code blocks stay valid as plain.
 */
migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.add(new TextField({ name: 'lang', required: false, max: 20 }));
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.removeByName('lang');
    app.save(blocks);
  },
);
