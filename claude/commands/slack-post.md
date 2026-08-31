---
description: Preview a markdown message, then post it to a Slack channel
allowed_args: "<channel> <what to say>"
---

Post a message to Slack on the user's behalf. `assist slack post` owns the preview and the approval; you own composing the markdown and sending it.

`$ARGUMENTS` is the target channel — `#name`, a bare name, or a channel id — followed by what the message should say. If the channel is missing, ask for it before composing anything.

## Step 1: compose the message

Write the message as standard markdown. `slack_send_message` renders bold, italic, code, strikethrough, blockquotes, lists, links, code blocks (with a language specifier), tables and headers as they are, capped at 5000 characters — so no conversion to Slack's `*bold*` dialect, and no `<url|text>` links.

State only the confirmed conclusion and the facts behind it. No hedging, no speculative next steps, no pleasantries. Match the scope of what was asked.

Write it to a scratch file with the Write tool rather than inlining it in a shell command — the markdown will contain quotes, backticks and newlines.

## Step 2: preview it

```
assist slack post '<channel>' --body - < <scratch file>
```

In an assist web session this renders the markdown in the preview pane for approve/reject. The command posts nothing either way.

- **Approved** — the last line of stdout is the path to the approved body under `~/.assist/slack/`. That file, not your scratch file, is what gets posted: it carries any edit made in the pane.
- **Rejected** — the command exits non-zero with the reason and any inline comments, and names the same working file. Address every comment, rewrite that file in place, and re-run the preview against it (`assist slack post '<channel>' --body - < <working file>`). Do not post, and do not recompose the message from scratch.

Outside a web session there is no pane: the body passes straight through and the working file is written immediately.

## Step 3: post it

Read the approved body from the path the command printed, then:

1. Resolve the channel to its id with `mcp__claude_ai_Slack__slack_search_channels`, passing `channel_types: "public_channel,private_channel"` so private channels resolve too. If the query returns no match, or more than one plausible match, stop and ask the user which channel to use — do not guess.
2. Post the file's contents verbatim with `mcp__claude_ai_Slack__slack_send_message` (`channel_id`, `message`). Use `slack_send_message`, not `slack_send_message_draft`: the preview pane is the user's review.
3. Report the permalink it returns.
