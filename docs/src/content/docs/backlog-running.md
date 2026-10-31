---
id: backlog-running
title: Running items
group: Backlog
order: 2
covers: []
screenshots:
  - file: backlog-build.png
    alt: The Build button on a todo item in the backlog list
    route: /backlog
    scene: backlog
    waitFor: text=Cart total rounds to the wrong cent
    viewport:
      width: 1440
      height: 640
    highlight:
      - "[aria-label='Build'] >> nth=0"
  - file: backlog-continue.png
    alt: The Continue toggle on a backlog run's top bar
    route: /sessions
    scene: backlog
    setup:
      - assistSession: [backlog, run, a1]
    waitFor: text=Dark mode toggle
    viewport:
      width: 1440
      height: 640
    actions:
      - click: text=Dark mode toggle
    highlight:
      - "label:has-text('Continue')"
  - file: backlog-dismiss.png
    alt: Done on a backlog run in its review phase
    route: /sessions
    scene: backlog
    setup:
      - backlogItem:
          item:
            name: Show prices in the visitor's currency
            type: story
            description: Product and cart prices show in US dollars for everyone.
            acceptanceCriteria:
              - Prices show in the visitor's currency
            phases:
              - name: Convert prices
                tasks:
                  - Convert prices with the daily exchange rate
          phaseSummaries:
            - Prices convert with the daily exchange rate.
          status: in-progress
      - assistSession: [backlog, run, a5]
    waitFor: text=Show prices in the visitor's currency
    viewport:
      width: 1440
      height: 640
    actions:
      - click: text=Show prices in the visitor's currency
    highlight:
      - "button:has-text('Done')"
---

**Build** on an [item](../backlog/) runs its plan.

::screenshot{file="backlog-build.png"}

Each phase gets a fresh agent session, nested under the item's card in the sidebar, which works through the phase's tasks, [verifies](../verify/) its work and moves on to the next phase. An interrupted run picks up from the phase it was on.

## Following a run

The run's card in the [sidebar](../sessions-sidebar/) shows :status[running] while the agent works and :status[waiting] when it needs you, such as to confirm manual checks or answer a question. :kbd[Mod+.] jumps to the next session waiting on you, so you can run several items at once and only step in when one asks.

## Steering a run

::screenshot{file="backlog-continue.png"}

- **Continue** on the session's top bar decides whether the next phase starts on its own. Turn it off to stop after the current phase, then **Build** again when you're ready.
- When a phase has manual checks, the agent asks you to confirm them. Reply in its terminal.
- To send the item back to an earlier phase, **Rewind** that phase on the item's [plan](../backlog/#plan).

## The review phase

::screenshot{file="backlog-dismiss.png"}

Every run ends with a review phase, added automatically after the item's own phases. Its session checks the work against each acceptance criterion and fixes what fails. Tell it the item is done once you're happy, or use **Done** on the session's top bar; the item is then marked done.
