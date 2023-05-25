const buildNode = require('../utils/buildNode');

const attributes = [
  'name',
  'singleton',
  'sortable',
  'apiKey',
  'orderingDirection',
  'tree',
  'modularBlock',
  'draftModeActive',
  'allLocalesRequired',
  'collectionAppearance',
  'hasSingletonItem',
];

module.exports = function buildItemTypeNode(entity, { generateType }) {
  return buildNode(generateType('Model'), entity.id, node => {
    attributes.forEach(attribute => {
      node[attribute] = entity[attribute];
    });

    node.originalId = entity.id;
    node.collectionAppeareance = entity.collectionAppearance;
    node.fields___NODE = entity.fields.map(
      field => `${generateType('Field')}-${field.id}`,
    );
  });
};
