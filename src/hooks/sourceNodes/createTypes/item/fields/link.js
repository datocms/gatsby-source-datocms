const { pascalize } = require('humps');
const itemNodeId = require('../../utils/itemNodeId');

module.exports = ({
  parentItemType,
  field,
  schema,
  gqlItemTypeName,
  entitiesRepo,
  generateType,
}) => {
  const parentItemTypeName = gqlItemTypeName(parentItemType);

  const itemTypeIds = field.validators.itemItemType.itemTypes;

  if (itemTypeIds.length === 0) {
    return { type: 'String' };
  }

  if (itemTypeIds.length === 1) {
    const linkedItemType = entitiesRepo.findEntity('item_type', itemTypeIds[0]);

    return {
      type: gqlItemTypeName(linkedItemType),
      resolveForSimpleField: (fieldValue, context, node) => {
        if (fieldValue) {
          return context.nodeModel.getNodeById({
            id: itemNodeId(fieldValue, node.locale, entitiesRepo, generateType),
          });
        }
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
    additionalTypesToCreate: [
      schema.buildUnionType({ name: unionType, types: unionTypes }),
    ],
    type: unionType,
    resolveForSimpleField: (fieldValue, context, node) => {
      if (fieldValue) {
        return context.nodeModel.getNodeById({
          id: itemNodeId(fieldValue, node.locale, entitiesRepo, generateType),
        });
      }
    },
  };
};
