---
description: Add a new run command to assist.yml
allowed_args: "[description of the command to add]"
---

The user wants to register a new run command via `assist run add`. This command adds a named entry to the `run` section of `assist.yml` so it can be invoked with `assist run <name>`.

## Step 1: Understand the request

If the user provided a description via $ARGUMENTS, use that as a starting point. Otherwise, ask what command they want to add.

## Step 2: Determine the correct syntax

Run `assist run add --help` to see the current CLI usage and options. Use the output to construct the correct command.

## Step 3: Add the command

Run `assist run add <name> <command> [args...]` with the appropriate arguments. For example:

```
assist run add lint oxlint --fix
```

If the command needs a working directory, use `--cwd <dir>`.

## Step 4: Verify

Run `assist run <name>` to confirm the command works, or `assist run <name> --help` if it accepts params.
