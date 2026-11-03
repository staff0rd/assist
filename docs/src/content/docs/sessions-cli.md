---
id: sessions-cli
title: Session commands
group: Sessions
order: 4
covers:
  - claude:close
  - claude:rename
  - claude:run-logs
---

## Slash commands

Ask the agent in a session to act on its own card with these slash commands:

- `/rename [title]` retitles the card, inferring a title from the conversation when you give none. The new title beats both the generated title and the backlog item's name for the rest of the session's life.
- `/close` has the agent judge whether its work is finished and, only if so, end the session and reap its worktree, subject to the unpushed-work rule.
- `/run-logs [session-id|group]` has the agent read and summarise another session's output: the repo's live dev server by default or for a server group, or any session on this node by id.
