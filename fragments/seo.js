const { graphql } = require('gatsby');

export const datoCmsSeoMetaTags = graphql`
  fragment GatsbyDatoCmsSeoMetaTags on DatoCmsSeoMetaTags {
    tags {
      tagName
      content
      attributes {
        property
        content
        name
      }
    }
  }
`
