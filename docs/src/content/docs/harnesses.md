---
id: harnesses
title: Claude, Codex and Pi
group: Integrations
order: 0
covers:
  - config:harness.engine
  - config:harness.exposeCodexActions
  - config:harness.exposePiActions
  - config:harness.defaults.prompt.harness
  - config:harness.defaults.prompt.model
  - config:harness.defaults.draft.harness
  - config:harness.defaults.draft.model
  - config:harness.defaults.bug.harness
  - config:harness.defaults.bug.model
  - config:harness.defaults.design.harness
  - config:harness.defaults.design.model
  - config:harness.defaults.run.harness
  - config:harness.defaults.run.model
---

assist runs agents in a coding harness: Claude Code, the Codex CLI or pi. Claude is the default, and the others work wherever they're installed.

## Setting up Codex and pi

Install the harness, then run `assist sync`. It installs assist's slash commands into each harness it finds on your `PATH`, and the hooks that let read-only commands run without asking.

## Choosing a harness

The New session dialog's prompt mode, a backlog item's **Build** and **Refine**, each have a menu that runs them **with Codex** or **with pi** instead. On the CLI, `--harness <claude|codex|pi>` does the same for [`assist refine`](../launchers/) and `assist backlog run`.

To use another harness by default, set `harness.engine`:

```bash
assist config set harness.engine codex
```

To pick a harness, and a model on it, for one type of session, set `harness.defaults.<type>.harness` and `harness.defaults.<type>.model`, where `<type>` is `prompt`, `draft`, `bug` or `design` in the New session dialog, or `run` for backlog runs. A type with no harness set uses `harness.engine`, and one with no model uses the harness's own default:

```bash
assist config set harness.defaults.draft.harness codex
assist config set harness.defaults.run.model opus
```

## Hiding a harness

The **with Codex** and **with pi** menu entries show whenever that harness is installed. To hide them, turn the harness's key off:

```bash
assist config set harness.exposeCodexActions false
assist config set harness.exposePiActions false
```

To run Codex on a model served by your own proxy, see [LiteLLM](../litellm/).
