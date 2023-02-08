const { camelize } = require('datocms-client');

module.exports = ({ field }) => {
  const fieldKey = camelize(field.apiKey);

  return {
    type: 'String',
    nodeType: 'DatoCmsTextNode',
    resolveForSimpleField: fieldValue => fieldValue,
    resolveForNodeField: (_fieldValue, context, node, i18n) => {
      if (field.localized) {
        const candidateLocales = [node.locale, i18n.locale]
          .concat(i18n.fallbacks[i18n.locale] || [])
          .filter(x => !!x);

        const localeWithMatchingNode = candidateLocales.find(locale =>
          context.nodeModel.getNodeById({
            id: [
              'DatoCmsTextNode',
              node.entityPayload.id,
              locale,
              fieldKey,
            ].join('-'),
          }),
        );

        return context.nodeModel.getNodeById({
          id: [
            'DatoCmsTextNode',
            node.entityPayload.id,
            localeWithMatchingNode,
            fieldKey,
          ].join('-'),
        });
      } else {
        return context.nodeModel.getNodeById({
          id: ['DatoCmsTextNode', node.entityPayload.id, fieldKey].join('-'),
        });
      }
    },
  };
};
