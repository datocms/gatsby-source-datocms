const React = require('react');
const Helmet = require('react-helmet');

const HelmetDatoCms = ({ record }) => (
  React.createElement(
    Helmet,
    null,
    record.seoMetaTags.tags.map((item, i) =>
      React.createElement(
        item.tagName,
        Object.assign({ key: i }, item.attributes),
        item.content
      )
    )
  )
)

module.exports = { HelmetDatoCms };
