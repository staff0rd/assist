---
description: Post a concise summary of this session's findings to a Jira ticket
allowed_args: "[JIRA-KEY]"
---

You are posting a concise comment summarising this session's findings to a Jira ticket via the Atlassian MCP. If a key is passed it is first attached to the session's current backlog item; otherwise the key is read from that item.

## Step 1: Resolve the session's backlog item

Determine the backlog item this session is working on — the one you are implementing, reviewing, or otherwise focused on (e.g. via `/next-backlog-item`, a `backlog run`, or earlier in this conversation). You need its id for the steps below.

## Step 2: Resolve the Jira key

If `$ARGUMENTS` contains a Jira key (matches `[A-Z]+-\d+`), attach it to the session's current backlog item, then use it:

```
assist backlog associate-jira <id> <JIRA-KEY> 2>&1
```

If the command reports an error (item not found, malformed key, or the issue could not be fetched), relay it to the user and stop — no key is stored on failure.

If no key was passed, read it from the session item:

```
assist backlog show <id> 2>&1
```

Use the `Jira: <KEY>` line from the output.

If no key can be resolved — none was passed and the item has no associated key (or there is no session item) — tell the user clearly that there is nothing to post to and do nothing further. Do not guess a key.

## Step 3: Fetch the issue and resolve the comment target

Fetch the issue with the `mcp__claude_ai_Atlassian__getJiraIssue` tool, requesting fields including `issuetype` and `parent`.

If `fields.issuetype` indicates a sub-task (`fields.issuetype.subtask` is true), retarget the comment to the parent: use `fields.parent.key` as the issue you comment on. Otherwise comment on the key itself.

## Step 4: Compose a concise comment

Draft a terse summary of this session's findings from the conversation context:

- One summary line stating what was done or found.
- A few short bullets with the concrete specifics (files, decisions, outcomes).

Keep it concise: no headers, no wall of text, no restating the whole session. If there is little of substance to report, keep it to the single summary line.

Do not mention `assist`, the assist backlog, or any backlog item number in the comment — the Jira ticket is outward-facing and must not leak internal tooling references. Refer to commits, PRs, or the work itself instead.

## Step 5: Preview and confirm before posting

Show the drafted comment and the target issue key to the user. Do not post until the user explicitly confirms. If they ask for edits, revise and show the updated draft again.

Once confirmed, post it with the `mcp__claude_ai_Atlassian__addCommentToJiraIssue` tool, using the resolved target key and `contentFormat: markdown`. Display the result so the user can see it landed.
