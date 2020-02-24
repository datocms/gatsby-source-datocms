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
      allLocalesResolver: (parent) => parent.valueNode___NODE,
      normalResolver: (parent) => parent[`${fieldKey}Node___NODE`],
      resolveFromValue: (id, args, context) => {
        if (id) {
          return context.nodeModel.getNodeById({ id });
        }
      },
    },
  };
};