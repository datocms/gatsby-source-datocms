const { camelize, pascalize } = require('humps');
const updateDigest = require('./createNodeFromEntity/utils/updateDigest');

function addChildrenToTreeLikeCollection(
  itemType,
  { entitiesRepo, getNodesByType, actions },
) {
  const nodes = getNodesByType(`DatoCms${pascalize(itemType.apiKey)}`);

  const childrenByNode = {};

  nodes.forEach(node => {
    if (node.treeParent___NODE) {
      childrenByNode[node.treeParent___NODE] = (
        childrenByNode[node.treeParent___NODE] || []
      ).concat([{ position: node.position, id: node.id }]);
    }
  });

  nodes.forEach(node => {
    const children = childrenByNode[node.id]
      ? childrenByNode[node.id]
          .sort((a, b) => a.position - b.position)
          .map(({ id }) => id)
      : [];

    if (node.treeChildren___NODE.join(',') !== children.join(',')) {
      node.treeChildren___NODE = children;
      updateDigest(node);
      actions.createNode(node);
    }
  });
}

function addChildrenToTreeLikeCollections(context) {
  const { entitiesRepo } = context;

  entitiesRepo
    .findEntitiesOfType('item_type')
    .filter(itemType => itemType.tree)
    .forEach(itemType => addChildrenToTreeLikeCollection(itemType, context));
}

module.exports = function finalizeNodesCreation(context) {
  addChildrenToTreeLikeCollections(context);
};
