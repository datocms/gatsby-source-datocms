const { decamelizeKeys } = require('humps');
const objectAssign = require('object-assign');
const queryString = require('query-string');

module.exports = (imageUrl, imgixParams = {}, options = {}) => {
  const mergedParams = decamelizeKeys(imgixParams, {
    separator: '-',
  });

  const mergedOptions = objectAssign(
    {
      autoFormat: false,
      focalPoint: null,
    },
    options,
  );

  if (mergedOptions.autoFormat && !mergedParams.fm) {
    const auto = (mergedParams.auto || '').split(',');
    mergedParams.auto = auto
      .filter(a => !!a && a !== 'format')
      .concat(['format'])
      .join(',');
  }

  if (
    mergedOptions.focalPoint &&
    mergedParams.fit === 'crop' &&
    (((mergedParams.h || mergedParams.height) &&
      (mergedParams.w || mergedParams.width)) ||
      mergedParams.ar) &&
    (!mergedParams.crop || mergedParams.crop === 'focalpoint') &&
    !mergedParams['fp-x'] &&
    !mergedParams['fp-y']
  ) {
    mergedParams.crop = 'focalpoint';
    mergedParams['fp-x'] = mergedOptions.focalPoint.x;
    mergedParams['fp-y'] = mergedOptions.focalPoint.y;
  }

  if (Object.keys(mergedParams).length === 0) {
    return imageUrl;
  }

  return `${imageUrl}?${queryString.stringify(mergedParams)}`;
};
