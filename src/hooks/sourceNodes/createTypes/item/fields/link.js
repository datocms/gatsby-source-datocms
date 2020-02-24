const { camelize, pascalize } = require('humps');

module.exports = ({
  parentItemType,
  field,
  schema,
  gqlItemTypeName,
  entitiesRepo,
}) => {
  const fieldKey = camelize(field.apiKey);

  const parentItemTypeName = gqlItemTypeName(parentItemType);

  const itemTypeIds = field.validators.itemItemType.itemTypes;

  if (itemTypeIds.length === 0) {
    return { fieldType: 'String' };
  }

  if (itemTypeIds.length === 1) {
    const linkedItemType = entitiesRepo.findEntity('item_type', itemTypeIds[0]);

    return {
      fieldType: {
        type: gqlItemTypeName(linkedItemType),
        allLocalesResolver: (parent) => parent.value___NODE,
        normalResolver: (parent) => parent[`${fieldKey}___NODE`],
        resolveFromValue: (id, args, context) => {
          if (id) {
            return context.nodeModel.getNodeById({ id });
          }
        },
      },
    };
  }

  const unionType = `DatoCmsUnionFor${parentItemTypeName}${pascalize(
    field.apiKey,
  )}`;
  const unionTypes = itemTypeIds.map(id =>
    gqlItemTypeName(entitiesRepo.findEntity('item_type', id)),
  );

  return {
    types: [schema.buildUnionType({ name: unionType, types: unionTypes })],
    fieldType: {
      type: unionType,
      allLocalesResolver: (parent) => parent.value___NODE,
      normalResolver: (parent) => parent[`${fieldKey}___NODE`],
      resolveFromValue: (id, args, context) => {
        if (id) {
          return context.nodeModel.getNodeById({ id });
        }
      },
    },
  };
};
