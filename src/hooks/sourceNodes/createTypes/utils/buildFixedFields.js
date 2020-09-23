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
      imgixParams: 'DatoCmsImgixParams',
    },
    resolve: (node, { width, height, imgixParams = {} }) => {
      const image = node.entityPayload.attributes;

      if (!isImage(image)) {
        return null;
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
          const url = createUrl(image, mergedImgixParams, extraParams, true);

          return `${url} ${dpr}x`;
        })
        .join(`,\n`);

      return {
        aspectRatio,
        width: finalWidth,
        height: finalHeight,
        format: image.format,
        src: createUrl(image, mergedImgixParams, {}, true),
        srcSet,
      };
    },
  };

  return {
    fixed: field,
    resolutions: field,
  };
};
