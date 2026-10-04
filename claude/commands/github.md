---
description: View or act on a GitHub issue (view, edit, associate, update, started, done, help)
allowed_args: "[action] [owner/repo#number | issue-url] [args]"
---

You are the `/github` dispatcher. Parse `$ARGUMENTS` into an **action verb** plus optional issue/args, then run that action. Actions: `view`, `edit`, `associate`, `update`, `started`, `done`, `help`.

All GitHub operations go through the `gh` CLI. A GitHub issue is referenced as the compact shorthand `owner/repo#number` (e.g. `staff0rd/assist#5`) or a full `https://github.com/owner/repo/issues/N` URL.

## Step 1: Parse the action

Tokenise `$ARGUMENTS` on whitespace.

- No tokens → run **help**.
- First token is a known action verb (`view`, `edit`, `associate`, `update`, `started`, `done`, `help`) → that is the action; the remaining tokens are its args.
- First token matches a GitHub issue reference (`owner/repo#number` or a `github.com/.../issues/N` URL) → action is **edit**, issue is that token.
- Anything else → run **help** (the input was not understood).

## Step 2: Resolve the issue (for view / edit / started / done / update)

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

## Action: edit

Rework the issue's body in the assist web preview pane. This is what a bare issue reference runs. Run it and nothing else:

```
assist github issue edit <number> -R <owner>/<repo> 2>&1
```

Do not check for a web session yourself — the command already knows. In a web session it fetches the issue's current body, opens it in the preview pane, and pushes the pane's markdown back on approval; outside one it just prints the issue. Only the body is ever touched — the title, labels, assignees and state are left alone.

Display the output so the user can see what happened. If the command exits non-zero, relay what it reported and stop — nothing was pushed. Two cases to relay verbatim:

- **Request changes** — the reason and every inline comment, each with the excerpt it was left on. The output names the working file holding the pane's markdown, collapses included. Revise **that file in place** to address the comments — never recompose the body from scratch — then re-run the command, which previews the revised file with the earlier collapses intact. Pass `--fresh` only when the working file should be thrown away and the issue re-fetched.
- **The issue moved on GitHub** — it names the working file holding the markdown. Someone else edited the issue, so nothing was pushed; tell the user rather than re-running blind.

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

**Post it** through the assist wrapper, which validates the body and, in a web session, opens the preview pane for approve/reject before anything lands:

```
assist github issue comment <number> -R <owner>/<repo> --body "<comment>" 2>&1
```

Display the result so the user can see it landed. If the command exits non-zero, relay the rejection reason and any inline comments, revise the draft accordingly, and run it again — nothing was posted.

## Action: started

Assign the resolved issue to yourself and move every project board it sits on to In Progress:

```
assist github issue started <number> -R <owner>/<repo> 2>&1
```

The command always assigns first and exits 0 when the board can't be moved (no board, no In Progress option, missing `project` scope). Relay what it reports: the assignee and each board's outcome.

## Action: done

Close the resolved issue with **no** assignment change:

```
gh issue close <number> -R <owner>/<repo> 2>&1
```

Report the final state.

## Action: help

List the available actions and their arguments:

- `/github view <ref>` — print an issue to chat (ref optional; falls back to the session item's GitHub issue).
- `/github <owner/repo#number>` — rework that issue in the web preview pane (see `edit`).
- `/github edit [ref]` — rework the issue body in the web preview pane (what a bare `/github <ref>` runs; the command prints the issue instead when there is no web session).
- `/github associate <ref> [id]` — associate a GitHub issue with a backlog item (id optional; falls back to the session item).
- `/github update [ref]` — post a concise session-summary comment to the issue (previewed for approval before posting).
- `/github started [ref]` — assign the issue to yourself and move its project boards to In Progress.
- `/github done [ref]` — close the issue (no assignment change).
- `/github help` — show this list.

Note that every action's `[ref]` is optional: when omitted it resolves from the session's current backlog item.
