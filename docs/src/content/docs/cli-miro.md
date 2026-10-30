---
id: cli-miro
title: assist miro
group: CLI
order: 25
covers:
  - cli:miro extract
---

See [Miro](../miro/) for extracting from a board with `/miro`, which also fetches the board for you.

## Commands

- `assist miro extract <name>` extracts a saved selection again, from its board items file, and prints the boxes' text as a YAML list.
- `assist miro extract --items <file>` extracts from a file of board items fetched through Miro's connector. With no corner boxes given, the board opens in the [preview pane](../sessions-preview-panes/) for you to click them.
  - `--top-left <id>` and `--bottom-right <id>` name the corner boxes by widget id or by a **Copy link to object** link.
  - `--ignore <file>` leaves out the box texts listed in a YAML file.
  - `--out <file>` writes the list to a file, headed by where it came from, with `--board <id>` and `--frame <id>` to name them when the items don't.
  - `--save <name>` saves the selection to `miro.extracts` under that name. It goes in the repo's `assist.yml`; `--node` saves it to `~/.assist.yml` instead, and `-r [repo]` to a repo's entry in the database.
