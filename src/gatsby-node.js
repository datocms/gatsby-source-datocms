require('core-js/stable');
require('regenerator-runtime/runtime');

let coreSupportsOnPluginInit;

try {
  const { isGatsbyNodeLifecycleSupported } = require(`gatsby-plugin-utils`);
  coreSupportsOnPluginInit = isGatsbyNodeLifecycleSupported(`unstable_onPluginInit`);
} catch (e) {
  coreSupportsOnPluginInit = false
}

const onPreInit = require('./hooks/onPreInit')
exports.onPreInit = onPreInit;

if (coreSupportsOnPluginInit) {
  const onPluginInit = require('./hooks/onPluginInit')
  exports.unstable_onPluginInit = onPluginInit;
}

const createSchemaCustomization = require('./hooks/createSchemaCustomization');
exports.createSchemaCustomization = createSchemaCustomization;

const sourceNodes = require('./hooks/sourceNodes');
exports.sourceNodes = sourceNodes;
