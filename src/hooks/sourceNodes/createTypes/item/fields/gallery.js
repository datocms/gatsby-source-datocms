const { camelize } = require('humps');

module.exports = ({
  parentItemType,
  field,
  schema,
  gqlItemTypeName,
  entitiesRepo,
}) => {
  const fieldKey = camelize(field.apiKey);

  return {
    fieldType: {
      type: '[DatoCmsAsset]',
      resolve: (parent, args, context) => {
        const ids =
          'locale' in parent && 'value___NODE' in parent
            ? parent.value___NODE
            : parent[`${fieldKey}___NODE`];

        if (ids) {
          return context.nodeModel.getNodesByIds({ ids });
        }
      },
    },
  };
};
