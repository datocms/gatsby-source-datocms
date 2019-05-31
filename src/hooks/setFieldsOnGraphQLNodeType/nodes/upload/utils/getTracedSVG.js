const Queue = require('promise-queue');
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const request = require('request');
const resizeUrl = require('./resizeUrl');

const queue = new Queue(3, Infinity);

function download(requestUrl, cacheDir) {
  const cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    return Promise.resolve(cacheFile);
  }

  return queue.add(
    () =>
      new Promise((resolve, reject) => {
        const r = request(requestUrl);

        r.on('error', reject);
        r.on('response', function(resp) {
          if (resp.statusCode !== 200) {
            reject();
          }

          r.pipe(fs.createWriteStream(cacheFile))
            .on('finish', () => resolve(cacheFile))
            .on('error', reject);
        });
      }),
  );
}

module.exports = async ({ src, width, height, aspectRatio }, cacheDir) => {
  const { traceSVG } = require(`gatsby-plugin-sharp`);

  const absolutePath = await download(
    resizeUrl({ url: src, aspectRatio, width, height }, 100),
    cacheDir,
  );

  const name = path.basename(absolutePath);

  return traceSVG({
    file: {
      internal: {
        contentDigest: md5(absolutePath),
      },
      name,
      extension: 'jpg',
      absolutePath,
    },
    args: { toFormat: '' },
    fileArgs: {},
  });
};
