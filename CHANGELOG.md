### v2.4.1

- Fix for Gatsby Cloud. Pull linked entities on webhook updates, this was causing records with modular blocks to be updated without updating the linked blocks.

### v2.4.0

- Added `lqip=blurhash` to generate base64 thumbs for images instead of the classic "blur-up"

### v2.3.0

- Introduction of support for [environments](https://www.datocms.com/docs/general-concepts/primary-and-sandbox-environments).

### v2.2.0

- Added support for incremental builds in Gatsby Cloud

### v2.1.28

- Improvements on builds, allowing change of schema on active `gatsby develop` instance
- Fix for fallback locales for assets, fixed in `datocms-client` v3.0.16

### v2.1.19

- Added new queries to assets and file fields

### v2.1.13

- Fix missing root boolean in tree item

### v2.1.9

- Prevent missing entities from causing exceptions during create nodes

### v2.1.8

- Add facebookPageUrl

### v2.1.7

- Remove Gatsby v3 warnings
- Upgrade deps 0f4f939

### v2.1.4

- Bugfix: Fixed error when no uploads were present in the Media Area

### v2.1.2

- Bugfix: JSON fields where returned as strings

### v2.1.0

- GraphQL schema customization (no more random errors due to inferred types!)
- Support for traced SVG image placeholders (`GatsbyDatoCmsFixed_tracedSVG` and `GatsbyDatoCmsFluid_tracedSVG`)
- Automatically use WebP images when the browser supports the file format. If the browser doesn’t support WebP, fall back to the default image format
- Hyper fast real-rime content preview in watch mode (just the content that actually changes gets re-downloaded)
- Fixed some bugs when using Imgix transformations on `gatsby-image` queries
- Disable watch mode when Gatsby is in build mode
- Locale fallbacks:

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
];
```

- If you need to get every locale for a specific field, you can now use the `_all<FIELD>Locales` query:

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

- Added `meta` fields to records:

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

- Restore support of gatsby-image base64 field

### v1.1.9

- Added support for the new Gatsby v2 `fixed` and `fluid` responsive image queries (see https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#rename-responsive-image-queries)

### v1.1.8

- Added `originalId` (#18)
