---
id: cli-preview
title: assist ask and assist show
group: CLI
order: 5
covers:
  - cli:ask
  - cli:show
  - cli:ask-question
  - cli:backlog propose
---

## Commands

These open a session's [preview pane](../sessions-preview-panes/). `-` reads the body from stdin.

- `assist ask --title <title> --body <markdown|->` :badge[internal] shows markdown for approval and waits for the decision, printing any comments left on it. A rejection exits non-zero with the reason and comments. Outside a dashboard session it prints the markdown. Called by `/ask`.
- `assist ask-question --json <file|->` :badge[internal] shows `AskUserQuestion` questions as a form and waits for the answers, printing them as the built-in tool does. Dismissing them exits non-zero. Outside a dashboard session, or with `sessions.askQuestion` off, it exits non-zero so the agent uses the built-in tool. Called by Claude in place of `AskUserQuestion`.
- `assist show --body <markdown|-> [--title <title>]` :badge[internal] shows markdown and returns straight away. Outside a dashboard session it prints the markdown. Called by `/show`.
- `assist backlog propose --json <file|->` :badge[internal] proposes a backlog item from a JSON payload, and creates it with all its phases on approval. Outside a dashboard session it prints the item, and `--confirmed` creates it. Called by `/draft` and `/bug`.
