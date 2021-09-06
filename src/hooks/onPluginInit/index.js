const { ERROR_MAP } = require("../onPreInit/errorMap")

module.exports = async ({ reporter }) => {
  reporter.setErrorMap(ERROR_MAP)
}