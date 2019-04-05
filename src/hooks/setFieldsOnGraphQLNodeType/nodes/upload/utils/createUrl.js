const { decamelizeKeys } = require('humps');
const objectAssign = require('object-assign');
const queryString = require('query-string');

module.exports = (image, base = {}, extra = {}) => {
  const mergedParams = decamelizeKeys(objectAssign({}, base, extra), { separator: '-' });
  return `${image.url}?${queryString.stringify(mergedParams)}`;
}


