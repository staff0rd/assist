---
id: cli-inbox
title: assist inbox
group: CLI
order: 34
covers:
  - cli:inbox scan
  - cli:inbox list
  - config:inbox.intervalMinutes
---

## Commands

These commands find messages people sent you in Gmail and Slack that look like they need a reply. The [Inbox](../inbox/) page shows the same messages.

- `assist inbox scan` checks your unread Gmail inbox, and your Slack DMs and @mentions since the last scan, and saves each message that needs a reply.
- `assist inbox list` prints the saved messages, newest first, with the sender, source, summary and link.

## Config

```bash
assist config set inbox.intervalMinutes 30 --node
```

`inbox.intervalMinutes` makes this machine's daemon scan on that interval, timed from the last scan, and log each run to `daemon.log`. It is read only from this machine's `~/.assist.yml`, so a repo's `assist.yml` or a shared override can't turn it on. Scheduled scans are off while it is unset.
