---
description: Rename this session's dashboard card
allowed_args: "[title]"
---

Retitle the session this conversation is running in, so its dashboard card reads as something useful.

## Step 1: Decide the title

If `$ARGUMENTS` is non-empty, that text **is** the title — use it verbatim. Do not rewrite, expand, or capitalise it.

If `$ARGUMENTS` is empty, infer the title from this conversation: what the session is actually working on, as a short noun phrase of at most 48 characters (e.g. `fix login redirect`, `rename command phase 2`). Base it only on the conversation — do not run commands to investigate.

## Step 2: Apply it

```
assist sessions rename '<title>'
```

Use single quotes to avoid shell escaping issues. The rename is permanent for the life of the session: it beats both the generated title and the backlog item name, and renaming again is the only way to change it.

## Step 3: Report

Tell the user the new name in one line. If the command reports there is no daemon-managed session to rename, relay that instead.
