---
id: updating
title: Updating assist
group: Getting started
order: 1
covers:
  - cli:update
  - config:autoUpdate.enabled
  - config:autoUpdate.restart
  - config:autoUpdate.idleMinutes
screenshots:
  - file: updates-panel.png
    alt: The Nodes page, listing this node and a linked node with their versions and update state
    route: /nodes
    setup:
      - peer: desktop
    waitFor: text=desktop
---

## Automatic updates

When assist is installed from a git clone, it keeps itself up to date in the background. When the clone's upstream gets new commits, assist pulls and installs them.

If the clone has local commits and cannot fast-forward, assist starts a Claude session in it to rebase or merge onto the upstream, push and rebuild. Updates pause until that session closes.

To turn automatic updates off:

```bash
assist config set autoUpdate.enabled false
```

A global npm install is not updated automatically.

## The Nodes page

The Nodes page opens from **Nodes** in the dashboard's menu, from the version badge in the [status bar](../sessions-overview/#the-status-bar), or with :kbd[Alt+Q]. It lists this node first, then each [linked node](../sessions-linked-nodes/), with the version each is running and one status chip saying where its updates or its link are up to.

::screenshot{file="updates-panel.png"}

- **Restart** on a row restarts that node's daemon and web server onto the new build it has ready, and **Restart web** restarts just its web server.
- **Check now** checks every node for new commits straight away.
- **Open fix** jumps to the session fixing a clone that couldn't fast-forward.
- **Pause updates** in a row's **⋯** menu stops that node pulling updates, until you **Resume updates**.
- **Auto-restart** in the same menu (`autoUpdate.restart`) restarts the node onto a ready build by itself, once its agent sessions have all been waiting on you for a minute.
- Expand a row for its connection and its update history.

While you're using the dashboard, auto-restart holds off, on this node and on any linked node you're viewing, until you've been idle for two minutes. To change how long:

```bash
assist config set autoUpdate.idleMinutes 5 --node
```

## Manual updates

```bash
assist update
```

`assist update` updates assist, whether it was installed from npm or from a git clone.

When the sessions daemon is running, `assist update` restarts it so it loads the new build. Restart the web server yourself.
