"use strict";

var _require = require('humps'),
    decamelizeKeys = _require.decamelizeKeys;

var objectAssign = require('object-assign');

var queryString = require('query-string');

module.exports = function (image) {
  var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var autoFormat = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var mergedParams = decamelizeKeys(objectAssign({}, base, extra), {
    separator: '-'
  });

  if (autoFormat) {
    var auto = (mergedParams.auto || '').split(',');
    mergedParams.auto = auto.filter(function (a) {
      return !!a && a !== 'format';
    }).concat(['format']).join(',');
  }

  return "".concat(image.url, "?").concat(queryString.stringify(mergedParams));
};