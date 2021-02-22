const isImage = require('./isImage');
const getSizeAfterTransformations = require('./getSizeAfterTransformations');
const createUrl = require('./createUrl');
const objectAssign = require('object-assign');

module.exports = () => {
  const field = {
    type: 'DatoCmsFixed',
    args: {
      width: {
        type: 'Int',
        defaultValue: 400,
      },
      height: 'Int',
      forceBlurhash: 'Boolean',
      imgixParams: 'DatoCmsImgixParams',
      disableAutoFormat: 'Boolean',
    },
    resolve: (node, { forceBlurhash, width, height, imgixParams = {}, disableAutoFormat }) => {
      const image = node.entityPayload.attributes;

      if (!isImage(image)) {
        return null;
      }

      if (
        node.focalPoint &&
        imgixParams.fit === 'crop' &&
        (imgixParams.h || imgixParams.height) &&
        (imgixParams.w || imgixParams.width) &&
        (!imgixParams.crop || imgixParams.crop === 'focalpoint') &&
        !imgixParams['fp-x'] &&
        !imgixParams['fp-y']
      ) {
        imgixParams.crop = 'focalpoint';
        imgixParams['fp-x'] = node.focalPoint.x;
        imgixParams['fp-y'] = node.focalPoint.y;
      }

      const mergedImgixParams = objectAssign(
        {},
        imgixParams,
        { w: width },
        height && { h: height },
      );

      const {
        width: finalWidth,
        height: finalHeight,
      } = getSizeAfterTransformations(
        image.width,
        image.height,
        mergedImgixParams,
      );

      const aspectRatio = finalWidth / finalHeight;

      const srcSet = [1, 1.5, 2, 3]
        .map(dpr => {
          let extraParams = { dpr };
          if (!mergedImgixParams.w && !mergedImgixParams.h) {
            extraParams.w = finalWidth;
          }
          const url = createUrl(image, mergedImgixParams, extraParams, disableAutoFormat !== true);

          return `${url} ${dpr}x`;
        })
        .join(`,\n`);

      return {
        aspectRatio,
        width: finalWidth,
        height: finalHeight,
        format: image.format,
        src: createUrl(image, mergedImgixParams, {}, disableAutoFormat !== true),
        srcSet,
        forceBlurhash,
      };
    },
  };

  return {
    fixed: field,
    resolutions: field,
  };
};
