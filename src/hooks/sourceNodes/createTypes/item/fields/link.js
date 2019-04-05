const { camelize, pascalize } = require('humps');

module.exports = ({ parentItemType, field, schema, gqlItemTypeName, entitiesRepo }) => {
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
        resolve: (parent, args, context) => {
          const id = ('locale' in parent && 'value___NODE' in parent) ?
            parent.value___NODE :
            parent[`${fieldKey}___NODE`];

          if (id) {
            return context.nodeModel.getNodeById({ id });
          }
        },
      },
    };
  }

  const unionType = `DatoCmsUnionFor${parentItemTypeName}${pascalize(field.apiKey)}`;
  const unionTypes = itemTypeIds.map(id => gqlItemTypeName(entitiesRepo.findEntity('item_type', id)));

  return {
    types: [
      schema.buildUnionType({ name: unionType, types: unionTypes }),
    ],
    fieldType: {
      type: unionType,
      resolve: (parent, args, context) => {
        const id = ('locale' in parent && 'value___NODE' in parent) ?
          parent.value___NODE :
          parent[`${fieldKey}___NODE`];

        if (id) {
          return context.nodeModel.getNodeById({ id });
        }
      },
    },
  };
}
