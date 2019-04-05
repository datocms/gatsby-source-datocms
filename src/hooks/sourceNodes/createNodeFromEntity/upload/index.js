const objectAssign = require('object-assign');

const buildNode = require('../utils/buildNode'); 

module.exports = function buildUploadNode(entity, { entitiesRepo }) {
  const siteEntity = entitiesRepo.findEntitiesOfType('site')[0];
  const imgixHost = `https://${siteEntity.imgixHost}`;

  return buildNode('DatoCmsAsset', entity.id, (node) => {
    objectAssign(node, entity.payload.attributes);
    node.originalId = entity.id;
    node.url = `${imgixHost}${entity.path}`;
  });
}

