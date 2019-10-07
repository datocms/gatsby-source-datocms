"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function getSizeAfterTransformations(originalWidth, originalHeight) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var originalAspectRatio = originalWidth / originalHeight;
  var width = originalWidth;
  var height = originalHeight;

  if (params.rect) {
    var _params$rect$split$sl = params.rect.split(',').slice(2, 4),
        _params$rect$split$sl2 = _slicedToArray(_params$rect$split$sl, 2),
        w = _params$rect$split$sl2[0],
        h = _params$rect$split$sl2[1];

    width = Math.min(Math.max(0, parseInt(w)), originalWidth);
    height = Math.min(Math.max(0, parseInt(h)), originalHeight);
  }

  if (['facearea', 'clamp', 'crop', 'fill', 'fillmax', 'scale'].includes(params.fit) && params.w && params.h) {
    width = parseInt(params.w);
    height = parseInt(params.h);

    if (params.fit === 'crop') {
      if (params['max-h']) {
        height = Math.min(height, parseInt(params['max-h']));
      }

      if (params['max-w']) {
        width = Math.min(width, parseInt(params['max-w']));
      }

      if (params['min-h']) {
        height = Math.max(height, parseInt(params['min-h']));
      }

      if (params['min-w']) {
        width = Math.max(width, parseInt(params['min-w']));
      }
    }

    return {
      width: width,
      height: height
    };
  }

  if (params.fit === 'min' && (params.w || params.h)) {
    var _w = params.w ? parseInt(params.w) : Math.round(parseInt(params.h) * originalAspectRatio);

    var _h = params.h ? parseInt(params.h) : Math.round(parseInt(params.w) / originalAspectRatio);

    var resize = Math.min(width / _w, height / _h);
    width = Math.round(width * resize);
    height = Math.round(height * resize);
    return {
      width: width,
      height: height
    };
  }

  if (params.w || params.h) {
    var scales = [];

    if (params.w) {
      scales.push(parseInt(params.w) / width);
    }

    if (params.h) {
      scales.push(parseInt(params.h) / height);
    }

    var scale = Math.min.apply(Math, scales);

    if (params.fit === 'max') {
      scale = Math.max(1, scale);
    }

    width = Math.round(scale * width);
    height = Math.round(scale * height);
    return {
      width: width,
      height: height
    };
  }

  return {
    width: width,
    height: height
  };
};