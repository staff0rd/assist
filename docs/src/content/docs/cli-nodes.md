---
id: cli-nodes
title: assist sessions nodes
group: CLI
order: 6
covers:
  - cli:sessions nodes
  - cli:sessions nodes link
  - cli:sessions nodes unlink
  - cli:sessions nodes doctor
  - cli:sessions nodes logs
  - cli:sessions nodes restart
  - cli:sessions nodes update
  - config:sessions.links
---

These manage [links to other nodes](../sessions-linked-nodes/). A link's name must match the peer's `sessions.nodeName`, and links are saved in `sessions.links`.

## Commands

- `assist sessions nodes` :badge[internal] lists this node and each linked node with its link state. `--json` prints the same as JSON. Called by agents managing linked nodes.
- `assist sessions nodes link <name> --tailscale <host> --port <port>` :badge[internal] links a peer over [Tailscale](../sessions-linked-nodes/#linking-over-tailscale) by its Tailscale machine name and web server port. `assist sessions nodes link <name> <url>` links a peer at any URL that reaches its web server. Called by agents managing linked nodes.
- `assist sessions nodes unlink <name>` :badge[internal] removes a link. Called by agents managing linked nodes.
- `assist sessions nodes doctor [name]` :badge[internal] checks each step of every link, or just one, and stops at the first that fails with what to do about it. `--json` prints the result as JSON. Called by agents managing linked nodes.
- `assist sessions nodes logs <name>` :badge[internal] prints a linked node's daemon log (`-n <lines>`, default 200). `--json` prints the result as JSON. Called by agents managing linked nodes.
- `assist sessions nodes restart <name>` :badge[internal] restarts a linked node's daemon and web server, waits for the link to reconnect and prints its version. `--target daemon` or `--target webserver` restarts just one. Called by agents managing linked nodes.
- `assist sessions nodes update <name>` :badge[internal] runs `assist update` on a linked node, restarts it, waits for the link to reconnect and prints its version. Called by agents managing linked nodes.
