import fileResolver from './fileResolver';

module.exports = () => ({
  type: 'DatoCmsFileField',
  resolveForSimpleField: fileResolver,
});
