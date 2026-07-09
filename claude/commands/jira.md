---
description: View or act on a Jira work item (view, associate, update, started, done, help)
allowed_args: "[action] [JIRA-KEY] [args]"
---

You are the `/jira` dispatcher. Parse `$ARGUMENTS` into an **action verb** plus optional key/args, then run that action. Actions: `view`, `associate`, `update`, `started`, `done`, `help`.

## Step 1: Parse the action

Tokenise `$ARGUMENTS` on whitespace.

- No tokens → run **help**.
- First token is a known action verb (`view`, `associate`, `update`, `started`, `done`, `help`) → that is the action; the remaining tokens are its args.
- First token matches a Jira key (`[A-Z]+-\d+`) → action is **view**, key is that token.
- Anything else → run **help** (the input was not understood).

## Step 2: Resolve the key (for view / started / done / update)

These actions operate on a single Jira issue. Resolve it once:

- If the action's args include a token matching `[A-Z]+-\d+`, use that key verbatim.
- Otherwise read it from the backlog item this session is working on — the one you are implementing, reviewing, or otherwise focused on (e.g. via `/next-backlog-item`, a `backlog run`, or earlier in this conversation). Get its id, then run:

  ```
  assist backlog show <id> 2>&1
  ```

  Use the `Jira: <KEY>` line from the output.

If no key can be resolved — none was passed and there is no session item, or the item has no associated key — tell the user there is nothing to act on and ask them to pass an explicit key. Do not guess a key.

Resolve the Atlassian `cloudId` once via `mcp__claude_ai_Atlassian__getAccessibleAtlassianResources` and reuse it for every MCP call below.

started and done act on the **exact** issue/subtask the key resolves to. Do not retarget to a parent issue.

## Action: view

Fetch the issue with `mcp__claude_ai_Atlassian__getJiraIssue` and display the result to the user.

## Action: associate

Associate a Jira ticket with a backlog item by calling the `assist backlog associate-jira` CLI command, which validates the key, confirms the issue exists in Jira, and stores it on the item. Args are `<JIRA-KEY> [backlog item id]`.

Identify which token is the Jira key (matches `[A-Z]+-\d+`) and which, if any, is the item id (a bare number).

Resolve the target item: use the explicit item id if provided, otherwise the backlog item this session is working on. If there is no explicit id and this session is not working on a backlog item, there is nothing to associate the key with — tell the user and ask them to pass an explicit item id.

Call the CLI command with the resolved id and the Jira key:

```
assist backlog associate-jira <id> <JIRA-KEY> 2>&1
```

To remove an existing association instead, run:

```
assist backlog associate-jira <id> --clear 2>&1
```

Display the command output so the user can see the result. If the command reports an error (item not found, malformed key, or the issue could not be fetched), relay it to the user — no key is stored on failure.

## Action: update

Post a concise comment summarising this session's findings to a Jira ticket. If a key is passed it is first attached to the session's current backlog item; otherwise the key is read from that item.

**Resolve the key** as in Step 2, with one addition: if a key was explicitly passed in the args, first attach it to the session's current backlog item, then use it:

```
assist backlog associate-jira <id> <JIRA-KEY> 2>&1
```

If the command reports an error (item not found, malformed key, or the issue could not be fetched), relay it to the user and stop — no key is stored on failure.

**Resolve the comment target:** fetch the issue with `mcp__claude_ai_Atlassian__getJiraIssue`, requesting fields including `issuetype` and `parent`. If `fields.issuetype.subtask` is true, retarget the comment to the parent: use `fields.parent.key` as the issue you comment on. Otherwise comment on the key itself.

**Compose a concise comment** from the conversation context:

- One summary line stating what was done or found.
- A few short bullets with the concrete specifics (files, decisions, outcomes).

Keep it concise: no headers, no wall of text, no restating the whole session. If there is little of substance to report, keep it to the single summary line.

Do not mention `assist`, the assist backlog, or any backlog item number in the comment — the Jira ticket is outward-facing and must not leak internal tooling references. Refer to commits, PRs, or the work itself instead.

**Preview and confirm before posting.** Show the drafted comment and the target issue key to the user. Do not post until the user explicitly confirms. If they ask for edits, revise and show the updated draft again. Once confirmed, post it with `mcp__claude_ai_Atlassian__addCommentToJiraIssue`, using the resolved target key and `contentFormat: markdown`. Display the result so the user can see it landed.

## Action: started

Move the resolved issue to In Progress and assign it to yourself:

1. Get the current Atlassian user with `mcp__claude_ai_Atlassian__atlassianUserInfo` to obtain their `account_id`.
2. Assign the issue with `mcp__claude_ai_Atlassian__editJiraIssue`, setting `fields.assignee` to `{ "accountId": "<account_id>" }`.
3. List transitions with `mcp__claude_ai_Atlassian__getTransitionsForJiraIssue`. Find the one whose target status name matches **In Progress** case-insensitively and apply it with `mcp__claude_ai_Atlassian__transitionJiraIssue`.

If no matching transition is available, list the available transition names to the user and stop (the assignment above still stands — tell the user it was applied).

Report the final assignee and status.

## Action: done

Move the resolved issue to Done with **no** assignment change:

1. List transitions with `mcp__claude_ai_Atlassian__getTransitionsForJiraIssue`. Find the one whose target status name matches **Done** case-insensitively and apply it with `mcp__claude_ai_Atlassian__transitionJiraIssue`.

If no matching transition is available, list the available transition names to the user and stop.

Report the final status.

## Action: help

List the available actions and their arguments:

- `/jira <KEY>` or `/jira view <KEY>` — view an issue (KEY optional; falls back to the session item's Jira key).
- `/jira associate <KEY> [id]` — associate a Jira ticket with a backlog item (id optional; falls back to the session item).
- `/jira update [KEY]` — post a concise session-summary comment to the issue (retargets sub-task comments to the parent; previews before posting).
- `/jira started [KEY]` — assign the issue to yourself and transition it to In Progress.
- `/jira done [KEY]` — transition the issue to Done (no assignment change).
- `/jira help` — show this list.

Note that every action's `[KEY]` is optional: when omitted it resolves from the session's current backlog item.
