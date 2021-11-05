module.exports = () => ({
  type: 'Date',
  extensions: { dateformat: {} },
  resolveForSimpleField: value => value,
});
