---
id: cli-releases
title: assist releases
group: CLI
order: 10
covers:
  - cli:releases
  - cli:releases list
  - cli:releases configure
---

## Commands

- `assist releases` or `assist releases list` prints the repo's release streams, each with its workflow, nodes and edges, as drawn by the [Releases](../releases/) page.
- `assist releases configure --streams <file|-> [--scope git|db]` :badge[internal] checks a JSON or YAML list of streams and saves it to `releases.streams`, replacing the streams for the same repos. `git` saves to repo (git), the repo's `assist.yml`, and `db` to repo (db), only for you. Called by `/releases-configure`.
