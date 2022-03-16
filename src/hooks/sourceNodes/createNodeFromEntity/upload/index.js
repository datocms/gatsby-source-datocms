const buildNode = require('../utils/buildNode');

module.exports = function buildUploadNode(
  entity,
  { entitiesRepo, generateType },
) {
  const siteEntity = entitiesRepo.findEntitiesOfType('site')[0];
  const imgixHost = `https://${siteEntity.imgixHost}`;

  return buildNode(generateType('Asset'), entity.id, node => {
    node.entityPayload = entity.payload;
    node.imgixHost = imgixHost;
    node.digest = entity.path + entity.updatedAt;

    // Gatsby Image CDN fields:
    node.mimeType = node.entityPayload.attributes.mime_type;
    node.filename = node.entityPayload.attributes.filename;
    node.width = node.entityPayload.attributes.width;
    node.height = node.entityPayload.attributes.height;
    node.url = node.entityPayload.attributes.url;
    node.placeholderUrl = node.url + `?w=20`; // tiny image transformed by imgix
  });
};
