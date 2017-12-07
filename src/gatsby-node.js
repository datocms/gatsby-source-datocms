const { SiteClient } = require('datocms-client');
const SiteChangeWatcher = require('datocms-client/lib/dump/SiteChangeWatcher');
const fs = require('fs-extra');
const path = require('path');

const fetch = require('./fetch');
const createItemTypeNodes = require('./createItemTypeNodes');
const createItemNodes = require('./createItemNodes');
const createSiteNode = require('./createSiteNode');
const extendAssetNode = require('./extendAssetNode');

exports.sourceNodes = async (
  { boundActionCreators, getNodes, hasNodeChanged, store, reporter },
  { apiToken }
) => {
  const {
    createNode,
    deleteNodes,
    touchNode,
    setPluginStatus,
  } = boundActionCreators;

  const client = new SiteClient(
    apiToken,
    {
      'X-Reason': 'dump',
      'X-SSG': 'gatsby',
    }
  );

  const sync = async () => {
    if (
      store.getState().status.plugins &&
      store.getState().status.plugins[`gatsby-source-datocms`]
    ) {
      const oldNodeIds = store.getState().status.plugins[`gatsby-source-datocms`].nodeIds;
      deleteNodes(oldNodeIds);
    }

    const nodeIds = [];
    const createNodeWrapper = (node) => {
      nodeIds.push(node.id);
      createNode(node);
    }

    const repo = await fetch(client);
    const itemTypes = repo.findEntitiesOfType('item_type');
    const site = repo.findEntitiesOfType('site')[0];

    createItemTypeNodes(itemTypes, createNodeWrapper);
    createItemNodes(repo, createNodeWrapper);
    createSiteNode(repo, createNodeWrapper);

    setPluginStatus({ nodeIds });

    return site.id;
  }

  const siteId = await sync();

  const watcher = new SiteChangeWatcher(siteId);
  watcher.connect(() => {
    reporter.info('Detected DatoCMS data change!');
    sync();
  });
}

exports.onPreExtractQueries = async ({ store }) => {
  const program = store.getState().program;

  await fs.copy(
    path.join(__dirname, 'src', 'fragments.js'),
    `${program.directory}/.cache/fragments/datocms-seometatags-fragments.js`
  )
}


exports.setFieldsOnGraphQLNodeType = ({ type }) => {
  if (type.name !== 'DatoCmsAsset') {
    return {};
  }

  return extendAssetNode();
}
