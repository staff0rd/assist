---
id: review-comments
title: Address Comments
group: Git and GitHub
order: 4
covers:
  - claude:review-pr-comments
  - claude:comment
  - claude:forward-comments
---

## Addressing review comments

**Address Comments**, in the [Review menu](../sessions-pr-review/#choosing-a-review), starts an agent on the pull request's unresolved review threads. For each thread it shows the comment and the code it is on, and recommends whether to address it, with the fix or the reason not to. You choose:

- **Address the comment** — the agent makes the fix and commits it, then replies on the thread with a link to that commit and resolves it.
- **Do not address** — the agent replies on the thread with a one-line reason it won't be fixed and resolves it.
- **Skip** — the thread is left as it is.

Picking an option carries it out on GitHub; there is nothing left to post afterwards.

| Mode                    | How you decide                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Address Comments        | Every thread up front, then each addressed thread gets its own commit and they are pushed together |
| Address Comments (auto) | The agent decides, asking only about threads it isn't sure of, and sums up after                   |

In a session already on the pull request's branch, run `/review-pr-comments`, with `--auto` for auto mode. Add `--announce <number>` to [post the pull request to Slack](../pull-requests/#announcing-in-slack) once every thread is handled.

## Posting review comments

When an agent has listed problems it found, such as from a review you asked for in a session, run `/comment <numbers>`, such as `/comment 1,3`, to post those items as line comments on the current branch's pull request.

To post review feedback you copied from Slack or elsewhere, run `/forward-comments <github-username>` and paste the feedback after it. The agent posts each point as a line comment quoting the reviewer, after you confirm where each goes.
