const { camelizeKeys } = require('datocms-client');

module.exports = type => () => ({
  type,
  resolveForSimpleField: value => camelizeKeys(value),
});
