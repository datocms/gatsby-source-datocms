const Queue = require('promise-queue');
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const resizeUrl = require('./resizeUrl');
const got = require('got');

const queue = new Queue(10, Infinity);

function download(requestUrl, cacheDir) {
  const cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    return Promise.resolve(cacheFile);
  }

  return queue.add(() => {
    return got(requestUrl, {
      responseType: 'buffer',
      maxRedirects: 10,
      retry: {
        limit: 100,
      },
    }).then(response => {
      fs.writeFileSync(cacheFile, response.body);
      return cacheFile;
    });
  });
}

module.exports = async ({ src, width, height }, cacheDir) => {
  const { traceSVG } = require(`gatsby-plugin-sharp`);

  const absolutePath = await download(
    resizeUrl({ url: src, width, height }, 100),
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
