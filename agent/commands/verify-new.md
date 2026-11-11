---
description: Add a new verify:* run command to assist.yml
allowed_args: "[description of the verify check to add]"
---

The user wants to register a new `verify:*` run command via `assist run add`. Entries named with the `verify:` prefix are picked up by `assist verify` and executed in parallel as part of the standard verification suite, so they must stay quiet on success and only print on failure.

## Step 1: Understand the request

If the user provided a description via $ARGUMENTS, use that as a starting point. Otherwise, ask what check they want to add and which tool will run it.

## Step 2: Determine the correct syntax

Run `assist run add --help` to see the current CLI usage and options. Use the output to construct the correct command.

## Step 3: Hunt for quietness flags

`assist verify` runs every `verify:*` entry in parallel and only surfaces output for the ones that fail. A noisy success drowns the signal, so before registering the command, find the flag(s) that make the wrapped tool silent on success:

- Check the tool's `--help` for options like `--silent`, `--quiet`, `-q`, `--reporter=dot`, `--reporter=line`, `--no-progress`, `--log-level=error`, `--no-color`, etc.
- Prefer reporters that print only failures (e.g. `vitest --reporter=dot`, `oxlint --quiet`, `tsc --pretty false`).
- If the tool always prints a banner or summary on success, look for a way to suppress it (redirect, `--no-summary`, etc.). Mention any unavoidable noise to the user.

Apply those flags as part of the args you pass to `assist run add`.

## Step 4: Add the command

Run `assist run add verify:<name> <command> [args...]` with the quiet flags applied. The name **must** be prefixed with `verify:` so `assist verify` picks it up. For example:

```
assist run add verify:test vitest run --reporter=dot
assist run add verify:lint oxlint . --quiet
assist run add verify:types tsc --noEmit --pretty false
```

If the command needs a working directory, use `--cwd <dir>`.

## Step 5: Confirm with `assist verify`

Run `assist verify` and confirm the new entry passes and produces minimal output on success. If it prints noisy progress on success, return to Step 3 and tighten the flags before reporting done.
