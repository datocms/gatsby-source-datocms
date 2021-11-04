const path = require('path');
const md5 = require('md5');
const resizeUrl = require('./resizeUrl');
const { fetchRemoteFile } = require('gatsby-core-utils');

module.exports = async ({ src, width, height }, cache) => {
  const { traceSVG } = require(`gatsby-plugin-sharp`);

  let absolutePath;
  const url = resizeUrl({ url: src, width, height }, 80);

  try {
    absolutePath = await fetchRemoteFile({ url, cache });
  } catch (e) {
    console.log(
      `Error downloading ${url} to generate traced SVG!: ${e.message}`,
    );
    return null;
  }

  const name = path.basename(absolutePath);
  const extension = path
    .extname(absolutePath)
    .split('.')
    .pop();

  try {
    const result = await traceSVG({
      file: {
        internal: {
          contentDigest: md5(url),
        },
        name,
        extension,
        absolutePath,
      },
      args: { toFormat: '' },
      fileArgs: {},
    });

    return result;
  } catch (e) {
    console.log(
      `Error generating traced SVG for "${url}": ${e.message}. Local file: ${absolutePath}, content: "${content}"`,
    );
    return null;
  }
};
