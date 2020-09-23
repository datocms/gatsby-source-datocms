const { camelize } = require('datocms-client');

module.exports = ({ field }) => {
  const fieldKey = camelize(field.apiKey);

  return {
    type: 'String',
    nodeType: 'DatoCmsTextNode',
    resolveForSimpleField: fieldValue => fieldValue,
    resolveForNodeField: (fieldValue, context, node) => {
      return context.nodeModel.getNodeById({
        id: `DatoCmsTextNode-${node.id}-${fieldKey}`,
      });
    },
  };
};
