const { pascalize } = require('humps');

module.exports = (
  { createResolvers, intermediateSchema },
  { instancePrefix },
) => {
  const singlePrefix = instancePrefix
    ? `datoCms${pascalize(instancePrefix)}`
    : 'datoCms';

  const collectionPrefix = instancePrefix
    ? `allDatoCms${pascalize(instancePrefix)}`
    : 'allDatoCms';

  const resolvers = {};

  for (const [key, field] of Object.entries(
    intermediateSchema.getType(`Query`).getFields(),
  )) {
    if (
      (key.startsWith(singlePrefix) || key.startsWith(collectionPrefix)) &&
      field.args.length > 0
    ) {
      const existingArgs = field.args.reduce((acc, arg) => {
        acc[arg.name] = arg;
        return acc;
      }, {});

      if (!existingArgs.locale) {
        resolvers[key] = {
          ...resolvers[key],
          args: {
            ...existingArgs,
            locale: { type: 'String' },
            fallbackLocales: { type: '[String!]' },
          },
          resolve: async (parent, args, context, info) => {
            if (context.sourceDatocms.localeState) {
              context.sourceDatocms.localeState.clear(info);
            }
            if (context.sourceDatocms.fallbackLocales) {
              context.sourceDatocms.fallbackLocales.clear(info);
            }

            if (args.locale) {
              context.sourceDatocms.localeState.set(info, args.locale);
            }

            if (args.fallbackLocales) {
              context.sourceDatocms.fallbackLocalesState.set(
                info,
                args.fallbackLocales,
              );
            }

            const { locale, fallbackLocales, ...argsWithoutLocale } = args;

            return info.originalResolver(
              parent,
              argsWithoutLocale,
              context,
              info,
            );
          },
        };
      }
    }
  }

  createResolvers({ Query: resolvers });
};
