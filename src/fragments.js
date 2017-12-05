export const datoCmsSeoMetaTags = graphql`
  fragment datoCmsSeoMetaTagsFields on DatoCmsSeoMetaTags {
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
