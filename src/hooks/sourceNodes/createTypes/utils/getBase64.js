const fs = require('fs/promises');
const path = require('path');
const resizeUrl = require('./resizeUrl');
const queryString = require('query-string');
const { fetchRemoteFile } = require('gatsby-core-utils');

var magicNumbersToMimeType = {
  ffd8ffe0: 'image/jpeg',
  '89504e47': 'image/png',
  '47494638': 'image/gif',
  '52494646': 'image/webp',
};

async function download(url, cache) {
  const absolutePath = await fetchRemoteFile({ url, cache });
  const fileBody = await fs.readFile(absolutePath);
  const base64 = fileBody.toString(`base64`);
  const magicNumber = fileBody.toString('hex', 0, 4);

  const extension = path
    .extname(absolutePath)
    .split('.')
    .pop();

  const mimeType = magicNumbersToMimeType[magicNumber] || `image/${extension}`;

  return `data:${mimeType};base64,${base64}`;
}

module.exports = async (
  { forceBlurhash, format, src, width, height },
  cache,
) => {
  const [baseUrl, query] = src.split('?');

  if (
    !baseUrl.startsWith('https://www.datocms-assets.com/') ||
    (format === 'png' && !forceBlurhash)
  ) {
    const url = resizeUrl({ url: src, width, height }, 20);

    try {
      const result = await download(url, cache);
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
    const result = await download(url, cache);
    return result;
  } catch (e) {
    console.log(
      `Error downloading ${url} to generate Blurhash placeholder!: ${e.message}`,
    );
    return null;
  }
};
