---
id: github-issues
title: GitHub issues
group: Git and GitHub
order: 6
covers:
  - claude:github
---

Run `/github` in a session to work with a GitHub issue. Name an issue as `owner/repo#number` or by its URL. When you leave it out, the issue linked to the session's [backlog item](../backlog/) is used.

| Command                          | Does                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `/github <issue>`                | Opens the issue's description in the [preview pane](../sessions-preview-panes/) to rework |
| `/github view [issue]`           | Shows the issue in the session                                                            |
| `/github create [request]`       | Writes and files a new issue                                                              |
| `/github associate <issue> [id]` | Links the issue to a backlog item, the session's own by default                           |
| `/github update [issue]`         | Comments on the issue with a summary of the session's work                                |
| `/github started [issue]`        | Assigns the issue to you and moves it to In Progress on its project boards                |
| `/github done [issue]`           | Closes the issue                                                                          |
| `/github help`                   | Lists these                                                                               |

Every change to an issue opens in the preview pane for your approval. Drop or paste screenshots onto the pane to attach them, or ask the agent to add one.

## Creating an issue

Run `/github create` and the agent writes the issue from what the session has been discussing, or from what you type after it. Name the repo, labels, milestone or project in plain words, such as `/github create bug against acme/web, Sprint 3 milestone, Roadmap project`.

## Project boards

Adding an issue to a project, and moving it to In Progress, need your GitHub CLI to have the project scope:

```bash
gh auth refresh -h github.com -s project
```
