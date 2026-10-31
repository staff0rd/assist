---
id: browser-extension
title: Browser extension
group: Integrations
order: 9
covers:
  - claude:extension
  - config:extension.redirects
screenshots:
  - file: browser-extension-comment-popover.png
    alt: The assist popover open beside a pull request comment, with an instructions field and Prompt, Draft and Bug buttons
    url: https://github.com/staff0rd/sandbox/pull/12
    actions:
      - click: "a[href*='#issuecomment-'] + [data-assist-send]"
      - type: Add an example under Usage
    crop:
      - "[id^='issuecomment-']:visible"
      - "textarea:visible"
      - "text=/Esc to/ >> visible=true"
    cropPadding: 16
  - file: browser-extension-review-menu.png
    alt: The assist button's menu on a GitHub pull request, listing review modes, options and pull request actions
    url: https://github.com/staff0rd/sandbox/pull/12
    actions:
      - script: show-header-actions
      - click: ".assist-send--header[data-assist-send]"
    crop:
      - "h1:visible"
      - "[role='menu']:visible"
    cropPadding: 16
  - file: browser-extension-criteria.png
    alt: An issue description's acceptance criteria shown as an editable outline, with Edit markdown in the editor toolbar
    url: https://github.com/staff0rd/sandbox/issues/8
    actions:
      - script: issue-editor
    crop: "[data-testid='capture-issue-editor']"
---

The assist extension for Firefox starts sessions from GitHub pages and edits acceptance criteria in GitHub issues.

## Installing

Run `/extension` for a link to the latest build. Open it in Firefox and accept the install prompt; the extension keeps itself up to date.

It sends to the web server at `http://localhost:3100`. If yours runs elsewhere, change it on the extension's options page: **about:addons** → **assist** → **Options**.

## Sending from GitHub

The extension adds an **assist** button beside each comment and review on a pull request or issue, and to the issue's header. Click it, optionally type instructions, then pick:

| Button | Does                                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------- |
| Prompt | Starts a session in your clone of the repo, with the link and your instructions. **Enter** picks this |
| Draft  | [Drafts a backlog item](../backlog-writing/) from the link and your instructions                      |
| Bug    | Files a backlog bug from the link and your instructions                                               |

::screenshot{file="browser-extension-comment-popover.png"}

The repo must be cloned under `clone.baseDir`.

On a pull request, the header button opens the same menu as the dashboard's [Review menu](../sessions-pr-review/#choosing-a-review): its review modes and options, **Checkout**, **Address Comments** and **Fix conflicts**.

::screenshot{file="browser-extension-review-menu.png"}

On an Azure DevOps pull request it offers **Checkout**, which needs the Azure CLI with its `azure-devops` extension, logged in with `az login`.

## Working on issues in another repo

If a repo's issues are worked on in a different repo, map one to the other, and sessions from that repo's issues open in your clone of the other:

```bash
assist config set extension.redirects.acme/roadmap acme/web
```

Pull request reviews always open in the pull request's own repo.

## Acceptance criteria

When you edit an issue's description, or write a new one, the editor's toolbar gains **Outline criteria**. Press it to edit the acceptance criteria as an outline of rows, then save the issue as usual. **Edit markdown** goes back to the text.

::screenshot{file="browser-extension-criteria.png"}
