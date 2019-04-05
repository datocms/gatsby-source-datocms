'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var digest = require('./digest');

var _require = require('humps'),
    pascalize = _require.pascalize;

module.exports = function createTextNode(node, key, text, mediaType, createNode) {
  var _textNode;

  var str = text || ' ';

  var textNode = (_textNode = {
    id: '' + node.id + pascalize(key) + 'TextNode',
    parent: node.id,
    children: []
  }, _defineProperty(_textNode, key, str), _defineProperty(_textNode, 'internal', {
    type: '' + node.internal.type + pascalize(key) + 'TextNode',
    mediaType: mediaType,
    content: str,
    contentDigest: digest(str)
  }), _textNode);

  node.children = node.children.concat([textNode.id]);
  createNode(textNode);

  return textNode.id;
};