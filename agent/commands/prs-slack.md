---
description: Post a PR's title and URL to the configured Slack channel
---

Post pull request `$ARGUMENTS` to the configured Slack channel.

`$ARGUMENTS` is the PR number, optionally followed by `--no-confirm`. When `--no-confirm` is present, skip the confirmation in step 4 and post straight away — every other step is unchanged. Strip the flag before using the PR number.

1. Resolve the channel with `assist prs slack-channel`. If it exits non-zero, stop and relay its message to the user. Do not post anything. This applies with `--no-confirm` too.
2. Fetch the PR with `gh pr view <number> --json title,url`.
3. Build the message `PR: [<title>](<url>)` using the fetched title and url.
4. Show the user the resolved channel and the exact message, and confirm via `AskUserQuestion` before posting. Skip this step when `--no-confirm` was passed, printing the channel and message instead.
5. On confirmation (or immediately with `--no-confirm`), resolve the channel name to its ID with `mcp__claude_ai_Slack__slack_search_channels`, then post the message to that channel with `mcp__claude_ai_Slack__slack_send_message`.
6. Capture the message permalink returned by `slack_send_message` and record it against the session's backlog item with `assist backlog record-slack "<permalink>" --title "<title>"` (using the PR title from step 2). It prints the item the link was attached to, or that nothing was recorded when there is no current backlog item. Relay a reported failure to the user.
