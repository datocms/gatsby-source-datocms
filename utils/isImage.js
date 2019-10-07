"use strict";

module.exports = function (_ref) {
  var format = _ref.format,
      width = _ref.width,
      height = _ref.height;
  return ['png', 'jpg', 'jpeg', 'gif'].includes(format) && width && height;
};