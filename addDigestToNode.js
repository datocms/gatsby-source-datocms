'use strict';

var digest = require('./digest');
var stringify = require('json-stringify-safe');

module.exports = function addDigestToNode(node) {
  node.internal.contentDigest = digest(stringify(node));
};