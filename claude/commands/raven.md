---
description: Query and manage RavenDB connections and collections
---

The user wants to interact with RavenDB. Use the `assist ravendb` CLI commands below.

## Connection management

- `assist ravendb auth add` — interactively add a named connection
- `assist ravendb auth list` — list configured connections
- `assist ravendb auth remove <name>` — remove a connection
- `assist ravendb set-connection <name>` — set the default connection

## Querying

- `assist ravendb collections [connection]` — list collections in a database
- `assist ravendb query [connection] [collection]` — query a collection
  - `--page-size <n>` — documents per page (default 25)
  - `--sort <field>` — sort field, prefix `-` for descending (default `-@metadata.Last-Modified`)
  - `--query <lucene>` — Lucene filter query
  - `--limit <n>` — max total documents to fetch

## Workflow

1. If no connections are configured, tell the user to run `assist ravendb auth add`. Do NOT attempt to add connections yourself.
2. If the user doesn't specify a connection, omit it to use the default.
3. Display query results to the user. If the output is large, summarise the key documents and highlight anything notable.
4. If the user asks follow-up questions, refine the query options and re-query.
