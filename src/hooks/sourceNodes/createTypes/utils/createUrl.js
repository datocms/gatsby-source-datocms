const { decamelizeKeys } = require('humps');
const objectAssign = require('object-assign');
const queryString = require('query-string');

module.exports = (image, base = {}, extra = {}, autoFormat = false) => {
  const mergedParams = decamelizeKeys(objectAssign({}, base, extra), {
    separator: '-',
  });

  if (autoFormat) {
    const auto = (mergedParams.auto || '').split(',');
    mergedParams.auto = auto
      .filter(a => !!a && a !== 'format')
      .concat(['format'])
      .join(',');
  }

  return `${image.url}?${queryString.stringify(mergedParams)}`;
};
