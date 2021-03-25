const createUrl = require('./createUrl');
const getSizeAfterTransformations = require('./getSizeAfterTransformations');
const getBase64 = require('./getBase64');
const getTracedSVG = require('./getTracedSVG');
const toHex = require('./toHex');

const generateImageSource = (
  baseURL,
  width,
  height,
  format,
  fit,
  { focalPoint, imgixParams, finalSize },
) => {
  let extraParams = {};

  const scale = Math.max(
    0.01,
    Math.ceil((width / finalSize.width) * 100) / 100,
  );

  if (scale !== 1.0) {
    extraParams.dpr = scale;
  }

  if (!imgixParams.w && !imgixParams.h) {
    extraParams.w = finalSize.width;
  }

  const src = createUrl(
    baseURL,
    { ...imgixParams, ...extraParams },
    { autoFormat: true, focalPoint },
  );

  return { src, width, height, format };
};

module.exports = ({ cacheDir }) => {
  let gatsbyPluginImageFound = false;

  try {
    require('gatsby-plugin-image');
    gatsbyPluginImageFound = true;
  } catch(e) {}

  if (!gatsbyPluginImageFound) {
    return {};
  }

  const { getGatsbyImageResolver } = require('gatsby-plugin-image/graphql-utils');
  const { generateImageData } = require('gatsby-plugin-image');

  async function resolve(
    node,
    { imgixParams = {}, placeholder = 'BLURRED', forceBlurhash, ...props },
  ) {
    const image = node?.entityPayload?.attributes;

    if (!image.is_image || image.format === 'svg') {
      return null;
    }

    if (props.width) {
      imgixParams.w = props.width;
    }

    if (props.height) {
      imgixParams.h = props.height;
    }

    if (props.width && props.height && !imgixParams.fit) {
      imgixParams.fit = 'crop';
    }

    const finalSize = getSizeAfterTransformations(
      image.width,
      image.height,
      imgixParams,
    );

    const sourceMetadata = {
      width: finalSize.width,
      height: finalSize.height,
      format: image.format,
    };

    const otherProps = {};

    const placeholderImageData = {
      ...sourceMetadata,
      forceBlurhash,
      src: createUrl(image.url, imgixParams, {
        autoFormat: true,
        focalPoint: node.focalPoint,
      }),
    };

    if (placeholder === 'DOMINANT_COLOR') {
      otherProps.backgroundColor = image.colors[0] && toHex(image.colors[0]);
    } else if (placeholder === 'BLURRED') {
      otherProps.placeholderURL = await getBase64(
        placeholderImageData,
        cacheDir,
      );
    } else if (placeholder === 'TRACED_SVG') {
      otherProps.placeholderURL = await getTracedSVG(
        placeholderImageData,
        cacheDir,
      );
    }

    return generateImageData({
      filename: image.url,
      pluginName: 'gatsby-source-datocms',
      generateImageSource,
      sourceMetadata,
      formats: ['auto'],
      options: { imgixParams, focalPoint: node.focalPoint, finalSize },
      ...otherProps,
      ...props,
    });
  }

  const resolver = getGatsbyImageResolver(resolve, {
    imgixParams: 'DatoCmsImgixParams',
    forceBlurhash: 'Boolean',
    placeholder: {
      type:
        'enum DatoImagePlaceholder { NONE, DOMINANT_COLOR, TRACED_SVG, BLURRED }',
      description: `Format of generated placeholder, displayed while the main image loads.
DOMINANT_COLOR: a solid color, calculated from the dominant color of the image (default).
BLURRED: a blurred, low resolution image, encoded as a base64 data URI
TRACED_SVG: a low-resolution traced SVG of the image. Note that this will download the image at build time for processing.
NONE: no placeholder. Set "backgroundColor" to use a fixed background color.`,
    },
  });

  return {
    gatsbyImageData: { ...resolver, type: 'JSON' },
  };
};
