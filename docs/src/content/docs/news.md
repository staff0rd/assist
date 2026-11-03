---
id: news
title: News
group: Activity
order: 2
covers:
  - route:/news
  - config:news.showInNav
  - config:news.feeds
screenshots:
  - file: news.png
    alt: The News page, listing AI news posts from two feeds under date headings
    route: /news
    scene: news
    waitFor: text=Coding agents now run for hours without a check-in
    viewport:
      width: 1440
      height: 900
---

Waiting on agents can be boring, and the **News** page gives you something to read in the meantime, like the latest in AI. It collects posts from the RSS and Atom feeds you've added, newest first. Click a post to open it.

::screenshot{file="news.png"}

The feeds are the `news.feeds` config key. It's stored in the assist database rather than `assist.yml`, so every node sharing that database sees the same feeds. Edit it on the [Config](../config/) page, or set the whole list at once:

```bash
assist config set news.feeds https://example.com/feed.xml,https://blog.example.org/rss
```

Or add, list and remove one at a time with [`assist news`](../cli-news/). `assist config unset news.feeds` removes them all.

The page is always at `/news`. To also show a **News** tab in the toolbar:

```bash
assist config set news.showInNav true
```
