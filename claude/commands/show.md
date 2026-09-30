---
description: Open long links, paths and snippets in the web preview pane
allowed_args: "[what to show]"
---

The terminal hard-wraps long lines, which breaks URLs, paths and snippets for clicking and copying. `assist show` renders markdown in the session's web preview pane instead, where they stay whole.

## Step 1: compose the markdown

If `$ARGUMENTS` is non-empty, show what it describes.

If `$ARGUMENTS` is empty, gather every long URL, file path and code snippet from your previous reply. Leave out the surrounding prose. Keep each item verbatim and whole:

- URLs as markdown links or bare URLs, one per line
- paths in inline code
- snippets in fenced code blocks, with a language specifier where known

Give each item a short label saying what it is. If the previous reply has none, say so and stop.

Write the markdown to a scratch file with the Write tool. It will contain quotes, backticks and newlines, so don't inline it in a shell command.

## Step 2: show it

```
assist show --title '<short title>' --body - < <scratch file>
```

The command returns straight away and the pane stays open until the user closes it. Outside a web session it prints the markdown instead. Either way, tell the user in one line what you showed.
