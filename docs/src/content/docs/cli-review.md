---
id: cli-review
title: assist review
group: CLI
order: 7
covers:
  - cli:review
  - config:review.synthesisHarness
  - cli:review instance
  - config:review.instance.composeFile
  - config:review.instance.services
  - config:review.instance.entry.service
  - config:review.instance.entry.path
---

## Commands

- `assist review [number]` :badge[internal] [reviews](../sessions-pr-review/) the current branch's pull request, or checks out pull request `number` first. Called by the Review menu.
  - `--refine`, `--apply` and `--high-level` match the menu's modes, and `--no-prompt --submit` matches **Review & post**.
  - `--submit` answers yes to posting by default, and `--no-prompt` skips every question.
  - `--backlog` files the findings as one [backlog](../backlog/) bug, with a phase per finding, instead of posting them.
  - `--force`, `--address-comments` and `--announce` match the menu's options.
  - `--reuse-slices`, with `--high-level`, reopens the review from the slices saved for the pull request's current head without slicing again, matching **Reopen high-level review**.
  - `--checkout-only` checks the pull request out and leaves an idle agent in it, without reviewing.
  - `--verbose` prints a line per step instead of spinners.

- `assist review instance <pr>` :badge[internal] brings pull request `<pr>` up as a throwaway instance from the repo's review compose file, has an agent try the manual testing steps saved by its [high-level review](../sessions-high-level-review/) in a browser, and prints a pass, fail or unsure verdict for each step, with screenshots and a video, before tearing the instance down. `--headed` shows the browser instead of recording it, and `--keep` leaves the instance up. Called by agents trying a pull request's manual testing steps.

## Config

`review.instance.composeFile` names the compose file, relative to the repo root, that `review instance` brings a pull request up with. Each service in `review.instance.services` gets the pull request's checkout, and one with a `port` (the port it listens on in its container) gets a free host port. `review.instance.entry.service` and `review.instance.entry.path` pick the service and path printed as the instance's URL:

```bash
assist config set review.instance.composeFile docker-compose.review.yml
assist config set review.instance.services.web.port 3000
assist config set review.instance.entry.service web
assist config set review.instance.entry.path /app
```

`review.synthesisHarness` picks the harness, `claude` (the default) or `codex`, that combines the Claude and Codex reviews into one set of findings:

```bash
assist config set review.synthesisHarness codex
```
