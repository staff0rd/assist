---
description: Discover CLI commands and classify read vs write verbs
allowed_args: "<cli-name>"
---

Generate read verb classifications for a CLI tool. This discovers all commands via `assist cli-discover` and classifies them as read or write operations.

1. Run `assist cli-discover $ARGUMENTS 2>&1` to get the command tree (output is human-readable, one command per line formatted as `  path — description`)
2. Review the discovered commands and classify the **leaf verb** (last word in the path) of each command as either read (safe, no side effects) or write (modifies state)
   - Read examples: list, view, show, get, diff, status, search, checks, describe, inspect, logs, cat, top, explain
   - Write examples: create, delete, merge, close, reopen, edit, update, set, apply, patch, drain, cordon, taint, push, deploy
   - Use your judgment for ambiguous verbs — consider what the command actually does in context of this specific CLI
   - De-duplicate: only include unique verb strings (e.g. if "list" appears in multiple paths, include it once)
3. Read the current `assist.yml` config file
4. Update the `cliReadVerbs` section, adding or replacing the entry for this CLI with the classified read verbs:
   ```yaml
   cliReadVerbs:
     <cli>: [verb1, verb2, verb3, ...]
   ```
5. Report a summary showing the read verbs and write verbs identified

ARGUMENTS: $ARGUMENTS
