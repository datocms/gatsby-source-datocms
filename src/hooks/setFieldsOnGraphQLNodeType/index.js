const objectAssign = require('object-assign');
const upload = require('./nodes/upload');

module.exports = (...params) => {
  return [
    upload,
  ].reduce((acc, fn) => objectAssign(acc, fn(...params)), {});
}
