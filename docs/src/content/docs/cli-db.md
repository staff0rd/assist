---
id: cli-db
title: assist db
group: CLI
order: 32
covers:
  - cli:db status
  - cli:db drop-retired
  - cli:schema unlock
  - cli:schema confirm
---

[Getting started](../getting-started/) sets up the database and applies its migrations with `assist db migrate`.

## Commands

- `assist db status` prints whether the database matches this version of assist, is behind it and needs `assist db migrate`, or is ahead of it and assist needs updating.
- `assist db drop-retired` drops the tables of features assist no longer has, asking about each one first.

## Schema approval

These apply when working on assist itself, where an agent can't change the database schema without your approval.

- `assist schema unlock` :badge[internal] sends a pin to your desktop notifications, authorising schema changes for the session's backlog item phase, or for the Claude session when there is no item. Called by agents whose schema change was blocked.
- `assist schema confirm <pin>` :badge[internal] approves those schema changes. Called by agents whose schema change was blocked, with the pin you give them.
