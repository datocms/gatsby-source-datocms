const Queue = require('promise-queue');
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const got = require('got');
const resizeUrl = require('./resizeUrl');
const queryString = require('query-string');

const queue = new Queue(10, Infinity);
const promises = {};

function download(requestUrl, cacheDir) {
  const cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    const body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  const key = JSON.stringify({ requestUrl, cacheFile });

  if (promises[key]) {
    return promises[key];
  }

  promises[key] = queue.add(() => {
    return got(encodeURI(requestUrl), {
      encoding: 'base64',
      retry: {
        limit: 5,
      },
    }).then(res => {
      const data =
        'data:' + res.headers['content-type'] + ';base64,' + res.body;
      fs.writeFileSync(cacheFile, data, 'utf8');
      return data;
    });
  });

  return promises[key];
}

module.exports = async ({ forceBlurhash, format, src, width, height }, cacheDir) => {
  const [baseUrl, query] = src.split('?');

  if (
    !baseUrl.startsWith('https://www.datocms-assets.com/') ||
    (format === 'png' && !forceBlurhash)
  ) {
    const url = resizeUrl({ url: src, width, height }, 20);

    try {
      const result = await download(url, cacheDir);
      return result;
    } catch (e) {
      console.log(
        `Error downloading ${url} to generate blurred placeholder!: ${e.message}`,
      );
      return null;
    }
  }

  const imgixParams = queryString.parse(query);
  imgixParams.lqip = 'blurhash';

  const url = `${baseUrl}?${queryString.stringify(imgixParams)}`;

  try {
    const result = await download(url, cacheDir);
    return result;
  } catch (e) {
    console.log(
      `Error downloading ${url} to generate Blurhash placeholder!: ${e.message}`,
    );
    return null;
  }
};
