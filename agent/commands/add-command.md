---
description: Add a new run command via assist run add
allowed_args: "[description of the command to add]"
---

The user wants to register a new run command via `assist run add`. This adds a named entry to the repo's `run` list — in `assist.yml`, or with `--repo [name]` in the repo's override in the shared db (seen by every node, no command file created) — so it can be invoked with `assist run <name>`.

## Step 1: Understand the request

If the user provided a description via $ARGUMENTS, use that as a starting point. Otherwise, ask what command they want to add.

## Step 2: Read the reference

Run `assist run add --help` before anything else. It lists every run entry property with its flag and is the complete reference: if a property is listed there, `assist run` supports it — don't work around it (e.g. with `cross-env` or a shell wrapper) or tell the user it's unsupported. Commands are spawned without a shell, so use `--env KEY=VALUE` for environment variables rather than `FOO=bar cmd`.

## Step 3: Add the command

Run `assist run add <name> <command> [args...]` with the flags from the help. For example:

```
assist run add dev npm run dev --cwd web --env API_URL=http://localhost:3000 --server --port 3000
```

Every property has a flag; only a param's `description` has to be edited in `assist.yml` after adding the entry.

## Step 4: Verify

Run `assist run <name>` to confirm the command works, or `assist run <name> --help` if it accepts params.
