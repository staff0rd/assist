---
id: cli-run
title: assist run
group: CLI
order: 15
covers:
  - cli:run list
  - cli:run link
  - cli:run remove
---

[Run commands](../run-commands/) are added with `assist run add` and run with `assist run <name>`.

## Commands

- `assist run list` lists the repo's run commands. `-v` shows each one's full command, every property it sets and where it is defined: your global config, the project's `assist.yml` or the database. `--json` prints them as JSON.
- `assist run remove <name>` removes a run command from `assist.yml`. `--repo [name]` removes it from a repo's entry in the database instead.
- `assist run link <path> --prefix <prefix>` makes the run commands in another project's `assist.yml` runnable from this one, named `<prefix>:<name>`. `path` is relative to this repo's `assist.yml`.

  ```bash
  assist run link ../api --prefix api
  assist run api:dev
  ```
