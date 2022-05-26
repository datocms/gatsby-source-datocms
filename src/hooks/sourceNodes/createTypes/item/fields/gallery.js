import fileResolver from './fileResolver';

module.exports = () => ({
  type: '[DatoCmsFileField!]',
  resolveForSimpleField: (fieldValue, context, node, i18n, generateType) => {
    return (fieldValue || []).map(fileField =>
      fileResolver(fileField, context, node, i18n, generateType),
    );
  },
});
