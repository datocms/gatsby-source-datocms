module.exports = ({ actions, schema, generateType }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: generateType('SeoField'),
      extensions: { infer: false },
      fields: {
        title: 'String',
        description: 'String',
        twitterCard: 'String',
        image: {
          type: generateType('Asset'),
          resolve: (fieldValue, args, context) => {
            if (fieldValue && fieldValue.image) {
              return context.nodeModel.getNodeById({
                id: `${generateType('Asset')}-${fieldValue.image}`,
              });
            }
          },
        },
      },
    }),
  ]);
};
