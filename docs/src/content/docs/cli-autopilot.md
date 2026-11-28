---
id: cli-autopilot
title: assist autopilot
group: CLI
order: 36
covers:
  - cli:autopilot status
  - cli:autopilot last-run
  - cli:autopilot follow-up
  - cli:autopilot summary
---

[Autopilot](../autopilot/) starts a session in a repo on a schedule.

## Commands

- `assist autopilot status` :badge[internal] prints each autopilot repo's schedule: its state, interval and next and last run. Called by `/autopilot`.
- `assist autopilot last-run` :badge[internal] prints this repo's last finished run: its summary and the backlog items it started. Called by `/autopilot`.
- `assist autopilot follow-up <duration>` :badge[internal], from an autopilot session, sets the next run to start after `<duration>`, such as `30m` or `2h`, instead of at the interval. Called by `/autopilot`.
- `assist autopilot summary` :badge[internal], from an autopilot session, records what the run checked, decided and started, and what the next run should do (`--checked`, `--decided`, `--started`, `--next`) for the run's summary. Called by `/autopilot`.
