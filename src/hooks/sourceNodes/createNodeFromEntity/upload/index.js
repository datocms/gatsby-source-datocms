const buildNode = require('../utils/buildNode');

const attributes = [
  'size',
  'width',
  'height',
  'path',
  'format',
  'isImage',
  'createdAt',
  'notes',
  'author',
  'copyright',
  'defaultFieldMetadata',
];

module.exports = function buildUploadNode(entity, { entitiesRepo }) {
  const siteEntity = entitiesRepo.findEntitiesOfType('site')[0];
  const imgixHost = `https://${siteEntity.imgixHost}`;

  return buildNode('DatoCmsAsset', entity.id, node => {
    attributes.forEach(attribute => {
      node[attribute] = entity[attribute];
    });
    node.originalId = entity.id;
    node.url = `${imgixHost}${entity.path}`;
  });
};
