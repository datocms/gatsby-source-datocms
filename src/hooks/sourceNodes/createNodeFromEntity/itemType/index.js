const objectAssign = require('object-assign');

const buildNode = require('../utils/buildNode');

module.exports = function buildItemTypeNode(
  entity,
  { entitiesRepo, actions, schema },
) {
  return buildNode('DatoCmsModel', entity.id, node => {
    objectAssign(node, entity.payload.attributes);
    node.originalId = entity.id;
    node.fields___NODE = entity.fields.map(field => `DatoCmsField-${field.id}`);
  });
};
