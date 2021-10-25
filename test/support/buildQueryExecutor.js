const recipes = require('gatsby-recipes');
const { bootstrap } = require('gatsby/dist/bootstrap');
const reporter = require('gatsby-cli/lib/reporter');
const { setStore } = require('gatsby-cli/lib/reporter/redux');
const path = require('path');
const rimraf = require('rimraf');

module.exports = async function buildQueryExecutor(apiToken) {
  const gatsbyProjectPath = path.resolve(
    path.join(__dirname, '../fixtures/sample-gatsby-structure'),
  );
  rimraf.sync(path.join(gatsbyProjectPath, './.cache'));

  process.chdir(gatsbyProjectPath);

  process.env.DATOCMS_API_TOKEN = apiToken;

  const { gatsbyNodeGraphQLFunction } = await bootstrap({
    program: {
      directory: gatsbyProjectPath,
      report: reporter,
      setStore,
    },
  });

  return async query => {
    const result = await gatsbyNodeGraphQLFunction(query, {}, {});
    return result;
  };
};
