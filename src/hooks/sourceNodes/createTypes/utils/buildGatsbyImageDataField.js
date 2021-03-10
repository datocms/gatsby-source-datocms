const createUrl = require('./createUrl');
const { getGatsbyImageResolver } = require('gatsby-plugin-image/graphql-utils');
const { generateImageData } = require('gatsby-plugin-image');
const getBase64 = require('./getBase64');
const getTracedSVG = require('./getTracedSVG');

const blurHashCache = new Map();

const generateImageSource = (
  baseURL,
  width,
  height,
  format,
  fit,
  { focalPoint, ...options },
) => {
  const src = createUrl(
    baseURL,
    { ...options, w: width, h: height },
    { autoFormat: true, focalPoint },
  );

  return { src, width, height, format };
};

module.exports = ({ cacheDir }) => {
  async function resolve(
    node,
    { imgixParams = {}, placeholder = 'DOMINANT_COLOR', ...props },
  ) {
    const image = node?.entityPayload?.attributes;

    if (!image.is_image || image.format === 'svg') {
      return null;
    }

    const sourceMetadata = {
      width: image.width,
      height: image.height,
      format: image.format,
    };

    const otherProps = {};
    if (placeholder === 'DOMINANT_COLOR') {
      otherProps.backgroundColor = image.colors[0].hex;
    } else if (placeholder === 'BLURRED') {
      otherProps.placeholderURL = await getBase64(
        { ...sourceMetadata, src: image.url },
        cacheDir,
      );
    } else if (placeholder === 'TRACED_SVG') {
      otherProps.placeholderURL = await getTracedSVG(
        { ...sourceMetadata, src: image.url },
        cacheDir,
      );
    }

    imgixParams.focalPoint = node.focalPoint;

    return generateImageData({
      filename: image.url,
      pluginName: 'gatsby-source-datocms',
      generateImageSource,
      sourceMetadata,
      formats: ['auto'],
      options: imgixParams,
      ...otherProps,
      ...props,
    });
  }
  return getGatsbyImageResolver(resolve, {
    imgixParams: 'DatoCmsImgixParams',
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
};
