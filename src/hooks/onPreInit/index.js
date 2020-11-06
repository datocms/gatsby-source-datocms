const { ERROR_MAP } = require("./errorMap")

/**
 * Enables structured reporting, provided the user's installed version of Gatsby has the structured reporting
 * API.
 * 
 * @param {*} param0 
 * @param {*} param1 
 */
module.exports = async ({ reporter }, {}) => {
  if (reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP)
  }
}