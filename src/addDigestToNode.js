const digest = require('./digest');
const stringify = require('json-stringify-safe');

module.exports = function addDigestToNode(node) {
  node.internal.contentDigest = digest(stringify(node));
}
