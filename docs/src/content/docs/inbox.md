---
id: inbox
title: Inbox
group: Activity
order: 5
covers:
  - route:/inbox
screenshots:
  - file: inbox.png
    alt: The Inbox page, listing Gmail and Slack messages that need a reply with their sender, source and summary
    route: /inbox
    scene: inbox
    waitFor: text=Last scanned
    viewport:
      width: 1440
      height: 640
---

The **Inbox** page lists messages people sent you in Gmail and Slack that look like they need a reply, newest first. Each shows who sent it, where it came from and a short summary. The tab counts them.

::screenshot{file="inbox.png"}

- Click a message to open it in Gmail or Slack.
- Click its **×** to dismiss it once you've dealt with it. A dismissed message doesn't come back.
- Click **Scan now** to check for new messages. To scan on a schedule, set [`inbox.intervalMinutes`](../cli-inbox/#config).
