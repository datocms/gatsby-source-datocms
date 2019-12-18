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
    fieldType: 'String',
    nodeFieldType: {
      type: 'DatoCmsTextNode',
      resolve: (parent, args, context) => {
        const id =
          'locale' in parent && 'valueNode___NODE' in parent
            ? parent.valueNode___NODE
            : parent[`${fieldKey}Node___NODE`];

        if (id) {
          return context.nodeModel.getNodeById({ id });
        }
      },
    },
  };
};
