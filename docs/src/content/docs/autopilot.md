---
id: autopilot
title: Autopilot
group: Backlog
order: 4
covers:
  - route:/autopilot
  - claude:autopilot
  - config:autopilot.intervalMinutes
  - config:autopilot.prompt
  - config:autopilot.node
  - config:autopilot.context
  - config:autopilot.statusCommand
---

Autopilot starts a session in a repo on a schedule, with a prompt such as `/autopilot`, which judges the last run and takes the one next step.

## Setting it up

The schedule runs once `autopilot.intervalMinutes`, `autopilot.prompt` and `autopilot.node` are all set for the repo:

```bash
assist config set autopilot.intervalMinutes 60
assist config set autopilot.prompt /autopilot
assist config set autopilot.node laptop
```

`autopilot.node` names the one node whose daemon runs the schedule. `/autopilot` reads the files listed in `autopilot.context` at the start of each run, and the output of `autopilot.statusCommand` as the repo's current state:

```bash
assist config set autopilot.context CLAUDE.md,docs/strategy.md
assist config set autopilot.statusCommand "pnpm status"
```

## The Autopilot page

Once a repo has a schedule, an **Autopilot** tab appears after **Next**. It shows the schedule, the live run and past runs with what each one checked, decided and started. **Run now** starts a run straight away, **Pause** and **Resume** hold and restart the schedule, and **Stop** ends the live run.
