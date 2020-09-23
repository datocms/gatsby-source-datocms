module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsVideoField',
      extensions: { infer: false },
      fields: {
        url: 'String',
        title: 'String',
        provider: 'String',
        providerUid: 'String',
        thumbnailUrl: 'String',
        width: 'Int',
        height: 'Int',
      },
    }),
  ]);
};
