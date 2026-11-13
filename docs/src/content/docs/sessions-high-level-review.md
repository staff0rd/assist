---
id: sessions-high-level-review
title: High-level review
group: Git and GitHub
order: 3
covers:
  - claude:review-high-level
  - claude:review-config
  - config:review.highLevel.criticalPaths
  - config:review.highLevel.uiPaths
  - config:review.highLevel.descriptionWordCap
  - config:review.highLevel.testPaths
  - config:review.highLevel.collapsedPaths
screenshots:
  - file: sessions-high-level-review.png
    alt: The high-level review checklist for a pull request
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
  - file: sessions-high-level-structure.png
    alt: The changed files of a pull request under the Structure item
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
      - click: text=Dark mode toggle on the settings page
      - click: "[role='tab']:has-text('Structure')"
  - file: sessions-high-level-checks.png
    alt: The Overview checks of a pull request, passing and failing
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
      - click: "[role='tab']:has-text('Checks')"
  - file: sessions-high-level-manual-testing.png
    alt: The manual testing steps of a pull request under Overview
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
      - click: "[role='tab']:has-text('Manual testing')"
  - file: sessions-high-level-start-fresh.png
    alt: The Start fresh button in the high-level review's footer
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
    highlight:
      - "button:has-text('Start fresh')"
  - file: sessions-high-level-critical-diffs.png
    alt: The full diff of a critical file under a slice's Critical diffs
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
      - click: text=Dark mode toggle on the settings page
      - click: "[role='tab']:has-text('Critical diffs')"
  - file: sessions-high-level-tests.png
    alt: A slice's changed tests under Tests, with one test's source shown
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
      - click: text=Remember the colour scheme
      - click: "[role='tab']:has-text('Tests')"
      - click: "[aria-label='Show the source of restores the saved scheme']"
  - file: sessions-high-level-slices.png
    alt: The slice rail with Overview, two slices with their line counts and tick dots, and Everything else
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
      - click: text=Dark mode toggle on the settings page
      - click: "[role='tabpanel'] input[type='checkbox']"
      - click: "[role='tab']:has-text('Tests')"
      - click: "[role='tabpanel'] input[type='checkbox']"
      - click: text=Remember the colour scheme
      - click: "[role='tabpanel'] input[type='checkbox']"
    crop:
      - "nav[aria-label='Slices'] > .rail-label"
      - "nav[aria-label='Slices'] > button:last-child"
    cropPadding: 16
---

A high-level review is a checklist for judging a pull request without reading every line: whether its description is reviewable, whether the shape of the change matches what it says it does, and whether the few files where a mistake is expensive are right. Use it alongside an [adversarial review](../sessions-pr-review/), which does read every line.

## Starting a review

Pick **High-level review** from a session's [**Review**](../sessions-pr-review/#choosing-a-review) menu, or ask an agent to `/review-high-level [number]` for the current branch's pull request or pull request `number`. The checklist opens in the session's [preview pane](../sessions-preview-panes/).

::screenshot{file="sessions-high-level-review.png"}

To get back to a review from the **Review** menu, pick **Open high-level review** while it's open, or **Reopen high-level review** after closing it.

## Slices

The agent first splits the pull request into slices, each one behaviour with its code, tests and wiring together, and puts whatever no slice claims in **Everything else**. It also writes steps for trying the change by hand. Reviewing the same commit again reuses them.

The rail on the left lists **Overview**, then each slice with its line counts and a dot for each item you've ticked. Pick an entry to see its items as tabs. **Next slice**, or :kbd[\[] and :kbd[\]], moves between entries on the same tab, and :kbd[1] to :kbd[9] pick a tab.

::screenshot{file="sessions-high-level-slices.png"}

## The checklist

**Overview** covers the whole pull request:

- **Checks** are worked out from the pull request itself and show whether they pass:
  - The description has a **What** and a **Why** section.
  - The description is under the word cap.
  - The pull request links the GitHub issue it resolves.
  - A UI change has a screenshot or video in the description.
  - The pull request has no merge conflicts.

