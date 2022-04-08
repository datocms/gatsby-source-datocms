# Parallel Query Running

With [PQR](#https://www.gatsbyjs.com/docs/reference/release-notes/v3.10/#experimental-parallel-query-running), multiple processes run GraphQL queries, speeding things up.

How to test this scenario locally: just run `gatsby build`.

In this scenario, we want to only fetch data once in the main process, cache the responses and reuse them inside the workers.

- `process.env.NODE_ENV` is set to `production`;
- A first process calls `createSchemaCustomization`;
- A number of subsequent processes (with `GATSBY_WORKER_ID` env variable set to a number) call `sourceNodes`.

# Deferred Static Generation

With [DSG](https://www.gatsbyjs.com/docs/reference/rendering-options/deferred-static-generation/), instead of generating every page up front, you can decide to generate certain pages at build time and others only when a user accesses the page for the first time. Subsequent page requests use the same HTML and JSON generated during the very first request to this page.

How to test this scenario locally: run `gatsby build` and `gatsby serve` from the command line, and make sure some pages are marked with `defer: true`.

In this scenario:

- page that has not been generated yet gets requested;
- `gatsby serve` will only call `createSchemaCustomization` (not `sourceNodes`);

# Develop preview mode

How to test this scenario locally: just run `gatsby develop`.

In this scenario:

- `process.env.NODE_ENV` is set to `development`;
- `createSchemaCustomization` gets called;
- `sourceNodes` gets called;

# Gatsby CMS Preview

This is the "CMS Preview" functionality offered by Gatsby Cloud.

How to test this scenario locally?

Run:

```
ENABLE_GATSBY_REFRESH_ENDPOINT=true GATSBY_EXPERIMENTAL_DISABLE_SCHEMA_REBUILD=true gatsby develop
```

The `GATSBY_EXPERIMENTAL_DISABLE_SCHEMA_REBUILD` above is important — and Gatsby Preview sets this env variable for us — because otherwise the `createSchemaCustomization` hook would be called, reloading everything from scratch.

Webhooks must trigger create/update/delete/publish events on items/assets to the `/__refresh` endpoint. The webhook must have the following custom body:

```
{
  "event_type":"{{event_type}}",
  "entity_id":"{{#entity}}{{id}}{{/entity}}",
  "entity_type":"{{entity_type}}"
}
```

Also make sure to set `disableLiveReload: true` in plugin config to avoid nodes from being refreshed by Pusher notifications.

In this scenario:

- `process.env.NODE_ENV` is set to `development`;
- `createSchemaCustomization` gets called;
- `sourceNodes` gets called with the `context.webhookBody` set to the body of the incoming webhook;
