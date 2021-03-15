const Queue = require('promise-queue');
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const got = require('got');
const resizeUrl = require('./resizeUrl');
const queryString = require('query-string');

const queue = new Queue(10, Infinity);

function download(requestUrl, cacheDir) {
  const cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    const body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  return queue.add(() => {
    return got(encodeURI(requestUrl), {
      encoding: 'base64',
      retry: {
        limit: 100,
      },
    }).then(res => {
      const data =
        'data:' + res.headers['content-type'] + ';base64,' + res.body;
      fs.writeFileSync(cacheFile, data, 'utf8');
      return data;
    });
  });
}

module.exports = ({ forceBlurhash, format, src, width, height }, cacheDir) => {
  const [baseUrl, query] = src.split('?');

  if (
    !baseUrl.startsWith('https://www.datocms-assets.com/') ||
    (format === 'png' && !forceBlurhash)
  ) {
    const url = resizeUrl({ url: src, width, height }, 20);

    try {
      return download(url, cacheDir);
    } catch (e) {
      console.log(
        `Error downloading ${url} to generate blurred placeholder!: ${e.message}`,
      );
      return '';
    }
  }

  const imgixParams = queryString.parse(query);
  imgixParams.lqip = 'blurhash';

  const url = `${baseUrl}?${queryString.stringify(imgixParams)}`;

  try {
    return download(url, cacheDir);
  } catch (e) {
    console.log(
      `Error downloading ${url} to generate Blurhash placeholder!: ${e.message}`,
    );
    return '';
  }
};
