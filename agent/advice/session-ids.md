---
title: Session IDs
when: always
---

When the user names a session by number ("session 40", or a bare session number), it is an ID from `assist sessions list`, not anything `ListAgents` shows. Run `assist sessions list`, find that ID's row, and use its AGENT column as the SendMessage `to` name, or pass the ID directly to `assist sessions send`, `assist sessions output` or `assist sessions previews`.
