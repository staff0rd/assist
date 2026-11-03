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
  - config:review.highLevel.slices
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
      - click: "[aria-label^='Structure']"
  - file: sessions-high-level-critical-diffs.png
    alt: The full diff of a critical file under the Critical diffs item
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
      - click: "[aria-label^='Critical diffs']"
    crop: "#high-level-check-critical-diffs-correct"
    cropPadding: 16
  - file: sessions-high-level-tests.png
    alt: The changed tests of a pull request under the Tests item, with one test's source shown
    route: /sessions
    scene: high-level-review
    waitFor: text=Description has a What and a Why
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=High-level review #14
      - click: "[aria-label='Fill the window with preview']"
      - click: "[aria-label^='Tests']"
      - click: "[aria-label='Show the source of restores the saved scheme']"
    crop: "#high-level-check-tests-worth-having"
    cropPadding: 16
---

A high-level review is a checklist for judging a pull request without reading every line: whether its description is reviewable, whether the shape of the change matches what it says it does, and whether the few files where a mistake is expensive are right. Use it alongside an [adversarial review](../sessions-pr-review/), which does read every line.

## Starting a review

Pick **High-level review** from a session's [**Review**](../sessions-pr-review/#choosing-a-review) menu, or ask an agent to `/review-high-level [number]` for the current branch's pull request or pull request `number`. The checklist opens in the session's [preview pane](../sessions-preview-panes/).

::screenshot{file="sessions-high-level-review.png"}

To get back to a review from the **Review** menu, pick **Open high-level review** while it's open, or **Reopen high-level review** after closing it.

## The checklist

The first items are checked from the pull request itself and show whether they pass:

- The description has a **What** and a **Why** section.
- The description is under the word cap.
- The pull request links the GitHub issue it resolves.
- A UI change has a screenshot or video in the description.
- The pull request has no merge conflicts.

You tick the rest yourself, each with what you need to judge it:

- **Structure** shows the changed files as a tree with their line counts. Click a file to open its diff, or follow its link to the file on GitHub. **Expand all** and **Collapse all** open or close every diff, and typing a file name or glob, or picking a **Quick** glob, lets **Show** or **Hide** just the matching diffs. **Defaults** puts every diff back as it started.

::screenshot{file="sessions-high-level-structure.png"}

- **Critical diffs** shows the full diff of every changed critical file.

::screenshot{file="sessions-high-level-critical-diffs.png"}

- **Tests** lists the changed tests by name, grouped by file and `describe`. Click a test to see its source.

::screenshot{file="sessions-high-level-tests.png"}

- **Backend PR** asks whether a change that needs backend work links the backend pull request.

## Commenting on code

Select lines in a diff or a test's source and type a note, then:

- **Send to agent** types it into the session.
- **Add to review** adds it to the comments posted with the review. Comments on lines in the pull request's diff are posted on those lines.

## Finishing

- **Approve**, **Comment** or **Request changes** posts your verdict to the pull request as a GitHub review, with your item comments and queued comments. Unless you approve with no comments, what will be posted opens for approval first.
- **Close** posts nothing and keeps your ticks and comments, so reopening the review picks up where you left off.

Reopening a review of the same commit brings back its ticks and comments. Tick **Force re-run** in the **Review** menu to start again.

## Configuring the checklist

Ask an agent to `/review-config` and it proposes globs for the repo's critical, UI and collapsed files, with the files each one matches, for you to [approve or comment on](../sessions-preview-panes/#getting-your-approval) before they're saved. Or set them yourself:

```bash
assist config set review.highLevel.criticalPaths "**/*.graphql,src/i18n/*.json"
assist config set review.highLevel.uiPaths "src/ui/**"
assist config set review.highLevel.descriptionWordCap 300
assist config set review.highLevel.testPaths "**/*.test.ts,e2e/**/*.spec.ts"
assist config set review.highLevel.collapsedPaths "**/*.test.*,**/generated/**"
assist config set review.highLevel.slices true
```

| Key                  | Default                            | Sets                                                                                                                            |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `criticalPaths`      | see below                          | Files whose full diffs **Critical diffs** shows                                                                                 |
| `uiPaths`            | none, so no screenshot is required | Files that make a change a UI change, needing a screenshot or video                                                             |
| `descriptionWordCap` | 300                                | The most words the description can have                                                                                         |
| `testPaths`          | `**/*.{test,spec}.{ts,tsx,js,jsx}` | Test files whose tests **Tests** lists                                                                                          |
| `collapsedPaths`     | `**/*.test.*`, `**/generated/**`   | Files whose diffs start collapsed under **Structure**                                                                           |
| `slices`             | `false`                            | Experimental: in a dashboard session, the agent splits the pull request into slices and **Structure** groups its files by slice |

Unset, `criticalPaths` covers GitHub workflows and actions, `package.json`, Dockerfiles (`Dockerfile`, `Dockerfile.*`, `*.Dockerfile`) and `CLAUDE.md`, anywhere in the repo. Setting it replaces these, so list them too if you still want them.

From the command line, `assist review --high-level --configure` asks for each key in turn, suggesting globs for any that are unset.
