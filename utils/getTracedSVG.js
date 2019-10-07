"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Queue = require('promise-queue');

var fs = require('fs-extra');

var path = require('path');

var md5 = require('md5');

var request = require('request');

var resizeUrl = require('./resizeUrl');

var queue = new Queue(3, Infinity);

function download(requestUrl, cacheDir) {
  var cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    return Promise.resolve(cacheFile);
  }

  return queue.add(function () {
    return new Promise(function (resolve, reject) {
      var r = request(requestUrl);
      r.on('error', reject);
      r.on('response', function (resp) {
        if (resp.statusCode !== 200) {
          reject();
        }

        r.pipe(fs.createWriteStream(cacheFile)).on('finish', function () {
          return resolve(cacheFile);
        }).on('error', reject);
      });
    });
  });
}

module.exports =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(_ref, cacheDir) {
    var src, width, height, aspectRatio, _require, traceSVG, absolutePath, name;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            src = _ref.src, width = _ref.width, height = _ref.height, aspectRatio = _ref.aspectRatio;
            _require = require("gatsby-plugin-sharp"), traceSVG = _require.traceSVG;
            _context.next = 4;
            return download(resizeUrl({
              url: src,
              aspectRatio: aspectRatio,
              width: width,
              height: height
            }, 100), cacheDir);

          case 4:
            absolutePath = _context.sent;
            name = path.basename(absolutePath);
            return _context.abrupt("return", traceSVG({
              file: {
                internal: {
                  contentDigest: md5(absolutePath)
                },
                name: name,
                extension: 'jpg',
                absolutePath: absolutePath
              },
              args: {
                toFormat: ''
              },
              fileArgs: {}
            }));

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();