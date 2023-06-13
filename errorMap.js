'use strict';

function _typeof(obj) {
  '@babel/helpers - typeof';
  return (
    (_typeof =
      'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
        ? function(obj) {
            return typeof obj;
          }
        : function(obj) {
            return obj &&
              'function' == typeof Symbol &&
              obj.constructor === Symbol &&
              obj !== Symbol.prototype
              ? 'symbol'
              : typeof obj;
          }),
    _typeof(obj)
  );
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, 'string');
  return _typeof(key) === 'symbol' ? key : String(key);
}
function _toPrimitive(input, hint) {
  if (_typeof(input) !== 'object' || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || 'default');
    if (_typeof(res) !== 'object') return res;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (hint === 'string' ? String : Number)(input);
}
var pluginPrefix = 'gatsby-source-datocms';
function prefixId(id) {
  return ''.concat(pluginPrefix, '_').concat(id);
}
var ReporterLevel = {
  Error: 'ERROR',
};
var ReporterCategory = {
  // Error caused by user (typically, site misconfiguration)
  User: 'USER',
  // Error caused by DatoCMS plugin ("third party" relative to Gatsby Cloud)
  ThirdParty: 'THIRD_PARTY',
  // Error caused by Gatsby process
  System: 'SYSTEM',
};
var CODES = {
  MissingAPIToken: '10000',
};
var ERROR_MAP = _defineProperty({}, CODES.MissingAPIToken, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: ReporterLevel.Error,
  category: ReporterCategory.User,
});
module.exports = {
  pluginPrefix: pluginPrefix,
  CODES: CODES,
  prefixId: prefixId,
  ERROR_MAP: ERROR_MAP,
};
