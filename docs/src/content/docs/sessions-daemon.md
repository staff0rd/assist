---
id: sessions-daemon
title: The sessions daemon
group: Sessions
order: 7
covers:
  - config:sessions.maxLive
---

## Where sessions live

Sessions belong to a background daemon, not the web server or the browser tab. Closing the tab or restarting the web server leaves every session running with its scrollback, and any number of browser tabs can watch the same sessions.

## Restarting it

When a new build is ready, **Restart** on the [Nodes page](../updating/#the-nodes-page) restarts the daemon. Claude sessions carry on their conversations, with fresh scrollback; run sessions come back as not-restored cards you can retry. To check on, stop or clear out the daemon, use [`assist daemon`](../cli-daemon/).

## Session limit

One daemon holds at most 24 live sessions, and starting another past that is refused. A restart also brings back at most that many. Change the ceiling with:

```bash
assist config set sessions.maxLive 32
```
