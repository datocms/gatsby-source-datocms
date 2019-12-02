const buildFluidFields = require('../utils/buildFluidFields');
const buildFixedFields = require('../utils/buildFixedFields');

module.exports = function() {
  return {
    size: 'Int',
    width: 'Int',
    height: 'Int',
    path: 'String',
    format: 'String',
    isImage: 'Boolean',
    createdAt: {
      type: 'Date',
      extensions: { dateformat: {} },
    },
    url: 'String',
    notes: 'String',
    author: 'String',
    copyright: 'String',
    originalId: 'String',
    tags: '[String]',
    smartTags: '[String]',
    filename: 'String',
    basename: 'String',
    exifInfo: 'JSON',
    mimeType: 'String',
    colors: '[DatoCmsColorField]',
    blurhash: 'String',
    video: {
      type: 'DatoCmsAssetVideo',
      resolve: (upload) => {
        if (upload.muxPlaybackId) {
          return upload;
        }

        return null;
      },
    },
    ...buildFluidFields(),
    ...buildFixedFields(),
  };
}
