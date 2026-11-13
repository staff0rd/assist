---
id: sessions-preview-panes
title: Preview panes
group: Sessions
order: 9
covers:
  - claude:ask
  - claude:show
  - config:sessions.askQuestion
  - config:sessions.askQuestionAutoSubmit
  - config:prs.reviewAfterRaise
screenshots:
  - file: sessions-ask.png
    alt: A proposal waiting for approval in the preview pane, with a comment added
    route: /sessions
    scene: previews
    setup:
      - preview:
          session: Add a dark mode toggle to the settings page
          kind: ask
          title: Dark mode toggle plan
          body: |
            ## Plan

            1. Add a `useColourScheme` hook that reads the saved scheme, falling back to the operating system's.
            2. Add a **Dark mode** checkbox to the settings page, next to the theme picker.
            3. Save the choice to localStorage so it survives a reload.

            ## Out of scope

            - Per-page colour overrides
            - Syncing the choice across devices
    waitFor: text=Dark mode toggle plan
    viewport:
      width: 1440
      height: 720
    actions:
      - click: text=Dark mode toggle
      - drag:
          from: text=Save the choice to localStorage
          to: text=Save the choice to localStorage
      - type: Store it per user on the server instead, so it follows them between devices
      - click: text=Add to review
  - file: sessions-design.png
    alt: A design waiting for review in the preview pane, with its Open design button and summary
    route: /sessions
    scene: previews
    setup:
      - design:
          session: Add a dark mode toggle to the settings page
          url: https://claude.ai/artifact/LXseEx7cXDjD46uKhA7G2u
          title: Dark mode settings
          body: |
            The settings page with a **Dark mode** checkbox beside the theme picker, shown in both light and dark.

            - The checkbox sits in the existing Appearance group rather than a new section.
            - Turning it on switches the page straight away, with no Save button.
    waitFor: text=Dark mode settings
    viewport:
      width: 1440
      height: 720
    actions:
      - click: text=Dark mode toggle
  - file: sessions-question.png
    alt: A question from the agent in the preview pane, with its options, an Other box and the Answer button
    route: /sessions
    scene: previews
    setup:
      - question:
          session: Add a dark mode toggle to the settings page
          title: Claude is asking a question
          questions:
            - question: Where should the Dark mode toggle go on the settings page?
              header: Placement
              multiSelect: false
              options:
                - label: Next to the theme picker
                  description: Groups it with the other appearance settings
                - label: In a new Appearance section
                  description: Leaves room for more display options later
    waitFor: text=Where should the Dark mode toggle go
    viewport:
      width: 1440
      height: 720
    actions:
      - click: text=Dark mode toggle
  - file: sessions-check.png
    alt: A manual check in the preview pane, with its steps and the Works, Doesn't work and Later phase buttons
    route: /sessions
    scene: previews
    setup:
      - check:
          session: Add a dark mode toggle to the settings page
          title: Toggle switches the theme
          before: [Restart the web server]
          steps:
            - Open Settings
            - Turn on Dark mode
            - Reload the page
          changed: Adds a Dark mode toggle that saves the choice and applies it on load.
          laterPhases:
            - number: 2
              name: Follow the system colour scheme
            - number: 3
              name: Review
    waitFor: text=Toggle switches the theme
    viewport:
      width: 1440
      height: 720
    actions:
      - click: text=Dark mode toggle
  - file: sessions-show.png
    alt: Links, paths and a command shown in the preview pane
    route: /sessions
    scene: previews
    setup:
      - preview:
          session: Add a dark mode toggle to the settings page
          kind: show
          title: Dark mode files
          body: |
            - https://github.com/staff0rd/sandbox/blob/main/src/settings/SettingsPage.tsx
            - `src/settings/useColourScheme.ts`

            ```bash
            npm test -- src/settings
            ```
    waitFor: text=Dark mode files
    viewport:
      width: 1440
      height: 520
    actions:
      - click: text=Dark mode toggle
  - file: sessions-backlog-proposal.png
    alt: A proposed backlog item in the preview pane
    route: /sessions
    scene: previews
    setup:
      - peer: desktop
      - proposal:
          session: Add a dark mode toggle to the settings page
          item:
            name: Follow the system colour scheme
            type: story
            description: The settings page's dark mode toggle should follow the operating system's colour scheme until the user picks one.
            acceptanceCriteria:
              - With no saved choice, the page matches the operating system's scheme
              - Picking a scheme overrides the operating system's from then on
            phases:
              - name: Follow the system scheme
                tasks:
                  - Read prefers-color-scheme when no choice is saved
                  - Update the page when the system scheme changes
    waitFor: text=Follow the system colour scheme
    viewport:
      width: 1440
      height: 760
    actions:
      - click: text=Dark mode toggle
  - file: sessions-pr-preview.png
    alt: A pull request previewed before it is raised
    route: /sessions
    scene: previews
    setup:
      - pr:
          session: Add a dark mode toggle to the settings page
          title: Add a dark mode toggle to settings
          what: The settings page has a Dark mode toggle. It follows the operating system's colour scheme until you pick one, then remembers your choice.
          why: Users working at night asked for a dark theme.
          resolves:
            - "#12"
    waitFor: text=Add a dark mode toggle to settings
    viewport:
      width: 1440
      height: 620
    actions:
      - click: text=Dark mode toggle
      - click: "[aria-label='Fill the window with preview']"
