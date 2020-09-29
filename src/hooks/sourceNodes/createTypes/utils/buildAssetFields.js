const queryString = require('query-string');
const { camelizeKeys } = require('datocms-client');
const buildFluidFields = require('../utils/buildFluidFields');
const buildFixedFields = require('../utils/buildFixedFields');

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

module.exports = function() {
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

        if (args.imgixParams && Object.keys(args.imgixParams).length > 0) {
          const query = { ...args.imgixParams };

          if (
            node.focalPoint &&
            query.fit === 'crop' &&
            (query.h || query.height) &&
            (query.w || query.width) &&
            (!query.crop || query.crop === 'focalpoint') &&
            !query['fp-x'] &&
            !query['fp-y']
          ) {
            query.crop = 'focalpoint';
            query['fp-x'] = node.focalPoint.x;
            query['fp-y'] = node.focalPoint.y;
          }

          url += `?${queryString.stringify(query)}`
        }

        return url;
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
  };
};
