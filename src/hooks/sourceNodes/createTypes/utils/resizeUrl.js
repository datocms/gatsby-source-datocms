const queryString = require('query-string');
const createUrl = require('./createUrl');
const objectAssign = require('object-assign');

module.exports = ({ url, width, height }, size) => {
  const [baseUrl, query] = url.split('?');
  const imgixParams = queryString.parse(query);

  const dpr =
    width > height
      ? Math.ceil((size / width) * 100) / 100
      : Math.ceil((size / height) * 100) / 100;

  let extraParams = { dpr: Math.max(0.01, dpr) };

  if (!imgixParams.w && !imgixParams.h) {
    extraParams.w = width;
  }

  extraParams.q = '30';

  return createUrl(
    baseUrl,
    objectAssign({}, imgixParams, extraParams),
    { autoFormat: false },
  );
};
