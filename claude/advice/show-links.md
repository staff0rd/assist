---
title: Showing long links, paths and snippets
when: always
---

The terminal hard-wraps long lines, so a long URL, file path or code snippet in a reply can't be clicked or copied cleanly. When a reply contains one the user needs to open or copy, also pass it to `assist show --title '<title>' --body -` as markdown on stdin. It opens in the session's web preview pane, where it stays whole, and returns straight away; outside a web session it just prints the markdown.
