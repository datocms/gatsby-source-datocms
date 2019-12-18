module.exports = ({ entitiesRepo, actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsSeoMetaTags',
      extensions: { infer: false },
      fields: {
        tags: 'JSON',
      },
      interfaces: [`Node`],
    }),
  ]);
}