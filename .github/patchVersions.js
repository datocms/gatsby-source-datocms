const fs = require('fs');

const gatsbyVersion = parseInt(process.env.GATSBY_VERSION);
const pluginImageVersion = Math.max(gatsbyVersion - 3, 1);
const pluginSharpImageVersion = gatsbyVersion;
const transformerRemarkVersion = gatsbyVersion + 1;

packageJson = JSON.parse(fs.readFileSync('package.json'));

packageJson.devDependencies.gatsby = `^${gatsbyVersion}.0.0`;
packageJson.devDependencies[
  'gatsby-plugin-image'
] = `^${pluginImageVersion}.0.0`;
packageJson.devDependencies[
  'gatsby-plugin-sharp'
] = `^${pluginSharpImageVersion}.0.0`;
packageJson.devDependencies[
  'gatsby-transformer-remark'
] = `^${transformerRemarkVersion}.0.0`;
packageJson.engines.node = '>=' + process.env.NODE_VERSION;

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
