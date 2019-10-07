"use strict";

var Queue = require('promise-queue');

var fs = require('fs-extra');

var path = require('path');

var md5 = require('md5');

var request = require('request-promise-native');

var resizeUrl = require('./resizeUrl');

var queue = new Queue(3, Infinity);

function download(requestUrl, cacheDir) {
  var cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    var body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  return queue.add(function () {
    return request({
      uri: encodeURI(requestUrl),
      resolveWithFullResponse: true,
      encoding: 'base64'
    }).then(function (res) {
      var data = 'data:' + res.headers['content-type'] + ';base64,' + res.body;
      fs.writeFileSync(cacheFile, data, 'utf8');
      return data;
    });
  });
}

module.exports = function (_ref, cacheDir) {
  var src = _ref.src,
      width = _ref.width,
      height = _ref.height,
      aspectRatio = _ref.aspectRatio;
  return download(resizeUrl({
    url: src,
    aspectRatio: aspectRatio,
    width: width,
    height: height
  }, 20), cacheDir);
};