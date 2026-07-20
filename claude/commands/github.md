---
description: View or act on a GitHub issue (view, associate, update, started, done, help)
allowed_args: "[action] [owner/repo#number | issue-url] [args]"
---

You are the `/github` dispatcher. Parse `$ARGUMENTS` into an **action verb** plus optional issue/args, then run that action. Actions: `view`, `associate`, `update`, `started`, `done`, `help`.

All GitHub operations go through the `gh` CLI. A GitHub issue is referenced as the compact shorthand `owner/repo#number` (e.g. `staff0rd/assist#5`) or a full `https://github.com/owner/repo/issues/N` URL.

## Step 1: Parse the action

Tokenise `$ARGUMENTS` on whitespace.

- No tokens → run **help**.
- First token is a known action verb (`view`, `associate`, `update`, `started`, `done`, `help`) → that is the action; the remaining tokens are its args.
- First token matches a GitHub issue reference (`owner/repo#number` or a `github.com/.../issues/N` URL) → action is **view**, issue is that token.
- Anything else → run **help** (the input was not understood).

## Step 2: Resolve the issue (for view / started / done / update)

These actions operate on a single GitHub issue. Resolve it once:

- If the action's args include a token matching `owner/repo#number` or a `github.com/.../issues/N` URL, use that reference verbatim.
- Otherwise read it from the backlog item this session is working on — the one you are implementing, reviewing, or otherwise focused on (e.g. via `/next-backlog-item`, a `backlog run`, or earlier in this conversation). Get its id, then run:

  ```
  assist backlog show a<id> 2>&1
  ```

  Use the `GitHub: <owner/repo#number>` line from the output.

If no issue can be resolved — none was passed and there is no session item, or the item has no associated GitHub issue — tell the user there is nothing to act on and ask them to pass an explicit issue. Do not guess an issue.

From an `owner/repo#number` reference, the `gh` repo flag is `-R <owner>/<repo>` and the issue selector is the `<number>`. A full issue URL can be passed to `gh` directly as the selector.

## Action: view

Fetch and display the issue:

```
gh issue view <number> -R <owner>/<repo> 2>&1
```

Display the result to the user.

## Action: associate

Associate a GitHub issue with a backlog item by calling the `assist backlog associate-github` CLI command, which normalises the reference, confirms the issue exists via `gh`, and stores it on the item. Args are `<owner/repo#number | issue-url> [backlog item id]`.

Identify which token is the issue reference and which, if any, is the item id (a bare number, optionally `a`-prefixed).

Resolve the target item: use the explicit item id if provided, otherwise the backlog item this session is working on. If there is no explicit id and this session is not working on a backlog item, there is nothing to associate the issue with — tell the user and ask them to pass an explicit item id.

Call the CLI command with the resolved id and the issue reference:

```
assist backlog associate-github <id> <owner/repo#number | issue-url> 2>&1
```

To remove an existing association instead, run:

```
assist backlog associate-github <id> --clear 2>&1
```

Display the command output so the user can see the result. If the command reports an error (item not found, malformed reference), relay it to the user — nothing is stored on failure. Associating a GitHub issue clears any Jira key on the item (one external tracker per item).

## Action: update

Post a concise comment summarising this session's findings to a GitHub issue. If an issue reference is passed it is first attached to the session's current backlog item; otherwise the reference is read from that item.

**Resolve the issue** as in Step 2, with one addition: if a reference was explicitly passed in the args, first attach it to the session's current backlog item, then use it:

```
assist backlog associate-github <id> <owner/repo#number | issue-url> 2>&1
```

If the command reports an error, relay it to the user and stop — nothing is stored on failure.

**Compose a concise comment** from the conversation context:

- One summary line stating what was done or found.
- A few short bullets with the concrete specifics (files, decisions, outcomes).

Keep it concise: no headers, no wall of text, no restating the whole session. If there is little of substance to report, keep it to the single summary line.

Do not mention `assist`, the assist backlog, or any backlog item number in the comment — the GitHub issue is outward-facing and must not leak internal tooling references. Refer to commits, PRs, or the work itself instead.

**Preview and confirm before posting.** Show the drafted comment and the target issue to the user. Do not post until the user explicitly confirms. If they ask for edits, revise and show the updated draft again. Once confirmed, post it:

```
gh issue comment <number> -R <owner>/<repo> --body "<comment>" 2>&1
```

Display the result so the user can see it landed.

## Action: started

Assign the resolved issue to yourself:

```
gh issue edit <number> -R <owner>/<repo> --add-assignee @me 2>&1
```

GitHub issues have no generic "In Progress" state (only open/closed), so `started` only self-assigns. If the repo tracks status via a project board, tell the user that must be moved manually.

Report the final assignee.

## Action: done

Close the resolved issue with **no** assignment change:

```
gh issue close <number> -R <owner>/<repo> 2>&1
```

Report the final state.

## Action: help

List the available actions and their arguments:

- `/github <owner/repo#number>` or `/github view <ref>` — view an issue (ref optional; falls back to the session item's GitHub issue).
- `/github associate <ref> [id]` — associate a GitHub issue with a backlog item (id optional; falls back to the session item).
- `/github update [ref]` — post a concise session-summary comment to the issue (previews before posting).
- `/github started [ref]` — assign the issue to yourself.
- `/github done [ref]` — close the issue (no assignment change).
- `/github help` — show this list.

Note that every action's `[ref]` is optional: when omitted it resolves from the session's current backlog item.
