---
id: sessions-session-area
title: The session area
group: Sessions
order: 3
covers: []
screenshots:
  - file: sessions-top-bar.png
    alt: The top bar of a waiting session
    route: /sessions
    scene: dashboard
    waitFor: text=Pricing page copy
    viewport:
      width: 1280
      height: 400
    actions:
      - click: text=Dark mode toggle
    crop: "[data-testid=session-top-bar]"
  - file: sessions-sdk.png
    alt: A Claude (SDK) session showing its transcript, with the composer offering a suggested next prompt
    route: /sessions
    scene: dashboard
    setup:
      - session:
          repo: website
          prompt: Why does the footer overlap the cookie banner?
          title: Cookie banner overlap
          harness: claude-sdk
          reply:
            - "Both are fixed to the bottom of the page, and the banner's `z-index` is lower than the footer's, so the footer is drawn over it."
            - "Raising the banner to `z-index: 50` keeps it above the footer without affecting the modal, which sits at 100."
          suggestion: Raise the banner's z-index
    waitFor: text="Cookie banner overlap"
    actions:
      - click: text="Cookie banner overlap"
    viewport:
      width: 1280
      height: 640
  - file: sessions-sdk-queued.png
    alt: A message queued in a Claude (SDK) session while Claude works, with its Edit and Remove buttons
    route: /sessions
    scene: dashboard
    setup:
      - session:
          repo: website
          prompt: Fix the footer overlapping the cookie banner
          title: Raise the cookie banner
          harness: claude-sdk
          hold: true
          reply:
            - "Both are fixed to the bottom of the page, and the banner's `z-index` is lower than the footer's. I'll raise the banner above it."
    waitFor: text="Raise the cookie banner"
    actions:
      - click: text="Raise the cookie banner"
      - click: "[aria-label='Message Claude']"
      - type: Check the modal still sits above the banner
      - press: Enter
      - hover: text=Check the modal still sits above the banner
    viewport:
      width: 1280
      height: 640
  - file: sessions-sdk-shell.png
    alt: A shell command's output in a Claude (SDK) session, attached to the next message
    route: /sessions
    scene: dashboard
    setup:
      - session:
          repo: website
          prompt: Why does the footer overlap the cookie banner?
          title: Cookie banner overlap
          harness: claude-sdk
          reply:
            - "Both are fixed to the bottom of the page, and the banner's `z-index` is lower than the footer's, so the footer is drawn over it."
            - "Raising the banner to `z-index: 50` keeps it above the footer without affecting the modal, which sits at 100."
          suggestion: Raise the banner's z-index
    waitFor: text="Cookie banner overlap"
    actions:
      - click: text="Cookie banner overlap"
      - click: "[aria-label='Message Claude']"
      - type: "!git log --oneline -3"
      - press: Enter
    viewport:
      width: 1280
      height: 640
---

The session area shows the selected session: the top bar, its terminal or [transcript](#claude-sdk-sessions) and your last message to it, along with its [diff](../sessions-diff/) and [preview panes](../sessions-preview-panes/) when open.

## The top bar

Click the harness conversation id in the top bar to copy it.

::screenshot{file="sessions-top-bar.png"}

On the right, the git change counts open the [diff](../sessions-diff/), and toggles such as **Auto start** apply to draft, bug and refine sessions. Then its actions, shown only when they apply:

- **Add agent** (:kbd[Alt+Z]) starts another agent in the same working copy, with a prompt you type, so it picks up the work in progress. It is offered while the session is still working.
- **VS Code** (:kbd[Alt+X]) opens the session's working copy in VS Code.
- :icon[RestartAlt] **Restart** ends the agent and resumes its conversation in a fresh process, after asking. Its :icon[ArrowDropDown] dropdown has **Start over**, which discards the conversation and starts a new one with only the session's first prompt.
- :icon[Replay] **Retry** appears on a [run session](../sessions-creating/#run-sessions), running the command again, and on a backlog run that didn't come back after the daemon restarted, starting it again.
- **Star** pins the session to the top of the sidebar. For a backlog run, the star belongs to the item, so it carries over to the item's next session.
- **Transfer**, on a backlog run, moves the run to a [linked node](../sessions-linked-nodes/) that has the repo, or from one back to this node. Uncommitted and unpushed changes go with it.
- **Done** (:kbd[Alt+C]), on a backlog item's session, marks the item done and ends the session, along with any dev server started from it. Hold :kbd[Shift] as you click it or press :kbd[Enter] to skip the confirmation.
- **×** closes the session, as on its card.

[Pull request](../pull-requests/), [review](../sessions-pr-review/) and [server](../sessions-creating/#run-sessions) buttons appear for sessions that have them.

Commands an agent runs to act on its own card, such as `/close` and `/rename`, are on [Session commands](../sessions-cli/#slash-commands).

## Skill suggestions

Typing a word starting with `/` in a box whose text goes to the agent lists the skills and commands that match it. :kbd[ArrowUp] and :kbd[ArrowDown] move through the list, :kbd[Tab] or :kbd[Enter] puts the highlighted one in your text, and :kbd[Esc] closes the list. You can also click one.

## The terminal

The terminal is the agent itself, such as Claude Code, running live. You give it prompts, answer its questions and approve its permission requests here, as you would in Claude Code in your own terminal. For a [run session](../sessions-creating/#run-sessions), it shows the command's output.

- :kbd[Mod+C] copies the selected text. With nothing selected, it reaches the session as an interrupt.
- :kbd[Mod+V] pastes.

## Claude (SDK) sessions

A session on the [Claude (SDK)](../harnesses/#claude-sdk) harness has no terminal. Its live transcript takes the terminal's place, with a composer under it for your messages, and its top bar carries an **SDK** badge.

::screenshot{file="sessions-sdk.png"}

In the composer:

- :kbd[Enter] sends. :kbd[Shift+Enter], or :kbd[Enter] straight after a `\`, adds a line break.
- While the field is empty after a turn, it shows the prompt Claude expects you to send next. :kbd[Tab] fills the field with it. On the phone, tap the suggestion above the reply field.
- **Stop**, or :kbd[Esc], interrupts Claude's turn.
- A message sent while Claude is working is queued until the turn ends. Hover a queued message to **Remove** it, or **Edit** it to take it back into the composer.

::screenshot{file="sessions-sdk-queued.png"}

Select text in the transcript to comment on it, as in the [diff](../sessions-diff/#commenting).

### Shell commands

Start a message with `!` to run it as a shell command in the session's working copy, as in Claude Code's bash mode. Its output streams into the transcript without starting a turn, and is attached to your next message to Claude. :kbd[Backspace] in an empty field leaves shell mode.

::screenshot{file="sessions-sdk-shell.png"}

**Stop** on a running command's row, or :kbd[Esc] while it runs, stops it and keeps its output so far.

## Your last message

Your last prompt to the session shows over the terminal, cut to one line. Hover to read all of it, or click to pin it open. Scrolling over it steps back through your earlier prompts, with a counter showing which one you're on.

## Transcripts

Clicking an entry on the sidebar's [History](../sessions-sidebar/#history) tab shows its transcript here in place of the terminal. Click a tool call in a transcript to see its full command or path.
