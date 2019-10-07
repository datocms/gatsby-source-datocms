module.exports = ({ format, width, height }) =>
  ['png', 'jpg', 'jpeg', 'gif'].includes(format) && width && height;
