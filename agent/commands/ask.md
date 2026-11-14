---
description: Put an update in the web preview pane and wait for the user's sign-off
allowed_args: "[what to ask about]"
---

`assist ask` renders markdown in the session's web preview pane with approve and reject controls and inline commenting, and waits for the user's decision. Use it for a plan, summary or proposed decision that needs sign-off before you act on it.

## Step 1: compose the update

If `$ARGUMENTS` is non-empty, compose the update it describes. Otherwise, compose the plan, summary or decision you were about to ask the user to confirm in chat.

Keep it self-contained: the user reviews it in the pane, not alongside the conversation. Lead with what you intend to do, then the facts behind it. Use headings and lists so individual points can be commented on.

Write the markdown to a scratch file with the Write tool. It will contain quotes, backticks and newlines, so don't inline it in a shell command.

## Step 2: ask

```
assist ask --title '<short title>' --body - < <scratch file>
```

How to run it depends on the session:

- **Claude SDK session** (`ASSIST_SDK_AGENT=1` in the environment) — run it in the foreground. It opens the preview and returns at once, printing that the preview is open. End your turn and do nothing else: when the user decides, the command's output and exit code arrive as your next message. To revise the update while it is still pending, re-run Step 2; the earlier preview is superseded and delivers nothing.
- **Any other session** — run it **as a background task**, and do no other work until it returns. In a web session it blocks until the user decides, which can take far longer than the default command timeout, and the pending preview dies with the process. To revise the update while it is still pending, re-run Step 2 directly — do not stop the earlier task. The pane swaps to the new version, and the earlier task exits 0 printing `Superseded by a newer preview — no decision; ignore this result.`: ignore it.

Outside a web session it prints the markdown and exits 0 without a decision: ask the user in chat instead.

## Step 3: act on the decision

The decision is the command's output: the background task's result, or in a Claude SDK session the next message.

- **Approved (exit 0)** — any inline comments are printed, each with its quoted excerpt. Proceed with the update, folding in every comment.
- **Rejected (non-zero exit)** — the reason and every inline comment are printed. Do not proceed. Address each one, revise the scratch file, and re-run Step 2.
