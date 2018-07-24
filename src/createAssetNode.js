const addDigestToNode = require('./addDigestToNode');
const { buildField } = require('datocms-client');
const objectAssign =require('object-assign');

module.exports = function createAssetNode(parent, field, value, itemsRepo, createNode) {
  if (!value) {
    return null;
  }

  const node = objectAssign(
    {
      id: `DatoCmsAsset-${value}`,
      parent: parent.id,
      children: [],
      internal: {
        type: `DatoCmsAsset`,
      }
    },
    buildField('file', value, itemsRepo).toMap()
  );

  parent.children = node.children.concat([node.id]);
  addDigestToNode(node);
  createNode(node);

  return node.id;
};
