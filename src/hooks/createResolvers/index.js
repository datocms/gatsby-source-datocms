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
            const queryContext = context.sourceDatocms.getQueryContext(context);

            if (args.locale) {
              queryContext.localeState.set(info, args.locale);
            }

            if (args.fallbackLocales) {
              queryContext.fallbackLocalesState.set(info, args.fallbackLocales);
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
