const { seoTagsBuilder, JsonApiEntity } = require('datocms-client');

module.exports = ({ entitiesRepo, actions, schema, localeFallbacks, generateType }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: generateType('SeoMetaTags'),
      extensions: { infer: false },
      fields: {
        tags: {
          type: 'JSON',
          resolve: (node, args, context) => {
            const i18n = { locale: node.locale, localeFallbacks };

            const item = context.nodeModel.getNodeById({
              id: node.itemNodeId,
            });

            return seoTagsBuilder(
              new JsonApiEntity(item.entityPayload, entitiesRepo),
              entitiesRepo,
              i18n,
            );
          },
        },
      },
      interfaces: [`Node`],
    }),
  ]);
};
