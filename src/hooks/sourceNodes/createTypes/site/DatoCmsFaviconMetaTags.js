module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsFaviconMetaTags',
      extensions: { infer: false },
      fields: {
        tags: 'JSON',
      },
      interfaces: [`Node`],
    }),
  ]);
};
