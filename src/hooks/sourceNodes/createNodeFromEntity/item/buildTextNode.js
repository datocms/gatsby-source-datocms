const buildNode = require('../utils/buildNode');
const { pascalize } = require('humps');

module.exports = function buildTextNode(itemNode, key, text, mediaType) {
  const str = text || ' ';

  return buildNode('DatoCmsTextNode', `${itemNode.id}-${key}`, node => {
    node.parent = itemNode.id;
    node.internal.mediaType = mediaType;
    node.internal.content = str;
  });
};
