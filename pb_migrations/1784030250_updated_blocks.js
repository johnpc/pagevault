/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_4194232374');

    // update collection data
    unmarshal(
      {
        deleteRule:
          "owner = @request.auth.id || (page.id ?= @collection.shares.page && @collection.shares.user ?= @request.auth.id && @collection.shares.role ?= 'edit')",
      },
      collection,
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_4194232374');

    // update collection data
    unmarshal(
      {
        deleteRule: 'owner = @request.auth.id',
      },
      collection,
    );

    return app.save(collection);
  },
);
