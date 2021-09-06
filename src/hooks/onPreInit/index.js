const { ERROR_MAP } = require("./errorMap")

let coreSupportsOnPluginInit;

try {
  const { isGatsbyNodeLifecycleSupported } = require(`gatsby-plugin-utils`);
  coreSupportsOnPluginInit = isGatsbyNodeLifecycleSupported(`unstable_onPluginInit`);
} catch (e) {
  coreSupportsOnPluginInit = false
}

/**
 * Enables structured reporting, provided the user's installed version of Gatsby has the structured reporting
 * API.
 */
module.exports = async ({ reporter }, {}) => {
  if (!coreSupportsOnPluginInit && reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP)
  }
}