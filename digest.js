'use strict';

var crypto = require('crypto');

module.exports = function digest(str) {
  return crypto.createHash('md5').update(str).digest('hex');
};