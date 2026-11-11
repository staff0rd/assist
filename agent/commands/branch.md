---
description: Create a branch off the fresh remote default via assist branch
allowed_args: "<description of the work> [--jira KEY]"
---

You are creating a git branch by calling the `assist branch` CLI command, which fetches and branches off the fresh remote default (`origin/<default>`) and enforces the team naming convention.

## Step 1: Derive the slug

`$ARGUMENTS` is a free-text description of the work (e.g. "add login form"). Turn it into a concise kebab-case slug: lowercase, words joined by hyphens, no leading/trailing punctuation (e.g. `add-login-form`).

Do not put backlog item numbers in the slug — `assist branch` rejects bare 1–4 digit numeric tokens and `#<number>` references, because they look like internal backlog IDs. If the description contains such a number, drop or reword it (e.g. "fix 404 page" → `fix-not-found-page`).

## Step 2: Resolve the Jira key

If `$ARGUMENTS` contains an explicit `--jira <KEY>` (or a bare `[A-Z]+-\d+` token), use that key.

Otherwise, if this session is working on a backlog item, read its associated Jira key:

```
assist backlog show <id> 2>&1
```

If the output includes a `Jira: <KEY>` line, use that key. If there is no session item or no associated key, omit `--jira` entirely.

## Step 3: Create the branch

Run the command with the resolved slug and optional key:

```
assist branch <slug> --jira <KEY> 2>&1
```

Omit `--jira <KEY>` when no key was resolved. Display the command output so the user sees the created branch name and the `origin/<default>` it was based on. If the command reports an error (invalid slug, git failure), relay it to the user — no branch is created on failure.