---

When an agent has something for you to approve or read, it opens a preview pane on its session: a proposal or decision to approve, a pull request, a backlog item or comment to create, or links and snippets to copy.

## Working in a pane

- The width toggle in the pane's header widens it over the terminal or shrinks it back.
- :kbd[Alt+D] moves focus to the pane's main button, such as **Approve**, and pressing it again returns to the terminal with the pane left open.
- **Approve** accepts what is shown and the agent carries on. **Reject** turns it down, and the agent revises it and shows you the next version.

## Commenting

Drag across text in the pane to select it, type a note, then:

- **Send to agent** types the note, quoting the selected text, straight into the session.
- **Add to review** adds the note to the list above the pane's buttons. **Request changes** sends every note in the list back to the agent together, each with the text it quotes, for the agent to revise and show you again.

::screenshot{file="sessions-ask.png"}

As in the [diff](../sessions-diff/#commenting), **Cite a broken rule** and **Add rule** turn a comment into a [rule](../rules/) fix or a new rule.

## Getting your approval

Ask the agent to `/ask` about something and it puts a proposal, summary or decision in the pane and waits. Approve it and the agent goes ahead, acting on any comments you added; reject it and the agent revises it and asks again.

## Reviewing a design

When the agent designs a story or fix, the design opens in the pane with a summary. **Open design** opens it on claude.ai. Approve it, or reject it with comments and the agent revises it and asks again.

::screenshot{file="sessions-design.png"}

## Answering questions

Questions the agent asks you open in the pane as a form instead of in the terminal. Pick one option, or several where the question allows it, or choose **Other** and type your own answer, then press **Answer**. In an **Other** box, :kbd[Enter] sends the answers once every question is answered and :kbd[Shift+Enter] adds a new line. **Dismiss** declines to answer.

::screenshot{file="sessions-question.png"}

Turn on **Auto submit** in the pane (`sessions.askQuestionAutoSubmit`) and a form whose questions each take one option is sent as soon as you pick the option that completes it, without pressing **Answer**.

## Trying a change

Manual checks open in the pane. Follow the steps, then press **Works** or **Doesn't work**, with an optional note.

During a [backlog run](../backlog-running/), a check that can't be judged yet can wait: press **Later phase** and pick one of the item's later phases, including Review, to move the check there.

If a step is unclear, select the text you're unsure about, type your question and send it. The agent answers in the session, and the check stays open for you to answer.

::screenshot{file="sessions-check.png"}

## Showing links and snippets

Long links, paths and commands wrap in the terminal and break when you click or copy them. Ask the agent to `/show` them and they open whole in the pane.

::screenshot{file="sessions-show.png"}

## Proposing a backlog item

When [`/draft`](../backlog/) or [`/bug`](../backlog/) has written an item, the whole item, with its description, acceptance criteria and plan, opens in the pane.

::screenshot{file="sessions-backlog-proposal.png"}

- **Approve** adds the item to the backlog.
- **Approve & start** adds it and starts running it in a new session.

With [linked nodes](../sessions-linked-nodes/), pick the node to run it on beside **Approve & start**. It starts on the node selected in the toolbar unless you pick another.

## Previewing a pull request

When the agent raises or edits a [pull request](../pull-requests/), the title and description open in the pane for you to approve before it goes to GitHub.

::screenshot{file="sessions-pr-preview.png"}

- Drop or paste images onto the pane to attach screenshots to the description, and give each a caption and an optional group.
- **Draft** raises a new pull request as a draft.
- **Auto-merge (squash)** squash-merges it once its required checks pass.
- **Review PR** [reviews](../sessions-pr-review/) it once it's raised, then addresses the findings. It starts ticked unless `prs.reviewAfterRaise` is `false`.
- **Post to Slack** announces it in Slack at the end.

Issues, issue and pull request comments and Slack posts the agent writes open in the pane the same way, for approval before they are sent.
