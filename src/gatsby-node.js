const { SiteClient } = require('datocms-client');
const fs = require('fs-extra');
const path = require('path');

const fetch = require('./fetch');
const createItemTypeNodes = require('./createItemTypeNodes');
const createItemNodes = require('./createItemNodes');
const createSiteNode = require('./createSiteNode');

exports.sourceNodes = async (
  { boundActionCreators, getNodes, hasNodeChanged, store },
  { apiToken }
) => {
  const {
    createNode,
    deleteNodes,
    touchNode,
    setPluginStatus,
  } = boundActionCreators;

  const client = new SiteClient(apiToken);
  const repo = await fetch(client);

  const itemTypes = repo.findEntitiesOfType('item_type');

  createItemTypeNodes(itemTypes, createNode);
  createItemNodes(repo, createNode);
  createSiteNode(repo, createNode);
}

exports.onPreExtractQueries = async ({ store }) => {
  const program = store.getState().program;

  await fs.copy(
    path.join(__dirname, 'src', 'fragments.js'),
    `${program.directory}/.cache/fragments/datocms-seometatags-fragments.js`
  )
}
