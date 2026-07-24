---
description: Post a PR's title and URL to the configured Slack channel
---

Post pull request `$ARGUMENTS` to the configured Slack channel.

1. Resolve the channel with `assist config get prs.slack`. If it is unset or empty, stop and tell the user to configure `prs.slack` in `assist.yml` (e.g. `assist config set prs.slack '#example'`). Do not post anything.
2. Fetch the PR with `gh pr view $ARGUMENTS --json title,url`.
3. Build the message `PR: [<title>](<url>)` using the fetched title and url.
4. Show the user the resolved channel and the exact message, and confirm via `AskUserQuestion` before posting.
5. On confirmation, resolve the channel name to its ID with `mcp__claude_ai_Slack__slack_search_channels`, then post the message to that channel with `mcp__claude_ai_Slack__slack_send_message`.
6. Capture the message permalink returned by `slack_send_message` and record it against the session's backlog item with `assist backlog record-slack "<permalink>" --title "<title>"` (using the PR title from step 2). Outside a backlog session this is a silent no-op.
