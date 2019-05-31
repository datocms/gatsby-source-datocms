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
          'locale' in parent && 'value___NODE' in parent
            ? parent.value___NODE
            : parent[`${fieldKey}Node___NODE`];

        if (id) {
          return context.nodeModel.getNodeById({ id });
        }
      },
    },
  };
};
