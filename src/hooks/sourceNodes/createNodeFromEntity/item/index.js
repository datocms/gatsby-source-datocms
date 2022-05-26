const { pascalize } = require('humps');
const { camelize } = require('datocms-client');
const { localizedRead } = require('datocms-client');

const buildNode = require('../utils/buildNode');

module.exports = function buildItemNode(entity, { generateType }) {
  const type = generateType(`${pascalize(entity.itemType.apiKey)}`);

  const itemNode = buildNode(type, entity.id, node => {
    node.entityPayload = entity.payload;
  });

  return [itemNode];
};
