---
description: Query a MSSQL database via assist sql
---

The user wants to query a MSSQL database. Use the `assist sql` CLI commands below.

## Connection management

- `assist sql auth add` — interactively add a named connection (name, server, port, user, password, database)
- `assist sql auth list` — list configured connections
- `assist sql auth remove <name>` — remove a connection
- `assist sql set-connection <name>` — set the default connection

## Schema introspection

- `assist sql tables [connection]` — list tables in the database
- `assist sql columns <table> [connection]` — list columns for a table (use `schema.table` for a non-default schema)

## Querying

- `assist sql query "<sql>" [connection]` — execute a read-only SQL statement and print results in table format. Rejects mutating statements (INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE, MERGE, GRANT, REVOKE, EXEC)
- `assist sql mutate "<sql>" [connection]` — execute a mutating SQL statement (INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE, MERGE, GRANT, REVOKE, EXEC) and print rows affected. Rejects non-mutating statements (pure SELECTs, comment-only inputs)

## Workflow

1. If no connections are configured, tell the user to run `assist sql auth add`. Do NOT attempt to add connections yourself.
2. If the user doesn't specify a connection, omit it to use the default.
3. Prefer `tables` and `columns` for schema discovery before crafting queries.
4. Quote SQL strings carefully — wrap the statement in double quotes and escape inner double quotes if needed.
5. Use `query` for SELECTs only and `mutate` for mutating statements — each command rejects the other kind, so do not work around the guards.
6. Display query results to the user. If the output is large, summarise key rows and highlight anything notable.
7. If the user asks follow-up questions, refine the query and re-run.