::screenshot{file="sessions-high-level-checks.png"}

- **Manual testing** lists any setup, then numbered steps, each with what to do and what you should see. Links in a step open the page or the file on GitHub.

::screenshot{file="sessions-high-level-manual-testing.png"}

- **All files** shows every changed file as a tree with its line counts, each tagged with the slices it's in. Click a tag to go to that slice.
- **Backend PR** asks whether a change that needs backend work links the backend pull request.

Each slice has its own items, ticked and commented separately:

- **Structure** shows the slice's files and changes as a tree.

::screenshot{file="sessions-high-level-structure.png"}

- **Tests** lists the slice's changed tests by name, grouped by file and `describe`. Click a test to see its source.

::screenshot{file="sessions-high-level-tests.png"}

- **Critical diffs** shows the full diff of each critical file the slice changes.

::screenshot{file="sessions-high-level-critical-diffs.png"}

In **All files** and **Structure**, click a file to open its diff, or follow its link to the file on GitHub. **Expand all** and **Collapse all** open or close every diff, and typing a file name or glob, or picking a **Quick** glob, lets **Show** or **Hide** just the matching diffs. **Defaults** puts every diff back as it started.

## Commenting on code

Select lines in a diff, a test's source or the manual testing steps and type a note, then:

- **Send to agent** types it into the session.
- **Add to review** adds it to the comments posted with the review. Comments on lines in the pull request's diff are posted on those lines.

Comments added to the review are listed under **Queued for review** at the foot of the pane. Press ✎ on one to edit its note, or ✕ to remove it.

## Finishing

- **Approve**, **Comment** or **Request changes** posts your verdict to the pull request as a GitHub review, with your item comments, each slice's under its title, and queued comments. Unless you approve with no comments, what will be posted opens for approval first.
- **Close** posts nothing and keeps your ticks and comments, so reopening the review picks up where you left off.
- **Start fresh** discards this commit's ticks and comments and has the agent slice the pull request again.

::screenshot{file="sessions-high-level-start-fresh.png"}

Reopening a review of the same commit brings back its ticks and comments. Tick **Force re-run** in the **Review** menu to start again.

## Configuring the checklist

Ask an agent to `/review-config` and it proposes globs for the repo's critical, UI and collapsed files, with the files each one matches, for you to [approve or comment on](../sessions-preview-panes/#getting-your-approval) before they're saved. Or set them yourself:

```bash
assist config set review.highLevel.criticalPaths "**/*.graphql,src/i18n/*.json"
assist config set review.highLevel.uiPaths "src/ui/**"
assist config set review.highLevel.descriptionWordCap 300
assist config set review.highLevel.testPaths "**/*.test.ts,e2e/**/*.spec.ts"
assist config set review.highLevel.collapsedPaths "**/*.test.*,**/generated/**"
```

| Key                  | Default                            | Sets                                                                |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `criticalPaths`      | see below                          | Files whose full diffs **Critical diffs** shows                     |
| `uiPaths`            | none, so no screenshot is required | Files that make a change a UI change, needing a screenshot or video |
| `descriptionWordCap` | 300                                | The most words the description can have                             |
| `testPaths`          | `**/*.{test,spec}.{ts,tsx,js,jsx}` | Test files whose tests **Tests** lists                              |
| `collapsedPaths`     | `**/*.test.*`, `**/generated/**`   | Files whose diffs start collapsed under **Structure**               |

Unset, `criticalPaths` covers GitHub workflows and actions, `package.json`, Dockerfiles (`Dockerfile`, `Dockerfile.*`, `*.Dockerfile`) and `CLAUDE.md`, anywhere in the repo. Setting it replaces these, so list them too if you still want them.

From the command line, `assist review --high-level --configure` asks for each key in turn, suggesting globs for any that are unset.
