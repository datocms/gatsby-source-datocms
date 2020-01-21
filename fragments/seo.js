import { graphql } from 'gatsby';

export const datoCmsSeoMetaTags = graphql`
  fragment GatsbyDatoCmsSeoMetaTags on DatoCmsSeoMetaTags {
    tags
  }
`
