---
description: Open the high-level review checklist for a PR
allowed_args: "[PR number] [--force]"
---

Run the high-level review (see `docs/high-level-review.md`) for the PR given in `$ARGUMENTS`, or for the current branch's PR when none is given:

```
assist review --high-level $ARGUMENTS
```

Run it as a background task — it opens the checklist in the web UI preview pane and returns once the user approves or requests changes. Do not review the PR yourself or post anything to GitHub.

While it runs, the user may send diff comments from the pane: a file path and line range, the quoted code, and a note. Answer each one in the terminal by reading the code and the PR's diff — explain, or say whether the concern holds. Do not edit files or post to GitHub in reply.

When the task returns, report the verdict and the path it saved the review to, quoting the command's own output. If the user left comments on any item, list them.
