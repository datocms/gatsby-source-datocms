"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pluginPrefix = 'gatsby-source-datocms';

function prefixId(id) {
  return "".concat(pluginPrefix, "_").concat(id);
}

var ReporterLevel = {
  Error: 'ERROR'
};
var ReporterCategory = {
  // Error caused by user (typically, site misconfiguration)
  User: 'USER',
  // Error caused by DatoCMS plugin ("third party" relative to Gatsby Cloud)
  ThirdParty: 'THIRD_PARTY',
  // Error caused by Gatsby process
  System: 'SYSTEM'
};
var CODES = {
  MissingAPIToken: '10000'
};

var ERROR_MAP = _defineProperty({}, CODES.MissingAPIToken, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: ReporterLevel.Error,
  category: ReporterCategory.User
});

module.exports = {
  pluginPrefix: pluginPrefix,
  CODES: CODES,
  prefixId: prefixId,
  ERROR_MAP: ERROR_MAP
};