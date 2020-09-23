const isImage = require('./isImage');
const getSizeAfterTransformations = require('./getSizeAfterTransformations');
const createUrl = require('./createUrl');

module.exports = () => {
  const field = {
    type: 'DatoCmsFluid',
    args: {
      maxWidth: {
        type: 'Int',
        defaultValue: 800,
      },
      maxHeight: 'Int',
      sizes: 'String',
      imgixParams: 'DatoCmsImgixParams',
    },
    resolve: (node, { maxWidth, maxHeight, imgixParams = {}, sizes }) => {
      const image = node.entityPayload.attributes;

      if (!isImage(image)) {
        return null;
      }

      const {
        width: finalWidth,
        height: finalHeight,
      } = getSizeAfterTransformations(image.width, image.height, imgixParams);

      const aspectRatio = finalWidth / finalHeight;

      const realMaxWidth = maxHeight ? maxHeight * aspectRatio : maxWidth;

      const realSizes =
        sizes || `(max-width: ${realMaxWidth}px) 100vw, ${realMaxWidth}px`;

      const srcSet = [0.25, 0.5, 1, 1.5, 2, 3]
        .map(m => realMaxWidth * m)
        .map(Math.round)
        .filter(screen => screen < finalWidth)
        .concat([finalWidth])
        .map(screen => {
          let extraParams = {
            dpr: Math.max(0.01, Math.ceil((screen / finalWidth) * 100) / 100),
          };

          if (!imgixParams.w && !imgixParams.h) {
            extraParams.w = finalWidth;
          }

          const url = createUrl(image, imgixParams, extraParams, true);

          return `${url} ${Math.round(screen)}w`;
        })
        .join(`,\n`);

      return {
        aspectRatio,
        src: createUrl(image, imgixParams, {}, true),
        width: finalWidth,
        height: finalHeight,
        format: image.format,
        srcSet,
        sizes: realSizes,
      };
    },
  };

  return {
    fluid: field,
    sizes: field,
  };
};
