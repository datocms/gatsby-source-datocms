module.exports = {
  plugins: [
    {
      resolve: `wrapper`,
      options: {
        apiToken: process.env.DATOCMS_API_TOKEN,
      },
    },
  ],
}
