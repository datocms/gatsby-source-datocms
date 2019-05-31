const objectAssign = require('object-assign');

const buildNode = require('../utils/buildNode');

module.exports = function buildFieldNode(entity) {
  return buildNode('DatoCmsField', entity.id, node => {
    objectAssign(node, entity.payload.attributes);
    node.originalId = entity.id;
  });
};
