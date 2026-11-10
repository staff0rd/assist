---
id: cli-review
title: assist review
group: CLI
order: 7
covers:
  - cli:review
  - config:review.synthesisHarness
---

## Commands

- `assist review [number]` :badge[internal] [reviews](../sessions-pr-review/) the current branch's pull request, or checks out pull request `number` first. Called by the Review menu.
  - `--refine`, `--apply` and `--high-level` match the menu's modes, and `--no-prompt --submit` matches **Review & post**.
  - `--submit` answers yes to posting by default, and `--no-prompt` skips every question.
  - `--backlog` files the findings as one [backlog](../backlog/) bug, with a phase per finding, instead of posting them.
  - `--force`, `--address-comments` and `--announce` match the menu's options.
  - `--checkout-only` checks the pull request out and leaves an idle agent in it, without reviewing.
  - `--verbose` prints a line per step instead of spinners.

## Config

`review.synthesisHarness` picks the harness, `claude` (the default) or `codex`, that combines the Claude and Codex reviews into one set of findings:

```bash
assist config set review.synthesisHarness codex
```
