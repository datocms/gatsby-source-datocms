# gatsby-source-datocms

Source plugin for pulling models and records into Gatsby from DatoCMS administrative areas. It creates links between records so they can be queried in Gatsby using GraphQL.

## Install

`npm install --save gatsby-source-datocms`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-datocms`,
    options: {
      apiToken: `YOUR_READONLY_API_TOKEN`,
    },
  },
]
```

## How to query

Two standard data types will be available from DatoCMS: `DatoCmsModel` and `DatoCmsSite`. You can query model nodes created from DatoCMS like the following:

```graphql
{
  allDatoCmsModel {
    edges {
      node {
        apiKey
        name
        fields {
          apiKey
          fieldType
        }
      }
    }
  }
}
```

Your site global settings can be queried like this:

```graphql
{
  datoCmsSite {
    name
    internalDomain
    locales
  }
}
```

### Accessing records

Non-standard data types, i.e. models you define in DatoCMS, will also be
available in Gatsby. They'll be created in your site's GraphQL schema under
`datoCms{modelApiKey}` and `allDatoCms{modelApiKey}`. For example,
if you have a `blog_post` model, you will be able to query it like the following:

```graphql
{
  allDatoCmsBlogPost(sort: { fields: [publicationDate], order: DESC }, limit: 5) {
    edges {
      node {
        title
        excerpt
        publicationDate(formatString: "MM-DD-YYYY")
        author {
          name
          avatar {
            url
          }
        }
      }
    }
  }
}
```

### Multiple-paragraph text fields

Fields of type *Multiple-paragraph text* will be available both as simple
strings (ie. `excerpt`) and nodes (ie. `excerptNode`). You can use the latter 
if you want to apply further transformations, like converting markdown with [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark)):

```graphql
{
  allDatoCmsBlogPost {
    edges {
      node {
        excerptNode {
          childMarkdownRemark {
            html
            timeToRead
          }
        }
      }
    }
  }
}
```

### Modular content fields

[Modular-content fields](https://docs.datocms.com/schema/modular-content.html) can be queried this way:

```graphql
{
  allDatoCmsBlogPost {
    edges {
      node {
        title
        content {
          ... on DatoCmsText {
            text
          }
          ... on DatoCmsImage {
            image {
              url
            }
          }
        }
      }
    }
  }
}
```

### Favicon

You can get the complete set of meta tags related to your site favicon like this:

```graphql
{
  datoCmsSite {
    faviconMetaTags {
      tagName
      attributes {
        rel
        sizes
        href
        name
        content
        type
      }
    }
  }
}
```

### SEO meta tags

All records have a `seoMetaTags` field that you can use to build SEO meta tags
for your record's pages:

```graphql
{
  allDatoCmsBlogPost {
    edges {
      node {
        title
        
        seoMetaTags {
          tagName
          content
          attributes {
            property
            content
            name
          }
        }
      }
    }
  }
}
```

This package exposes a `HelmetDatoCms` component to make it easier use these information with Helmet:

```js
import React from 'react'
import Link from 'gatsby-link'
import { HelmetDatoCms } from 'gatsby-source-datocms'

const About = ({ data }) => (
  <article className="sheet">
    <HelmetDatoCms record={data.datoCmsAboutPage} />
    <h1>{data.datoCmsAboutPage.title}</h1>
    <p>{data.datoCmsAboutPage.subtitle}</p>
  </article>
)

export default About;

export const query = graphql`
  query AboutQuery {
    datoCmsAboutPage {
      seoMetaTags {
        tagName
        attributes {
          property
          content
          name
        }
        content
      }
      title
      subtitle
    }
  }
```

### Tree-like collections

If you have a model configured as a tree, you can navigate the hierarchy with
`treeChildren` and `treeParent` this way:

```graphql
{
  allDatoCmsCategory(filter: { root: { eq: true } }) {
    edges {
      node {
        title
        treeChildren {
          title
          treeChildren {
            title
          }
        }
      }
    }
  }
}
```

### Single instance models

You can access to single instance models like this:

```graphql
{
  datoCmsHomepage {
    title
    content
  }
}
```

### Localized fields

If your site is multi-lingual, records will be duplicated for every locale 
available, so you can query them like this. The same applies for the `DatoCmsSite`
node:


```graphql
{
  allDatoCmsBlogPost(filter: { locale: { eq: "it" } }) {
    edges {
      node {
        title
        excerpt
      }
    }
  }

  datoCmsHomepage(locale: { eq: "it" }) {
    title
    content
  }
}
```
