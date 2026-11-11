---
description: Read a run session's output (e.g. a dev server) and summarise it
---

Read the output of a run session on this node and summarise it for the task at hand.

## Step 1: Pick the target

Look at `$ARGUMENTS`:

- **Empty** — the default server group: `assist sessions output --server`
- **Looks like a session id** (all digits, or `<node>:<digits>`) — `assist sessions output <id>`
- **Anything else** — a server group name: `assist sessions output --server <group>`

Add `-n <count>` if more than the default 200 lines is needed (e.g. the relevant error scrolled further back).

## Step 2: Run it

Run the chosen command with `2>&1`. On exit 1 it prints why (no daemon, unknown session, no live server for this repo and group, linked-node session) — report that message and stop.

## Step 3: Summarise

Do not echo the whole output. Report:

- Errors, stack traces and warnings, quoted verbatim with their surrounding lines
- The run's current state (e.g. listening on a port, compiling, crashed)
- Any lines relevant to what the conversation is working on

If nothing notable is there, say so in one line.
