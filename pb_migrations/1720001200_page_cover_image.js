/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `coverImage` file field to pages so a page banner can be an uploaded
 * image, not just a gradient. Single file, image mime types, ~10MB cap. Left
 * unprotected so a public page's cover loads over the /shared link the same way
 * the link grants access (consistent with block image uploads). Additive +
 * non-required, so existing pages stay valid and keep their gradient cover.
 */
migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.add(
      new FileField({
        name: 'coverImage',
        required: false,
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      }),
    );
    app.save(pages);
  },
  (app) => {
    const pages = app.findCollectionByNameOrId('pages');
    pages.fields.removeByName('coverImage');
    app.save(pages);
  },
);
