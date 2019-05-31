const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
} = require('gatsby/graphql');

const ImgixParamsType = require('./ImgixParamsType');
const isImage = require('./utils/isImage');
const getSizeAfterTransformations = require('./utils/getSizeAfterTransformations');
const createUrl = require('./utils/createUrl');
const getBase64 = require('./utils/getBase64');
const getTracedSVG = require('./utils/getTracedSVG');

const args = {
  maxWidth: {
    type: GraphQLInt,
    defaultValue: 800,
  },
  maxHeight: {
    type: GraphQLInt,
  },
  sizes: {
    type: GraphQLString,
  },
  imgixParams: {
    type: ImgixParamsType,
  },
};

module.exports = cacheDir => ({
  type: new GraphQLObjectType({
    name: `DatoCmsFluid`,
    fields: {
      base64: {
        type: GraphQLString,
        resolve: image => getBase64(image, cacheDir),
      },
      tracedSVG: {
        type: GraphQLString,
        resolve: image => getTracedSVG(image, cacheDir),
      },
      aspectRatio: { type: GraphQLFloat },
      width: { type: GraphQLInt },
      height: { type: GraphQLInt },
      src: { type: GraphQLString },
      srcSet: { type: GraphQLString },
      sizes: { type: GraphQLString },
    },
  }),
  args,
  resolve: (image, { maxWidth, maxHeight, imgixParams = {}, sizes }) => {
    if (!isImage(image)) {
      return null;
    }

    const {
      width: finalWidth,
      height: finalHeight,
    } = getSizeAfterTransformations(image.width, image.height, imgixParams);

    const aspectRatio = finalWidth / finalHeight;

    const realMaxWidth = maxWidth || maxHeight * aspectRatio;

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
});
