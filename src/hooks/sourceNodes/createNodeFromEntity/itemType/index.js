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

module.exports = function buildItemTypeNode(
  entity,
  { entitiesRepo, actions, schema },
) {
  return buildNode('DatoCmsModel', entity.id, node => {
    attributes.forEach(attribute => {
      node[attribute] = entity[attribute];
    });

    node.originalId = entity.id;
    node.fields___NODE = entity.fields.map(field => `DatoCmsField-${field.id}`);
  });
};
