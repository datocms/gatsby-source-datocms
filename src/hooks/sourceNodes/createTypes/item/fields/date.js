module.exports = () => ({
  type: 'Date',
  extensions: { dateformat: {}, proxy: {} },
  resolveForSimpleField: value => value,
});
