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
  - route:/updates
screenshots:
  - file: updates-panel.png
    alt: The Updates panel
    route: /updates
---

## Automatic updates

When assist is installed from a git clone, it keeps itself up to date in the background. When the clone's upstream gets new commits, assist pulls and installs them.

If the clone has local commits and cannot fast-forward, assist starts a Claude session in it to rebase or merge onto the upstream, push and rebuild. Updates pause until that session closes.

To turn automatic updates off:

```bash
assist config set autoUpdate.enabled false
```

A global npm install is not updated automatically.

## The Updates page

The Updates page opens from the version badge in the dashboard's [status bar](../sessions-overview/#the-status-bar), or with :kbd[Alt+Q]. It lists this node and each [linked node](../sessions-linked-nodes/), with the version each is running and where its updates are up to.

::screenshot{file="updates-panel.png"}

- **Restart** on a row restarts that node's daemon and web server onto the new build it has ready. **Restart ready nodes** restarts every node with one ready.
- **Check now** checks every node for new commits straight away.
- **Auto-restart** on a row (`autoUpdate.restart`) has that node restart onto a ready build by itself once every agent session on it has been waiting on you for a minute, or there are none.
- **Pause** stops a node pulling updates until you **Resume** it.
- **Open fix session** jumps to the session fixing a clone that couldn't fast-forward.
- Expand a row for that node's update history.

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
