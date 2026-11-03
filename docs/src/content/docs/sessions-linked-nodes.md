---
id: sessions-linked-nodes
title: Linked nodes
group: Sessions
order: 10
covers:
  - config:sessions.nodeName
  - config:sessions.tailscaleServe
  - config:sessions.linkVersionCheck
screenshots:
  - file: sessions-machine-picker.png
    alt: The node picker listing this node and a linked one, with a session from the linked node in the sidebar
    route: /sessions
    scene: linked
    waitFor: text=Rate limit public API
    viewport:
      width: 1280
      height: 560
    actions:
      - click: "[aria-label='Node']"
  - file: sessions-transfer.png
    alt: The Transfer menu on a backlog run's top bar, listing a linked node to move the run to
    route: /sessions
    scene: backlog
    setup:
      - peer: desktop
      - assistSession: [backlog, run, a1]
    waitFor: text=Dark mode toggle
    viewport:
      width: 1440
      height: 480
    actions:
      - click: text=Dark mode toggle
      - click: "button:has-text('Transfer')"
---

Each assist install is a node, with its own daemon, web server, sessions and repos. When one node links to another, its dashboard shows the other node's sessions alongside its own, and you can start, watch and drive sessions on either node from one browser tab. To link nodes, ask an agent to link them.

A link works in one direction. To see both nodes from either node's dashboard, link each one to the other.

## Naming a node

A node's name labels its sessions on every node that links to it. It defaults to the hostname, with `-wsl` added under WSL. To change it:

```bash
assist config set sessions.nodeName laptop
```

A link must use the peer's node name, so if you rename a node, re-link it on every node that links to it.

## Picking a node

Once a link exists, the toolbar shows a node picker. The node you pick is the one the toolbar's PR and run menus, the history list, and views like Backlog and Config work against. Each entry shows the link's state, the peer's version and a **behind** chip when that node runs an older assist.

::screenshot{file="sessions-machine-picker.png"}

The New session dialog has its own **Node** choice for where the session runs. Cards for sessions on a linked node carry a badge naming that node, such as :badge[node]. To move a backlog run that started on the wrong node, use **Transfer** on its [top bar](../sessions-session-area/#the-top-bar).

::screenshot{file="sessions-transfer.png"}

## Restarting and updating a linked node

With a linked node picked, the dashboard menu's **Restart** and **Update assist** items act on that node, and its row on the [Updates panel](../updating/#automatic-updates) has the same actions.

## Linking over Tailscale

To link nodes over Tailscale, turn on MagicDNS and HTTPS certificates in your tailnet's admin console. Each web server then makes its port available on the tailnet when it starts. To keep a node off the tailnet:

```bash
assist config set sessions.tailscaleServe false
```

## Mismatched versions

When two linked nodes' assist versions are too far apart to talk to each other, the link stays blocked until you update the older one. To connect anyway, set `warn`. To skip the check entirely, set `off`:

```bash
assist config set sessions.linkVersionCheck warn
```
