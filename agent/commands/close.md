---
description: End this session if its work is finished
---

Decide whether this session's work is finished, and if it is, close the session.

## Step 1: Judge

Base the judgement **only on your read of this conversation**. Two questions:

1. Did the last task the user asked for run to completion?
2. Is anything still waiting on the user — an unanswered question, a choice you offered, a change you asked them to test or approve?

The work is finished when the answer is yes to the first and no to the second.

Do **not** run `assist verify`, inspect the working tree, check for uncommitted changes, or run any other command to inform this judgement. Uncommitted work is not a blocker; worktree durability is settled by the daemon when it reaps the session.

## Step 2: Act

If the work is finished, tell the user the session is closing, then run:

```
assist sessions close
```

The daemon kills this session's process tree, so nothing after that command will run.

If the work is not finished, do not run the command. State in one or two sentences what is outstanding — the unfinished task, or the question awaiting an answer — and leave the session running.
