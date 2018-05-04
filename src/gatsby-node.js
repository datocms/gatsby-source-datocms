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
  { apiToken, disableLiveReload, previewMode, apiUrl }
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
    },
    apiUrl,
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

    const repo = await fetch(client, previewMode);
    const itemTypes = repo.findEntitiesOfType('item_type');
    const site = repo.findEntitiesOfType('site')[0];

    createItemTypeNodes(itemTypes, createNodeWrapper);
    createItemNodes(repo, createNodeWrapper);
    createSiteNode(repo, createNodeWrapper);

    setPluginStatus({ nodeIds });

    return site.id;
  }

  const siteId = await sync();

  if (!disableLiveReload) {
    const watcher = new SiteChangeWatcher(siteId);
    watcher.connect(() => {
      reporter.info('Detected DatoCMS data change!');
      sync();
    });
  }
}

exports.onPreExtractQueries = async ({ store, getNodes }) => {
  const program = store.getState().program;
  const nodes = getNodes();

  if (nodes.some(n => n.internal.type === `DatoCmsAsset`)) {
    await fs.copy(
      path.join(__dirname, 'src', 'assetFragments.js'),
      `${program.directory}/.cache/fragments/datocms-asset-fragments.js`
    )
  }

  if (nodes.some(n => n.internal.type === `DatoCmsSeoMetaTags`)) {
    await fs.copy(
      path.join(__dirname, 'src', 'seoFragments.js'),
      `${program.directory}/.cache/fragments/datocms-seo-fragments.js`
    )
  }

  if (nodes.some(n => n.internal.type === `DatoCmsFaviconMetaTags`)) {
    await fs.copy(
      path.join(__dirname, 'src', 'faviconFragments.js'),
      `${program.directory}/.cache/fragments/datocms-favicon-fragments.js`
    )
  }
}


exports.setFieldsOnGraphQLNodeType = ({ type, store }) => {
  if (type.name !== 'DatoCmsAsset') {
    return {};
  }

  const program = store.getState().program;
  const cacheDir = `${program.directory}/.cache/datocms-assets`;

  if (!fs.existsSync(cacheDir)){
    fs.mkdirSync(cacheDir);
  }

  return extendAssetNode({ cacheDir });
}
