require('regenerator-runtime/runtime');
const path = require('path');
const gatsbyProjectPath = path.resolve(
  path.join(__dirname, '../fixtures/sample-gatsby-structure'),
);
// We are setting up CWD early, before importing any of gatsby files, so that
// `process.cwd()` in THIS process and also in child processes spawned by gatsby
// is actually the same. Otherwise `cache` would be backed by different DBs and
// therefore wouldn't actually allow to share data between processes.
process.chdir(gatsbyProjectPath);

const { bootstrap } = require('gatsby/dist/bootstrap');
const reporter = require('gatsby-cli/lib/reporter');
const { setStore } = require('gatsby-cli/lib/reporter/redux');
const rimraf = require('rimraf');

module.exports = async function buildQueryExecutor(apiToken) {
  rimraf.sync(path.join(gatsbyProjectPath, './.cache'));

  process.env.DATOCMS_API_TOKEN = apiToken;

  const { gatsbyNodeGraphQLFunction } = await bootstrap({
    program: {
      directory: gatsbyProjectPath,
      report: reporter,
      setStore,
    },
  });

  const executeQuery = async query => {
    const result = await gatsbyNodeGraphQLFunction(query, {}, {});
    return result;
  };

  return [executeQuery];
};
