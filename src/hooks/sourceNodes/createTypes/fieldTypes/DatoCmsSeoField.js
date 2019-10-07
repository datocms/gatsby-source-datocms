module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsSeoField',
      extensions: { infer: false },
      fields: {
        title: 'String',
        description: 'String',
        twitterCard: 'String',
        image: {
          type: 'DatoCmsAsset',
          resolve: (parent, args, context) => {
            const id = parent.image___NODE;
            if (id) {
              return context.nodeModel.getNodeById({ id: id });
            }
          }
        },
      },
    }),
  ]);
}

