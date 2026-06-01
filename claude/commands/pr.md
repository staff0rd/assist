---
description: Raise a PR with a concise description
---

Raise a pull request for the current branch. Use a concise description with no headers. Do not reference Claude or any AI assistance in the title or body.

Use `gh pr create` to create the PR. Keep the title short and the body to a brief plain-text summary of the changes. Wrap symbols, file paths, function names, class names, variable names, config keys, CLI commands, and flag names in backticks.

Write the description in terms of behaviour and user-facing impact: what the change does, what's different for someone using it, and why. Keep technical detail to a minimum — do not walk through the implementation approach step by step, and do not restate what is already obvious from the diff or changelog (which files changed, which functions were added). The reviewer can read the code; the description should tell them what to expect from the change, not narrate how it was built.
