---
id: sessions-diff
title: Diff and file views
group: Sessions
order: 8
covers:
  - config:sessions.includeCommittedChanges
  - route:/diff
  - route:/file
screenshots:
  - file: sessions-diff-panel.png
    alt: A session's diff filling the session area
    route: /sessions
    scene: diff
    waitFor: text=Dark mode toggle
    viewport:
      width: 1440
      height: 640
    actions:
      - click: text=Dark mode toggle
      - press: Alt+D
      - click: "[aria-label='Unified view']"
      - click: "[aria-label='Fill the window with diff']"
      - click: text=README.md
    highlight:
      - "[data-testid='git-status-counts']"
  - file: sessions-diff-comment.png
    alt: A comment on lines selected in the diff
    route: /sessions
    scene: diff
    waitFor: text=Dark mode toggle
    viewport:
      width: 1440
      height: 800
    actions:
      - click: text=Dark mode toggle
      - press: Alt+D
      - click: "[aria-label='Unified view']"
      - click: "[aria-label='Fill the window with diff']"
      - click: text=useColourScheme.ts
      - drag:
          from: text=document.documentElement.dataset.scheme = scheme;
          to: text=document.documentElement.dataset.scheme = scheme;
      - type: Also set the color-scheme CSS property so native controls match
  - file: sessions-file-picker.png
    alt: The file picker searching the repo
    route: /sessions
    scene: diff
    waitFor: text=Dark mode toggle
    viewport:
      width: 1280
      height: 560
    actions:
      - click: text=Dark mode toggle
      - press: ControlOrMeta+P
---

The diff shows what a session has changed in its working copy, so you can review it, comment on it and revert parts of it while the agent works. The file view opens any file in the repo in an editor.

## Opening the diff

Click the change counts on a session's card or in its [top bar](../sessions-session-area/#the-top-bar), or press :kbd[Alt+D], to open the diff beside the terminal. Click the counts or press :kbd[Alt+D] again to close it.

::screenshot{file="sessions-diff-panel.png"}

The counts are new (`+`), modified (`~`) and deleted (`-`) files. When the session has committed some of its work, a second, bracketed group follows with just the uncommitted files; click it to open the diff at **Uncommitted**. A session with no changes on a branch other than the default branch shows **vs main** instead, which opens the diff against the default branch.

The toolbar's :icon[OpenInFull] **Fill the window with diff** button hides the terminal, and :icon[CloseFullscreen] **Show terminal beside diff** brings it back.

## Choosing what to compare

The scope picker at the left of the toolbar chooses what the diff covers:

| Scope       | Shows                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| All changes | Every commit made for the session's backlog item, from any of its phases, plus the uncommitted changes |
| Uncommitted | Changes since the last commit                                                                          |
| Branch      | The branch against the default branch, listed when there is one to compare                             |
| _A commit_  | One commit made for the session's backlog item                                                         |

New files are included in every scope except a single commit. A session with no backlog item has only uncommitted changes under **All changes**.

To leave the backlog item's commits out of **All changes**, the card counts and the scope picker, so they show only uncommitted changes:

```bash
assist config set sessions.includeCommittedChanges false
```

## Reading the diff

- The file tree on the left lists the changed files with their line counts. Click a file to jump to it. The tree button at the left of the toolbar hides or shows it.
- **Filter files by name** narrows the diff to matching paths; :kbd[Esc] clears it. **Filter by change type** shows only modified, added, removed or renamed files.
- Click a file's header to collapse it, or use **Collapse all files** and **Expand all files**.
- **Unified view** and **Split view** switch the layout. The choice is remembered.
- A markdown file's **Preview** button shows it rendered.

## Commenting

Drag across the text in the diff to select it, then type a note and press :kbd[Enter] (:kbd[Shift+Enter] for a new line) or click **Send to agent**. The comment, quoting the selected lines with their file and line numbers, is typed straight into the session for the agent to act on.

::screenshot{file="sessions-diff-comment.png"}

The comment box also offers:

- **Cite a broken rule** lists the repo's [rules](../rules/) that apply to the file. Clicking one asks the agent to fix the quoted text so it follows that rule.
- **Add rule** asks the agent to capture your note as a new [rule](../rules/) for the repo.
- **Copy quote** copies the selected text.

## Reverting

On the **Uncommitted** scope, hover a row in the file tree to revert it:

- **Revert file** discards the file's uncommitted changes, or deletes it if it is new.
- **Revert folder** does the same for every changed file in the folder.
- **Revert all files**, on the tree's header, does it for every file listed, so a filter limits what it reverts.

## The file view

Press :kbd[Mod+P] and pick a file to open it in the file view.

::screenshot{file="sessions-file-picker.png"}

- Edit a file and press :kbd[Mod+S] or click **Save**.
- A markdown file has **Raw** and **Rendered** modes. In **Rendered**, select text to [comment](#commenting) on it to the session selected in the sidebar.
