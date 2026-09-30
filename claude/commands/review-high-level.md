---
description: Open the high-level review checklist for a PR
allowed_args: "[PR number]"
---

Run the high-level review (see `docs/high-level-review.md`) for the PR given in `$ARGUMENTS`, or for the current branch's PR when none is given:

```
assist review --high-level $ARGUMENTS
```

Run it in the foreground with the maximum timeout and wait for it to finish — it opens the checklist in the web UI preview pane and returns once the user approves or requests changes. Do not review the PR yourself or post anything to GitHub.

When it returns, report the verdict and the path it saved the review to, quoting the command's own output. If the user left comments on any item, list them.
