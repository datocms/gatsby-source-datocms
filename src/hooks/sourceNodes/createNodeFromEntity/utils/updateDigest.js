const crypto = require('crypto');
const stringify = require('json-stringify-safe');

module.exports = function updateDigest(node) {
  delete node.internal.owner;

  node.internal.contentDigest = crypto
    .createHash('md5')
    .update(stringify(node))
    .digest('hex');

  return node;
}
