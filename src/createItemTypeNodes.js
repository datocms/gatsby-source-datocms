const initNodeFromEntity = require('./initNodeFromEntity');
const addDigestToNode = require('./addDigestToNode');
const addEntityAttributes = require('./addEntityAttributes');

module.exports = function createItemTypeNodes(itemTypes, createNode) {
  itemTypes.forEach((itemType) => {

    let itemTypeNode = initNodeFromEntity(itemType);
    addEntityAttributes(itemTypeNode, itemType);
    itemTypeNode.fields___NODE = [];

    itemType.fields.forEach(field => {
      let fieldNode = initNodeFromEntity(field);
      addEntityAttributes(fieldNode, field);
      addDigestToNode(fieldNode);

      itemTypeNode.fields___NODE = itemTypeNode.fields___NODE.concat([fieldNode.id]);

      createNode(fieldNode);
    });

    addDigestToNode(itemTypeNode);
    createNode(itemTypeNode);
  });
}
