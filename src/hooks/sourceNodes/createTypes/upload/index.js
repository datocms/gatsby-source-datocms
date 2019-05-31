module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsAsset',
      extensions: { infer: false },
      fields: {
        size: 'Int',
        width: 'Int',
        height: 'Int',
        path: 'String',
        format: 'String',
        isImage: 'Boolean',
        createdAt: {
          type: 'Date',
          extensions: { dateformat: {} },
        },
        url: 'String',
        alt: 'String',
        title: 'String',
        originalid: 'String',
      },
      interfaces: ['Node'],
    }),
  ]);
};
