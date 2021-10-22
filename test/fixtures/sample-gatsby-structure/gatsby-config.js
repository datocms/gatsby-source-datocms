module.exports = {
  plugins: [
    {
      resolve: `wrapper`,
      options: {
        apiToken: process.env.DATOCMS_API_TOKEN,
        pageSize: 30,
        localeFallbacks: {
          it: ['en'],
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
    `gatsby-transformer-remark`,
    `gatsby-plugin-image`,
  ],
};
