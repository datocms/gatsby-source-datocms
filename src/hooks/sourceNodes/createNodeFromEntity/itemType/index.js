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
  'collectionAppeareance',
  'hasSingletonItem',
];

module.exports = function buildItemTypeNode(entity, { generateType }) {
  return buildNode(generateType('Model'), entity.id, node => {
    attributes.forEach(attribute => {
      node[attribute] = entity[attribute];
    });

    node.originalId = entity.id;
    node.fields___NODE = entity.fields.map(field => `DatoCmsField-${field.id}`);
  });
};
