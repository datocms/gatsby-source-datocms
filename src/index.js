const React = require('react');
const Helmet = require('react-helmet').default;
const objectEntries =  require('object.entries');
const objectAssign =require('object-assign');

const HelmetDatoCms = ({ seo, favicon }) => {
  return React.createElement(
    Helmet,
    null,
    (seo ? seo.tags : [])
      .concat(favicon ? favicon.tags : [])
      .map((item, i) =>
        React.createElement(
          item.tagName,
          objectAssign(
            { key: i },
            objectEntries(item.attributes || {})
              .reduce((acc, [name, value]) => {
                if (value) {
                  acc[name] = value;
                }
                return acc;
              }, {})
          ),
          item.content
        )
    )
  );
}

module.exports = { HelmetDatoCms };
