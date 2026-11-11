---
description: Query Seq logs from a URL or filter expression
---

The user wants to query Seq log events. The argument is either a Seq UI URL or a raw filter expression.

## If the argument is a URL

Parse it to extract:

1. **Base URL** — the origin (e.g., `http://localhost:5341`)
2. **Filter** — URL-decode the `filter` query parameter from the fragment (after `#`). For example, from `http://localhost:5341/#/events?filter=JobId%20%3D%3D%20%22abc%22`, extract filter `JobId == "abc"`.

Then determine the correct connection:

- Run `assist seq auth list` to see configured connections.
- Match the base URL from the parsed URL against a connection's URL.
- If a match is found, use that connection name with `-c <name>`.
- If no match is found, tell the user and ask them to run `assist seq auth add` to add the connection. Do NOT attempt to add connections yourself.

## If the argument is a filter expression

Use the default connection (no `-c` flag needed).

## Running the query

Run: `assist seq query "<filter>"` (add `-c <connection>` if resolved from a URL).

Display the results to the user. If the output is large, summarise the key events (errors, warnings, patterns) and highlight anything notable.

If the user asks follow-up questions, refine the filter and re-query.
