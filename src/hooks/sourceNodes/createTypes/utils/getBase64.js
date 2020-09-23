const Queue = require('promise-queue');
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const request = require('request-promise-native');
const resizeUrl = require('./resizeUrl');
const queryString = require('query-string');

const queue = new Queue(3, Infinity);

function download(requestUrl, cacheDir) {
  const cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    const body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  return queue.add(() => {
    return request({
      uri: encodeURI(requestUrl),
      resolveWithFullResponse: true,
      encoding: 'base64',
    }).then(res => {
      const data =
        'data:' + res.headers['content-type'] + ';base64,' + res.body;
      fs.writeFileSync(cacheFile, data, 'utf8');
      return data;
    });
  });
}

module.exports = ({ src, width, height, aspectRatio }, cacheDir) => {
  const [baseUrl, query] = src.split('?');

  if (!baseUrl.startsWith('https://www.datocms-assets.com/')) {
    return download(
      resizeUrl({ url: src, aspectRatio, width, height }, 20),
      cacheDir,
    );
  }

  const imgixParams = queryString.parse(query);
  imgixParams.lqip = 'blurhash';

  return download(`${baseUrl}?${queryString.stringify(imgixParams)}`, cacheDir);
};
