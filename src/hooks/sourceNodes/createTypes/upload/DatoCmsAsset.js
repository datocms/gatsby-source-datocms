const buildAssetFields = require('../utils/buildAssetFields');

module.exports = ({ actions, schema, store, cacheDir, generateType }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: generateType('Asset'),
      extensions: { infer: false },
      fields: {
        ...buildAssetFields({ cacheDir }),
      },
      interfaces: ['Node'],
    }),
    schema.buildEnumType({
      name: 'DatoCmsAssetVideoThumbnailFormat',
      values: {
        jpg: { value: 'jpg' },
        png: { value: 'png' },
        gif: { value: 'gif' },
      },
    }),
    schema.buildEnumType({
      name: 'DatoCmsAssetVideoMp4ResolutionQuality',
      values: {
        low: { value: 'low' },
        medium: { value: 'medium' },
        high: { value: 'high' },
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsAssetVideo',
      extensions: { infer: false },
      fields: {
        muxPlaybackId: 'String',
        frameRate: 'Int',
        duration: 'Int',
        streamingUrl: {
          type: 'String',
          resolve: upload => {
            return `https://stream.mux.com/${upload.muxPlaybackId}.m3u8`;
          },
        },
        thumbnailUrl: {
          type: 'String',
          args: {
            format: 'DatoCmsAssetVideoThumbnailFormat',
          },
          resolve: (upload, { format = 'jpg' }) => {
            if (format === 'gif') {
              return `https://image.mux.com/${upload.muxPlaybackId}/animated.gif`;
            }

            return `https://image.mux.com/${upload.muxPlaybackId}/thumbnail.${format}`;
          },
        },
        mp4Url: {
          type: 'String',
          args: {
            res: 'DatoCmsAssetVideoMp4ResolutionQuality',
            exactRes: 'DatoCmsAssetVideoMp4ResolutionQuality',
          },
          resolve: (upload, args) => {
            if (!upload.muxMp4HighestRes) {
              return null;
            }

            if (args.exactRes) {
              if (args.exactRes === 'low') {
                return `https://stream.mux.com/${upload.muxPlaybackId}/low.mp4`;
              }

              if (args.exactRes === 'medium') {
                return ['medium', 'high'].includes(upload.muxMp4HighestRes)
                  ? `https://stream.mux.com/${upload.muxPlaybackId}/medium.mp4`
                  : null;
              }

              if (upload.muxMp4HighestRes === 'high') {
                return `https://stream.mux.com/${upload.muxPlaybackId}/high.mp4`;
              }

              return null;
            }

            if (args.res === 'low') {
              return `https://stream.mux.com/${upload.muxPlaybackId}/low.mp4`;
            }

            if (args.res === 'medium') {
              if (['low', 'medium'].includes(upload.muxMp4HighestRes)) {
                return `https://stream.mux.com/${upload.muxPlaybackId}/${upload.muxMp4HighestRes}.mp4`;
              }

              return `https://stream.mux.com/${upload.muxPlaybackId}/medium.mp4`;
            }

            return `https://stream.mux.com/${upload.muxPlaybackId}/${upload.muxMp4HighestRes}.mp4`;
          },
        },
      },
    }),
  ]);
};
