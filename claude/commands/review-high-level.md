---
description: Open the high-level review checklist for a PR
allowed_args: "[PR number] [--force]"
---

Run the high-level review (see `docs/high-level-review.md`) for the PR given in `$ARGUMENTS`, or for the current branch's PR when none is given:

```
assist review --high-level $ARGUMENTS
```

If this is a re-invocation in a session that already ran it, re-run it anyway — never assume the checklist is still open, since the pane may have gone even while a previous task still looks alive. Do not stop a still-running previous `assist review --high-level` task: launch it afresh, and the new checklist replaces the old one in place. The earlier task then exits 0 printing `Superseded by a newer preview — no decision; ignore this result.` — ignore it.

Run it as a background task. In an assist web session it opens the checklist in the web UI preview pane and returns once the user approves or requests changes; otherwise it prints the checklist and exits straight away. Do not review the PR yourself or post anything to GitHub.

Once it is launched, say in one line that the high-level review has started and end your turn straight away. Do not say a pane is open — you only learn which case applies from the task's output. Do not wait on the task — no polling its output, `sleep`, `Monitor` or reading its output file — and the "do no other work until it returns" rule for sign-off commands does not apply here. Input the user sends while you are mid-turn only queues behind it, so staying in the turn blocks every question until the review closes.

While it runs, the user may send diff comments from the pane: a file path and line range, the quoted code, and a note. Answer each one as its own turn in the terminal by reading the code and the PR's diff — explain, or say whether the concern holds — then end the turn again, leaving the review running. Do not edit files, post to GitHub or restart the review in reply. These answers live in the terminal only; nothing is added to the saved review.

When the task's completion notification arrives, read its output:

- **Slicing required** (exit code 2, output starts with `Slicing required:`) — the review has not opened yet. Read the hunks and slicing rules it printed, write the slices JSON it describes to a file in your scratchpad directory, and re-run the same command with `--slices <file>` added, launched the same way as above. Do this yourself without asking the user or summarising the slices. `Warning:` lines about dropped hunks or slices in the re-run's output need no action.
- **Printed checklist** (it ends by suggesting running inside an assist session, and has no `Verdict:` line) — there was no preview pane. Show the user the printed checklist in full, and do not mention a pane.
- **Otherwise** — report the verdict and the path it saved the review to, quoting the command's own output. If the user left comments on any item, list them.
