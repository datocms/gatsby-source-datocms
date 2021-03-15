const buildNode = require('../utils/buildNode');

module.exports = function buildUploadNode(entity, { entitiesRepo, generateType }) {
  const siteEntity = entitiesRepo.findEntitiesOfType('site')[0];
  const imgixHost = `https://${siteEntity.imgixHost}`;

  return buildNode(generateType('Asset'), entity.id, node => {
    node.entityPayload = entity.payload;
    node.imgixHost = imgixHost;
    node.digest = entity.path + entity.updatedAt;
  });
};
