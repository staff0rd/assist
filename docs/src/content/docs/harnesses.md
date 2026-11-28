---
id: harnesses
title: Claude, Codex and Pi
group: Integrations
order: 0
covers:
  - config:harness.engine
  - config:harness.exposeCodexActions
  - config:harness.exposePiActions
  - config:harness.claudeSdkChrome
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

assist runs agents in a coding harness: Claude Code, Claude (SDK), the Codex CLI, Codex (SDK) or pi. Claude is the default, and the others work wherever they're installed.

## Setting up Codex and pi

Install the harness, then run `assist sync`. It installs assist's slash commands into each harness it finds on your `PATH`, and the hooks that let read-only commands run without asking.

## Claude (SDK)

Claude (SDK) runs your installed, signed-in Claude Code without a terminal: the session shows its [transcript and a composer](../sessions-session-area/#sdk-sessions) instead. It always runs in auto permission mode, so it never stops to ask permission. Pick it as the harness when starting a session, or make it the default with `assist config set harness.engine claude-sdk`. Signed in with a Claude plan, it uses the same plan usage limits as Claude Code. It starts with Claude in Chrome enabled; to turn that off:

```bash
assist config set harness.claudeSdkChrome false
```

## Codex (SDK)

Codex (SDK) does the same for your installed Codex CLI: the session shows its [transcript and a composer](../sessions-session-area/#sdk-sessions), and its usage counts against your Codex limits. Pick it as the harness when starting a session, or make it the default with `assist config set harness.engine codex-sdk`.

## Choosing a harness

Actions that start an agent offer **with Codex** or **with pi** wherever that harness can run them. On the CLI, every command that starts an agent takes `--harness <claude|claude-sdk|codex|codex-sdk|pi>`.

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

The **with Codex** and **with pi** menu entries show whenever that harness is installed and can run that action. To hide them, turn the harness's key off:

```bash
assist config set harness.exposeCodexActions false
assist config set harness.exposePiActions false
```

To run Codex on a model served by your own proxy, see [LiteLLM](../litellm/).
