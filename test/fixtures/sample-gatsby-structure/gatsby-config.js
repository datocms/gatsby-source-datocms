module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-datocms`,
      options: {
        apiToken: process.env.DATOCMS_API_TOKEN,
        pageSize: 30,
      },
    },
    {
      resolve: `gatsby-source-datocms`,
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
