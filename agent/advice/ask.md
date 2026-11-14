---
title: Asking for sign-off
when: assistSession
---

When a plan, summary or proposed decision needs the user's sign-off before you act on it, don't ask in chat. Write it as markdown to a scratch file and run `assist ask --title '<title>' --body - < <file>` {{previewWait}}. It opens in the session's web preview pane with approve, reject and inline comments. Approval exits 0 and prints any comments to fold in; rejection exits non-zero with the reason and comments — revise and re-run. {{previewRevise}}
