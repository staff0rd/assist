---
description: Raise a PR with a concise description
---

Raise a pull request for the current branch. Use a concise description with no headers. Do not reference Claude or any AI assistance in the title or body.

Use `assist prs create --title <title> --body <body>` to create the PR — do not use `gh pr create` directly. Keep the title short and the body to a brief plain-text summary of the changes. Wrap symbols, file paths, function names, class names, variable names, config keys, CLI commands, and flag names in backticks.

Write the description in terms of behaviour and user-facing impact: what the change does, what's different for someone using it, and why. Keep technical detail to a minimum — do not walk through the implementation approach step by step, and do not restate what is already obvious from the diff or changelog (which files changed, which functions were added). The reviewer can read the code; the description should tell them what to expect from the change, not narrate how it was built.

Before creating the PR, the user must see the full proposed title and body — do not assume they can see your reasoning or earlier tool output. Write the complete title and body verbatim in your visible reply, then use the AskUserQuestion tool to ask whether to create the PR, putting the full title and body in the approve option's `preview` field so the dialog itself displays them. This confirmation is mandatory in every permission mode, including auto-accept and bypass-permissions — never run `assist prs create` until the user has explicitly approved the title and body through AskUserQuestion. If the user requests changes, revise and confirm again before creating.
