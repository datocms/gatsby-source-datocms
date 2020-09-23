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
          resolve: (fieldValue, args, context) => {
            if (fieldValue && fieldValue.image) {
              return context.nodeModel.getNodeById({
                id: `DatoCmsAsset-${fieldValue.image}`,
              });
            }
          },
        },
      },
    }),
  ]);
};
