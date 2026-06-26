---
description: Associate a Jira ticket with a backlog item
allowed_args: "<JIRA-KEY> [backlog item id]"
---

You are associating a Jira ticket with a backlog item by calling the `assist backlog associate-jira` CLI command, which validates the key, confirms the issue exists in Jira, and stores it on the item.

## Step 1: Parse arguments

`$ARGUMENTS` contains a Jira key (e.g. `PROJ-123`) and an optional backlog item id. Identify which token is the Jira key (matches `[A-Z]+-\d+`) and which, if any, is the item id (a bare number).

## Step 2: Resolve the target item

If an explicit item id was provided, use it.

Otherwise, use the backlog item this session is working on — the one you are implementing, reviewing, or otherwise focused on (e.g. via `/next-backlog-item`, a `backlog run`, or earlier in this conversation). Use its id directly.

If there is no explicit id and this session is not working on a backlog item, there is nothing to associate the key with — tell the user and ask them to pass an explicit item id.

## Step 3: Associate the key

Call the CLI command with the resolved id and the Jira key:

```
assist backlog associate-jira <id> <JIRA-KEY> 2>&1
```

The command validates the key shape, fetches the issue to confirm it exists, prints its title, and stores the key. To remove an existing association instead, run:

```
assist backlog associate-jira <id> --clear 2>&1
```

Display the command output so the user can see the result. If the command reports an error (item not found, malformed key, or the issue could not be fetched), relay it to the user — no key is stored on failure.
