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

  const itemTypeIds =
    field.validators[
      field.fieldType === 'rich_text' ? 'richTextBlocks' : 'itemsItemType'
    ].itemTypes;

  if (itemTypeIds.length === 0) {
    return { type: 'String' };
  }

  if (itemTypeIds.length === 1) {
    const linkedItemType = entitiesRepo.findEntity('item_type', itemTypeIds[0]);

    return {
      type: `[${gqlItemTypeName(linkedItemType)}]`,
      resolveForSimpleField: (fieldValue, context, node) => {
        const ids = (fieldValue || []).map(id =>
          itemNodeId(id, node.locale, entitiesRepo, generateType),
        );
        return context.nodeModel.getNodesByIds({ ids });
      },
    };
  }

  const unionType = `DatoCmsUnionFor${parentItemTypeName}${pascalize(
    field.apiKey,
  )}`;

  return {
    additionalTypesToCreate: [
      schema.buildUnionType({
        name: unionType,
        types: itemTypeIds.map(id =>
          gqlItemTypeName(entitiesRepo.findEntity('item_type', id)),
        ),
      }),
    ],
    type: `[${unionType}]`,
    resolveForSimpleField: (fieldValue, context, node) => {
      const ids = (fieldValue || []).map(id =>
        itemNodeId(id, node.locale, entitiesRepo, generateType),
      );
      return context.nodeModel.getNodesByIds({ ids });
    },
  };
};
