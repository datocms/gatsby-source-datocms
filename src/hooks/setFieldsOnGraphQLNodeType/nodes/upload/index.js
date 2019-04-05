const fs = require('fs-extra');

const fluidResolver = require('./fluidResolver');
const fixedResolver = require('./fixedResolver');

module.exports = function extendAssetNode({ type, store }) {
  if (type.name !== 'DatoCmsAsset') {
    return {};
  }

  const program = store.getState().program;
  const cacheDir = `${program.directory}/.cache/datocms-assets`;

  if (!fs.existsSync(cacheDir)){
    fs.mkdirSync(cacheDir);
  }

  const fluid = fluidResolver(cacheDir);
  const fixed = fixedResolver(cacheDir);

  return {
    fluid,
    fixed,
    sizes: fluid,
    resolutions: fixed,
  };
}
