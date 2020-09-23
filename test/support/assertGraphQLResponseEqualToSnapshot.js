const path = require('path');
const fs = require('fs');
const assert = require('uvu/assert');

const graphqlResponsesPath = path.resolve(path.join(__dirname, '../fixtures/graphql-responses'));

module.exports = (snapshotName, result) => {
  const snapshotPath = path.join(graphqlResponsesPath, `${snapshotName}.json`);

  if (fs.existsSync(snapshotPath)) {
    assert.is(
      JSON.stringify(result, null, 2),
      fs.readFileSync(snapshotPath, 'utf-8'),
    );
  }

  fs.writeFileSync(snapshotPath, JSON.stringify(result, null, 2), 'utf-8');
}