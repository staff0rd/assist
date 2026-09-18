---
description: Preview a markdown message, then post it to a Slack channel
allowed_args: "[channel] [--thread <ts-or-permalink>] <what to say>"
---

Post a message, or a thread of them, to Slack on the user's behalf. `assist slack post` owns the preview and the approval; you own composing the markdown and sending it.

`$ARGUMENTS` may open with the target channel — `#name`, a bare name, or a channel id — followed by what the message should say. When no channel is given, omit it from the command and let `assist slack post` fall back to the `slack.channel` config key; if it errors because neither is set, pass on the setter it names rather than guessing a channel.

A `--thread <ts-or-permalink>` argument means the message is a reply: pass it straight through to `assist slack post`. The reference is either a message ts (`1712345678.123456`) or a Slack archives permalink — the command resolves it once and applies it to every message you preview.

Decide up front whether the ask is one message or a thread of several. Nothing is posted until the whole batch is approved, so compose every message before the first preview — never preview one, post it, then compose the next.

## Step 1: compose every message

Write each message as standard markdown. `slack_send_message` renders bold, italic, code, strikethrough, blockquotes, lists, links, code blocks (with a language specifier), tables and headers as they are, capped at 5000 characters — so no conversion to Slack's `*bold*` dialect, and no `<url|text>` links.

State only the confirmed conclusion and the facts behind it. No hedging, no speculative next steps, no pleasantries. Match the scope of what was asked.

Write each message to its own scratch file with the Write tool rather than inlining it in a shell command — the markdown will contain quotes, backticks and newlines. For a thread, write all of them now, in thread order.

## Step 2: preview them

One message:

```
assist slack post '<channel>' [--thread '<ts-or-permalink>'] --body - < <scratch file>
```

A thread, in thread order:

```
assist slack post '<channel>' [--thread '<ts-or-permalink>'] --parts <scratch file 1> <scratch file 2> ...
```

In an assist web session this renders each message in the preview pane for approve/reject — one pane per part, in sequence, titled with the target and the part's position in the batch (`2/3`). The command posts nothing either way.

- **Approved (`--body`)** — the last line of stdout is the path to the approved body under `~/.assist/slack/`. That file, not your scratch file, is what gets posted. The line above it names the target channel, and the resolved `thread_ts` when `--thread` was passed.
- **Approved (`--parts`)** — only after the last part is approved does the command print anything: a line naming the target, then one `k/N <path>` line per part in thread order under `~/.assist/slack/`, then a line saying how to thread them. Those files, not your scratch files, are what get posted.
- **Rejected** — the command exits non-zero with the reason and any inline comments, and names the working file of the message that was rejected (with its position, for a batch). No path is handed back, so nothing from the batch is posted. Address every comment, rewrite that working file in place, and re-run the same command with that working file in place of the scratch file it came from — a batch re-previews from part 1. Do not post, and do not recompose the messages from scratch.

Outside a web session there is no pane: the bodies pass straight through and the working files are written immediately.

## Step 3: post them

Read the approved bodies from the paths the command printed, then:

1. Resolve the channel to its id with `mcp__claude_ai_Slack__slack_search_channels` — use the channel the command's `Approved for ...` line names, which is the `slack.channel` default when you passed no argument — passing `channel_types: "public_channel,private_channel"` so private channels resolve too. If the query returns no match, or more than one plausible match, stop and ask the user which channel to use — do not guess.
2. Post each file's contents verbatim with `mcp__claude_ai_Slack__slack_send_message` (`channel_id`, `message`). Use `slack_send_message`, not `slack_send_message_draft`: the preview pane is the user's review.
   - With `--thread`, every message carries `thread_ts` set to the ts the command printed.
   - Without it, a batch is one new thread: post `1/N` to the channel with no `thread_ts`, then post `2/N` onwards in order, each with `thread_ts` set to the `ts` the first message returned.
3. Report the permalink of the first message.
