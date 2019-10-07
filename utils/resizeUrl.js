"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var queryString = require('query-string');

var createUrl = require('./createUrl');

module.exports = function (_ref, size) {
  var url = _ref.url,
      aspectRatio = _ref.aspectRatio,
      width = _ref.width,
      height = _ref.height;

  var _url$split = url.split('?'),
      _url$split2 = _slicedToArray(_url$split, 2),
      baseUrl = _url$split2[0],
      query = _url$split2[1];

  var imgixParams = queryString.parse(query);
  var dpr = aspectRatio > 1 ? Math.ceil(size / width * 100) / 100 : Math.ceil(size / height * 100) / 100;
  var extraParams = {
    dpr: Math.max(0.01, dpr)
  };

  if (!imgixParams.w && !imgixParams.h) {
    extraParams.w = width;
  }

  extraParams.q = '30';
  return createUrl({
    url: baseUrl
  }, imgixParams, extraParams);
};