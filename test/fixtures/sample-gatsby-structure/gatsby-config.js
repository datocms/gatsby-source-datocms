module.exports = {
  plugins: [
    {
      resolve: `wrapper`,
      options: {
        apiToken: process.env.DATOCMS_API_TOKEN,
        localeFallbacks: {
          'it': ['en'],
        },
      },
    },
    {
      resolve: `wrapper`,
      options: {
        apiToken: process.env.DATOCMS_API_TOKEN,
        environment: 'alternative-environment',
        instancePrefix: 'alternative',
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
    },
  ],
}
