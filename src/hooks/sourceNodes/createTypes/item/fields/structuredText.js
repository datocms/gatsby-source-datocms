const { pascalize } = require('humps');
const visit = require('unist-util-visit');
const {
  isInlineItem,
  isItemLink,
  isBlock,
} = require('datocms-structured-text-utils');
const uniq = require('lodash.uniq');
const itemNodeId = require('../../utils/itemNodeId');

const buildFor = (
  unionType,
  itemTypeIds,
  entitiesRepo,
  gqlItemTypeName,
  schema,
) => {
  if (itemTypeIds.length === 0) {
    return ['String', null];
  }

  if (itemTypeIds.length === 1) {
    const linkedItemType = entitiesRepo.findEntity('item_type', itemTypeIds[0]);

    return [gqlItemTypeName(linkedItemType), null];
  }

  return [
    unionType,
    schema.buildUnionType({
      name: unionType,
      types: itemTypeIds.map(id =>
        gqlItemTypeName(entitiesRepo.findEntity('item_type', id)),
      ),
    }),
  ];
};

const findAll = (document, predicate) => {
  const result = [];

  visit(document, predicate, node => {
    result.push(node);
  });

  return result;
};

module.exports = ({
  parentItemType,
  field,
  schema,
  gqlItemTypeName,
  entitiesRepo,
  generateType,
}) => {
  const parentItemTypeName = gqlItemTypeName(parentItemType);

  const fieldTypeName = `DatoCms${parentItemTypeName}${pascalize(
    field.apiKey,
  )}StructuredText`;

  const [blockFieldTypeName, blockFieldType] = buildFor(
    `${fieldTypeName}Blocks`,
    field.validators.structuredTextBlocks.itemTypes,
    entitiesRepo,
    gqlItemTypeName,
    schema,
  );
  const [linkFieldTypeName, linkFieldType] = buildFor(
    `${fieldTypeName}Links`,
    field.validators.structuredTextLinks.itemTypes,
    entitiesRepo,
    gqlItemTypeName,
    schema,
  );

  return {
    type: fieldTypeName,
    additionalTypesToCreate: [
      blockFieldType,
      linkFieldType,
      schema.buildObjectType({
        name: fieldTypeName,
        extensions: { infer: false },
        fields: {
          value: 'JSON',
          blocks: `[${blockFieldTypeName}]`,
          links: `[${linkFieldTypeName}]`,
        },
      }),
    ].filter(x => !!x),
    resolveForSimpleField: (fieldValue, context, gqlNode) => {
      const linkedItemIds = fieldValue
        ? uniq(
            findAll(fieldValue.document, [isInlineItem, isItemLink]).map(node =>
              itemNodeId(node.item, gqlNode.locale, entitiesRepo, generateType),
            ),
          )
        : [];

      const blockIds = fieldValue
        ? uniq(
            findAll(fieldValue.document, isBlock).map(node =>
              itemNodeId(node.item, gqlNode.locale, entitiesRepo, generateType),
            ),
          )
        : [];

      return {
        value: fieldValue,
        blocks: context.nodeModel.getNodesByIds({ ids: blockIds }),
        links: context.nodeModel.getNodesByIds({ ids: linkedItemIds }),
      };
    },
  };
};
