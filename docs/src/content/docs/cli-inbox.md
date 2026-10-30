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

These commands find messages people sent you in Gmail and Slack that look like they need a reply.

- `assist inbox scan` checks your unread Gmail inbox, and your Slack DMs and @mentions since the last scan, and saves each message that needs a reply.
- `assist inbox list` prints the saved messages, newest first, with the sender, source, summary and link.

## Config

```bash
assist config set inbox.intervalMinutes 30
```

`inbox.intervalMinutes` makes this machine's daemon run `assist inbox scan` on that interval, one scan at a time, and log each run to `daemon.log`. It is read only from this machine's `~/.assist.yml`, so a repo's `assist.yml` or a shared override can't turn it on. Scheduled scans are off while it is unset. Restart the daemon after changing it.
