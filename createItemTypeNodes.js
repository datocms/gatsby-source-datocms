'use strict';

var initNodeFromEntity = require('./initNodeFromEntity');
var addDigestToNode = require('./addDigestToNode');
var addEntityAttributes = require('./addEntityAttributes');

module.exports = function createItemTypeNodes(itemTypes, createNode) {
  itemTypes.forEach(function (itemType) {

    var itemTypeNode = initNodeFromEntity(itemType);
    addEntityAttributes(itemTypeNode, itemType);
    itemTypeNode.fields___NODE = [];

    itemType.fields.forEach(function (field) {
      var fieldNode = initNodeFromEntity(field);
      addEntityAttributes(fieldNode, field);
      addDigestToNode(fieldNode);

      itemTypeNode.fields___NODE = itemTypeNode.fields___NODE.concat([fieldNode.id]);

      createNode(fieldNode);
    });

    addDigestToNode(itemTypeNode);
    createNode(itemTypeNode);
  });
};