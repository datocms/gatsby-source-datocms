const recipes = require('gatsby-recipes');
const { bootstrap } = require('gatsby/dist/bootstrap');
const reporter = require('gatsby-cli/lib/reporter');
const redux = require('gatsby/dist/redux');
const { setStore } = require('gatsby-cli/lib/reporter/redux');
const { GraphQLRunner } = require('gatsby/dist/query/graphql-runner');
const path = require('path');
const rimraf = require('rimraf')

module.exports = async function buildQueryExecutor(apiToken) {
  const gatsbyProjectPath = path.resolve(path.join(__dirname, '../fixtures/sample-gatsby-structure'));
  rimraf.sync(path.join(gatsbyProjectPath, './.cache'));
  console.log(path.join(gatsbyProjectPath, './.cache'))

  process.chdir(gatsbyProjectPath);

  process.env.DATOCMS_API_TOKEN = apiToken;

  recipes.startGraphQLServer('.', true);

  await bootstrap({
    program: {
      directory: gatsbyProjectPath,
      report: reporter,
      setStore,
    },
  });

  const runner = new GraphQLRunner(redux.store, { graphqlTracing: false });

  return async query => {
    const result = await runner.query(query, {}, {});
    return result;
  };
}
