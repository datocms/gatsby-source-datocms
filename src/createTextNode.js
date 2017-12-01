const digest = require('./digest');
const { pascalize } = require('humps');

module.exports = function createTextNode(node, key, text, mediaType, createNode) {
  const str = text || ' ';

  const textNode = {
    id: `${node.id}${pascalize(key)}TextNode`,
    parent: node.id,
    children: [],
    [key]: str,
    internal: {
      type: `${node.internal.type}${pascalize(key)}TextNode`,
      mediaType,
      content: str,
      contentDigest: digest(str),
    },
  }

  node.children = node.children.concat([textNode.id])
  createNode(textNode)

  return textNode.id;
}
