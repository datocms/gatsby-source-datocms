### v2.1.0

* GraphQL schema customization (no more random errors due to inferred types!)
* Support for traced SVG image placeholders (`GatsbyDatoCmsFixed_tracedSVG` and `GatsbyDatoCmsFluid_tracedSVG`)
* Automatically use WebP images when the browser supports the file format. If the browser doesn’t support WebP, fall back to the default image format
* Hyper fast real-rime content preview in watch mode (just the content that actually changes gets re-downloaded)
* Fixed some bugs when using Imgix transformations on `gatsby-image` queries
* Disable watch mode when Gatsby is in build mode
* Locale fallbacks:

```js
  plugins: [
    {
      resolve: `gatsby-source-datocms`,
      options: {
        // In this example, if some field value is missing in Italian, fall back to English
        localeFallbacks: {
          it: ['en'],
        },
      },
    },
  ]
```

* If you need to get every locale for a specific field, you can now use the `_all<FIELD>Locales` query:

```graphql
{
  allDatoCmsBlogPost(filter: { locale: { eq: "en" } }) {
    edges {
      node {
        _allTitleLocales {
          locale
          value
        }
        _allExcerptLocales {
          locale
          value
        }
      }
    }
  }
}
```

* Added `meta` fields to records:

```graphql
{
  allDatoCmsBlogPost {
    edges {
      node {
        meta {
          createdAt
          updatedAt
          publishedAt
          firstPublishedAt
          isValid
          status
        }
      }
    }
  }
}
```

### v2.0.2

* Restore support of gatsby-image base64 field

### v1.1.9

* Added support for the new Gatsby v2 `fixed` and `fluid` responsive image queries (see https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#rename-responsive-image-queries)

### v1.1.8

* Added `originalId` (#18)
