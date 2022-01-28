module.exports = () => ({
  type: 'Date',
  extensions: { dateformat: {}, proxy: { from: 'foo' } },
  resolveForSimpleField: value => value,
});
