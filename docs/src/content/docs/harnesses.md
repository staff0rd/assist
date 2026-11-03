---
id: harnesses
title: Claude, Codex and Pi
group: Integrations
order: 0
covers:
  - config:harness.engine
  - config:harness.exposeCodexActions
  - config:harness.exposePiActions
---

assist runs agents in a coding harness: Claude Code, the Codex CLI or pi. Claude is the default, and the others work wherever they're installed.

## Setting up Codex and pi

Install the harness, then run `assist sync`. It installs assist's slash commands into each harness it finds on your `PATH`, and the hooks that let read-only commands run without asking.

Codex asks you to trust assist's hook the first time it runs on a node.

## Choosing a harness

The New session dialog's prompt mode, a backlog item's **Build** and **Refine**, each have a menu that runs them **with Codex** or **with pi** instead. On the CLI, `--harness <claude|codex|pi>` does the same for [`assist refine`](../launchers/) and `assist backlog run`.

To use another harness by default, set `harness.engine`:

```bash
assist config set harness.engine codex
```

## Hiding a harness

The **with Codex** and **with pi** menu entries show whenever that harness is installed. To hide them, turn the harness's key off:

```bash
assist config set harness.exposeCodexActions false
assist config set harness.exposePiActions false
```

To run Codex on a model served by your own proxy, see [LiteLLM](../litellm/).
