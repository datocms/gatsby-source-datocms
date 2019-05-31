const fs = require('fs-extra');
const path = require('path');

module.exports = async ({ store, getNodesByType }) => {
  const program = store.getState().program;

  if (getNodesByType(`DatoCmsAsset`).length > 0) {
    await fs.copy(
      path.join(__dirname, '..', '..', 'fragments', 'asset.js'),
      `${program.directory}/.cache/fragments/datocms-asset-fragments.js`,
    );
  }

  if (getNodesByType(`DatoCmsSeoMetaTags`).length > 0) {
    await fs.copy(
      path.join(__dirname, '..', '..', 'fragments', 'seo.js'),
      `${program.directory}/.cache/fragments/datocms-seo-fragments.js`,
    );
  }

  if (getNodesByType(`DatoCmsFaviconMetaTags`).length > 0) {
    await fs.copy(
      path.join(__dirname, '..', '..', 'fragments', 'favicon.js'),
      `${program.directory}/.cache/fragments/datocms-favicon-fragments.js`,
    );
  }
};
