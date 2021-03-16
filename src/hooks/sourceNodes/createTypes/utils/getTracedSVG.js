const Queue = require('promise-queue');
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const resizeUrl = require('./resizeUrl');
const got = require('got');

const queue = new Queue(10, Infinity);
const promises = {};

function download(requestUrl, cacheDir) {
  const cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    return Promise.resolve(cacheFile);
  }

  const key = JSON.stringify({ requestUrl, cacheFile });

  if (promises[key]) {
    return promises[key];
  }

  promises[key] = queue.add(() => {
    return got(requestUrl, {
      responseType: 'buffer',
      maxRedirects: 10,
      retry: {
        limit: 5,
      },
    }).then(response => {
      fs.writeFileSync(cacheFile, response.body);
      return cacheFile;
    });
  });

  return promises[key];
}

module.exports = async ({ src, width, height }, cacheDir) => {
  const { traceSVG } = require(`gatsby-plugin-sharp`);

  let absolutePath;
  const url = resizeUrl({ url: src, width, height }, 80);

  try {
    absolutePath = await download(url, cacheDir);
  } catch (e) {
    console.log(
      `Error downloading ${url} to generate traced SVG!: ${e.message}`,
    );
    return null;
  }

  const name = path.basename(absolutePath);

  try {
    const result = await traceSVG({
      file: {
        internal: {
          contentDigest: md5(absolutePath),
        },
        name,
        extension: 'png',
        absolutePath,
      },
      args: { toFormat: '' },
      fileArgs: {},
    });
    return result;
  } catch (e) {
    const content = fs.readFileSync(absolutePath, { encoding: 'base64' });
    console.log(`Error generating traced SVG for "${url}": ${e.message}. Local file: ${absolutePath}, content: "${content}"`);
    return null;
  }
};
