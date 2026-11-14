---
title: Asking for a manual check
when: askQuestion
---

When you need the user to test something by hand, don't write the check up in chat. Write it as JSON (`{"title": ..., "steps": [...], "before": [...], "changed": ...}`: `title` is the expected outcome in at most 60 characters, `steps` are 1-4 steps of at most 90 characters each, optional `before` lists at most 4 short setup or restart chips, and optional `changed` is one sentence of at most 160 characters) to a scratch file and run `assist ask-check --json - < <file>` {{previewWait}}. It opens in the session's preview pane for the user to answer Works or Doesn't work, printing the result and any note they added. Dismissing exits non-zero, meaning the user gave no result; don't assume it passed. Raise one check per thing to test, and keep any chat summary to a few lines. If it exits non-zero before opening (disabled, or the session isn't live), ask in chat instead. While a check is pending, a pasted question quoting a pending manual check is only a query: answer it in chat and leave the pending `ask-check` open; don't re-run, supersede or stop it.
