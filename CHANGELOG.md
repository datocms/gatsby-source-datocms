### v2.1.0

* Hyper fast real-rime content preview in watch mode
* Locale fallbacks
* Support for traced SVG image placeholders
* Automatically use WebP images when the browser supports the file format. If the browser doesn’t support WebP, fall back to the default image format
* Fixed some bugs on gatsby-image responses
* Added `_all<FIELD>Locales` method for every localized field
* GraphQL schema customization (no more random errors due to inferred types!)
* Added `meta` fields to records (`createdAt`, `updatedAt`, `publishedAt`, `firstPublishedAt`, `isValid`, `status`)
* Do not enable preview mode if we're building

### v2.0.2

* Restore support of gatsby-image base64 field

### v1.1.9

* Added support for the new Gatsby v2 `fixed` and `fluid` responsive image queries (see https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#rename-responsive-image-queries)

### v1.1.8

* Added `originalId` (#18)
