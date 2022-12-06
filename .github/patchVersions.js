const fs = require('fs');

const gatsbyVersion = process.env.GATSBY_VERSION;
const gatsbyMajorVersion = parseInt(gatsbyVersion.split('.')[0]);
const pluginImageVersion = gatsbyMajorVersion - 2;
const pluginSharpImageVersion = gatsbyMajorVersion;
const transformerRemarkVersion = gatsbyMajorVersion + 1;

packageJson = JSON.parse(fs.readFileSync('package.json'));

packageJson.devDependencies.gatsby = `^${gatsbyVersion}`;
packageJson.devDependencies[
  'gatsby-plugin-image'
] = `^${pluginImageVersion}.0.0`;
packageJson.devDependencies[
  'gatsby-plugin-sharp'
] = `^${pluginSharpImageVersion}.0.0`;
packageJson.devDependencies[
  'gatsby-transformer-remark'
] = `^${transformerRemarkVersion}.0.0`;
packageJson.engines.node = `>=${process.env.NODE_VERSION}`;

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
