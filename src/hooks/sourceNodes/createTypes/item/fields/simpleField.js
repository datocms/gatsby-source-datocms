module.exports = type => () => ({
  type,
  resolveForSimpleField: value => value,
});
