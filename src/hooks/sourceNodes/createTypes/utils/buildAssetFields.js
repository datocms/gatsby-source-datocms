const queryString = require('query-string');
const { camelizeKeys } = require('datocms-client');
const buildFluidFields = require('../utils/buildFluidFields');
const buildFixedFields = require('../utils/buildFixedFields');
const createUrl = require('./createUrl');
const buildGatsbyImageDataFields = require('./buildGatsbyImageDataFields');

const resolveUsingEntityPayloadAttribute = (
  key,
  definition,
  camelize = false,
) => ({
  ...definition,
  resolve: node => {
    return camelize
      ? camelizeKeys(node.entityPayload.attributes[key])
      : node.entityPayload.attributes[key];
  },
});

module.exports = function({ cacheDir }) {
  return {
    size: resolveUsingEntityPayloadAttribute('size', { type: 'Int' }),
    width: resolveUsingEntityPayloadAttribute('width', { type: 'Int' }),
    height: resolveUsingEntityPayloadAttribute('height', { type: 'Int' }),
    path: resolveUsingEntityPayloadAttribute('path', { type: 'String' }),
    format: resolveUsingEntityPayloadAttribute('format', { type: 'String' }),
    isImage: resolveUsingEntityPayloadAttribute('is_image', {
      type: 'Boolean',
    }),
    notes: resolveUsingEntityPayloadAttribute('notes', { type: 'String' }),
    author: resolveUsingEntityPayloadAttribute('author', { type: 'String' }),
    copyright: resolveUsingEntityPayloadAttribute('copyright', {
      type: 'String',
    }),
    tags: resolveUsingEntityPayloadAttribute('tags', { type: '[String]' }),
    smartTags: resolveUsingEntityPayloadAttribute('smart_tags', {
      type: '[String]',
    }),
    filename: resolveUsingEntityPayloadAttribute('filename', {
      type: 'String',
    }),
    basename: resolveUsingEntityPayloadAttribute('basename', {
      type: 'String',
    }),
    exifInfo: resolveUsingEntityPayloadAttribute(
      'exif_info',
      { type: 'JSON' },
      true,
    ),
    mimeType: resolveUsingEntityPayloadAttribute('mime_type', {
      type: 'String',
    }),
    colors: resolveUsingEntityPayloadAttribute('colors', {
      type: '[DatoCmsColorField]',
    }),
    blurhash: resolveUsingEntityPayloadAttribute('blurhash', {
      type: 'String',
    }),
    originalId: { type: 'String', resolve: node => node.entityPayload.id },
    url: {
      type: 'String',
      args: {
        imgixParams: 'DatoCmsImgixParams',
      },
      resolve: (node, args) => {
        let url = `${node.imgixHost}${node.entityPayload.attributes.path}`;
        return createUrl(url, args.imgixParams, {
          autoFormat:
            node.entityPayload.attributes.is_image &&
            node.entityPayload.attributes.format !== 'svg',
          focalPoint: node.focalPoint,
        });
      },
    },
    createdAt: resolveUsingEntityPayloadAttribute('created_at', {
      type: 'Date',
      extensions: { dateformat: {}, proxy: {} },
    }),
    video: {
      type: 'DatoCmsAssetVideo',
      resolve: upload => {
        if (upload.entityPayload.attributes.mux_playback_id) {
          return camelizeKeys(upload.entityPayload.attributes);
        }

        return null;
      },
    },
    ...buildFluidFields(),
    ...buildFixedFields(),
    ...buildGatsbyImageDataFields({ cacheDir }),
  };
};
