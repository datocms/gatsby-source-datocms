
const pluginPrefix = 'gatsby-source-datocms'

function prefixId(id) {
  return `${pluginPrefix}_${id}`
}

const ReporterLevel = {
  Error: 'ERROR',
}

const ReporterCategory = {
  // Error caused by user (typically, site misconfiguration)
  User: 'USER',
  // Error caused by DatoCMS plugin ("third party" relative to Gatsby Cloud)
  ThirdParty: 'THIRD_PARTY',
  // Error caused by Gatsby process
  System: 'SYSTEM',
}

const CODES = {
  MissingAPIToken: '10000',
}

const ERROR_MAP = {
    [CODES.MissingAPIToken]: {
      text: (context) => context.sourceMessage,
      level: ReporterLevel.Error,
      category: ReporterCategory.User,
    },
  }

module.exports = {
    pluginPrefix,
    CODES,
    prefixId,
    ERROR_MAP,
}