module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsAsset',
      fields: {
        size: 'Int',
        width: 'Int',
        height: 'Int',
        path: 'String',
        format: 'String',
        isImage: 'Boolean',
        createdAt: 'Date',
        url: 'String',
        originalid: 'String',
      },
      interfaces: ['Node'],
    }),
  ]);
};
