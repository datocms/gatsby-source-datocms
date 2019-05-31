module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsModel',
      extensions: { infer: false },
      fields: {
        name: 'String',
        singleton: 'Boolean',
        sortable: 'Boolean',
        apiKey: 'String',
        orderingDirection: 'String',
        tree: 'Boolean',
        modularBlock: 'Boolean',
        draftModeActive: 'Boolean',
        allLocalesRequired: 'Boolean',
        collectionAppeareance: 'String',
        hasSingletonItem: 'Boolean',
        originalId: 'String',
        fields: {
          type: 'DatoCmsFaviconMetaTags',
          extensions: {
            link: { to: 'id', from: 'fields___NODE' },
          },
        },
      },
      interfaces: ['Node'],
    }),
  ]);
};
