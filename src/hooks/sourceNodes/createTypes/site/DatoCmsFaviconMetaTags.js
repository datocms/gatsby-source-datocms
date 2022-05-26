module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsFaviconMetaTags',
      extensions: { infer: false },
      fields: {
        tags: {
          type: 'JSON',
          resolve: node => node,
        },
      },
    }),
  ]);
};
