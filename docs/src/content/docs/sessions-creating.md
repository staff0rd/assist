---
id: sessions-creating
title: Creating sessions
group: Sessions
order: 2
covers:
  - config:sessions.newSessionMode
screenshots:
  - file: sessions-new.png
    alt: The new-session dialog in draft mode
    route: /sessions
    scene: dashboard
    waitFor: text=Pricing page copy
    actions:
      - click: text=Dark mode toggle
      - click: "[aria-label='New session']"
  - file: sessions-run.png
    alt: A dev server running as a session
    route: /sessions
    scene: dashboard
    waitFor: text=Pricing page copy
    actions:
      - click: "text=run: dev"
---

## The new-session dialog

The **+** button in the toolbar, :kbd[Mod+N] or :kbd[Alt+N] opens the new-session dialog. Type what you want, pick the repo and a mode, and press :kbd[Enter] (:kbd[Shift+Enter] adds a newline, :kbd[Esc] closes). A session started while another is open starts in the background; hold :kbd[Shift] as you click the start button to switch to it once it starts.

::screenshot{file="sessions-new.png"}

| Mode   | Starts                                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| draft  | Claude drafts a backlog item from your description, asking questions as it goes                                                |
| bug    | Claude files a bug with reproduction steps, expected and actual behaviour                                                      |
| prompt | A plain agent session with your text as its first prompt. When Codex or pi is available, a menu on this mode picks the harness |
| design | An interactive Claude session with assist's design system prompt appended                                                      |

Draft and bug need a repo. When the repo isn't cloned on the node you picked, the button offers to clone it first. Hold :kbd[Shift] as you click **Start draft** or **File bug** and the item the session proposes is approved and its run started.

The dialog opens in `draft` mode. To open it in another mode:

```bash
assist config set sessions.newSessionMode prompt
```

## Run sessions

A repo's [run commands](../run-commands/) can run as sessions too, so a dev server's output sits next to the agents using it. When the repo has run commands, the toolbar's run menu starts them.

A run command flagged `server:` is a dev server, and only one may be live per server group across a repo's clone and worktrees. Cards in that repo show a start button, the serving card shows :badge[serving] and a stop button, and starting a second one replaces the first. Hold :kbd[Shift] as you click a start button, a server in the run menu or **Retry** to skip the confirmation. Agents can read a run's output with `/run-logs` (see [Session commands](../sessions-cli/#slash-commands)).

::screenshot{file="sessions-run.png"}
