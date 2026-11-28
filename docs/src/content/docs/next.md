---
id: next
title: Next
group: Activity
order: 0
covers:
  - route:/next
  - config:next.repos
  - config:next.peers
  - config:next.projects
  - config:next.pickStatuses
  - config:next.excludeLabels
  - config:next.excludeTypes
  - config:next.repoRules
screenshots:
  - file: next.png
    alt: The Next page, recommending a pull request to review, above groups of peer pull requests, your own pull requests, assigned issues and project items to pick up
    route: /next
    scene: next
    waitFor: text=Your next best action
    viewport:
      width: 1440
      height: 1200
---

The **Next** tab (:kbd[Alt+3]) gathers what's waiting on you on GitHub for the selected repo: pull requests to review, your own open pull requests, issues assigned to you and project items ready to pick up. It reads them with the GitHub CLI, so `gh` must be signed in.

## The page

::screenshot{file="next.png"}

**Your next best action** at the top is the item to deal with first, with the reason it was chosen. The rest are grouped below:

- **Review** — pull requests waiting on your review.
- **Yours** — your own open pull requests.
- **Assigned** — open issues assigned to you.
- **Pick up** — unassigned items on your GitHub Projects that are ready to start.

**Refresh** reads GitHub again, and **Next settings** opens the [Config](../config/) page at the `next` settings.

## Acting on an item

- **Session** buttons jump to sessions already working on the item.
- **Start session** starts work on it in your local clone of its repo:
  - On a pull request, it opens the review dialog. Pick a review mode, or check the pull request out, address its comments or fix its conflicts. See [Reviewing pull requests](../sessions-pr-review/).
  - On an assigned issue, it opens the [new-session dialog](../sessions-creating/) with the issue filled in.
  - On a project item, it assigns the issue to you, moves it to **In Progress** on its project, then opens the new-session dialog with the issue filled in.
- **GitHub** opens the item on GitHub.

## Choosing what's listed

`next.repos` sets the repos whose pull requests and issues are listed. Name a repo as `owner/name`, or a bare owner for all of its repos. It defaults to the selected repo.

```bash
assist config set next.repos my-org,other-org/web
```

Without `next.peers`, **Review** lists only pull requests that request your review. Add teammates to `next.peers` to also list their open pull requests until you approve them.

```bash
assist config set next.peers alice,bob
```

To stop listing a repo's pull requests for your review once others have approved them, set `hideReviewAfterApprovals` for it in `next.repoRules`, keyed by `owner/name` or a bare owner:

```bash
assist config set next.repoRules.my-org/web.hideReviewAfterApprovals 1
```

`next.projects` names the GitHub Projects that **Pick up** reads, as `owner/number` from each project's URL. Reading projects needs the `project` scope on your `gh` token:

```bash
assist config set next.projects my-org/3,my-org/5
gh auth refresh -h github.com -s project
```

Narrow which project items are offered:

```bash
assist config set next.pickStatuses Ready,Todo
assist config set next.excludeLabels blocked,spike
assist config set next.excludeTypes Epic
```

`next.pickStatuses` lists the project **Status** values an item must have, and defaults to `Ready` and `Todo`. `next.excludeLabels` and `next.excludeTypes` skip items with those labels or issue types.
