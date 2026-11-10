---
id: ios-app
title: iOS app
group: Sessions
order: 11
covers:
  - route:/connect-mobile
screenshots:
  - file: ios-app-testflight-testers.png
    alt: The TestFlight testers dialog, listing internal and external testers with their status
    route: /
    setup:
      - testflight:
          bundleId: com.example.sandbox
          externalGroup: Friends
          internalGroup: Team
          team:
            - email: sam@example.com
            - email: alex@example.com
              pending: true
          testers:
            - email: sam@example.com
              group: internal
              state: INSTALLED
            - email: jordan@example.com
              group: external
              state: INSTALLED
            - email: riley@example.com
              group: external
              state: ACCEPTED
            - email: casey@example.com
              group: external
              state: INVITED
    waitFor: "[aria-label='Open menu']"
    actions:
      - click: "[aria-label='Open menu']"
      - click: text=TestFlight testers
  - file: ios-app-sessions.png
    alt: The iOS app session list, with sessions that need you above running ones
    route: /
    phone: true
    scene: dashboard
    waitFor: text=Dark mode toggle
  - file: ios-app-connect.png
    alt: Connecting the iOS app to a home node on first launch
    route: /
    phone:
      nodes: []
    waitFor: text=Connect to a home node
    actions:
      - click: input[placeholder="https://mac.tail1234.ts.net:3100"]
      - type: https://mac.tail1234.ts.net:3100
  - file: ios-app-connect-mobile.png
    alt: The Connect mobile page, with the node's QR code and tailnet URL
    route: /connect-mobile
    setup:
      - connectMobile:
          url: https://mac.tail1234.ts.net:3100
          name: mac
    waitFor: text=https://mac.tail1234.ts.net:3100
  - file: ios-app-nodes.png
    alt: The iOS app's saved nodes, with the home node selected
    route: /
    phone:
      nodes: [laptop, desktop]
    scene: dashboard
    waitFor: text=Dark mode toggle
    actions:
      - click: '[aria-label="Nodes"]'
  - file: ios-app-backlog.png
    alt: The iOS app's Backlog tab, with the tab bar along the bottom
    route: /backlog
    phone: true
    scene: backlog
    waitFor: text=Cart total rounds to the wrong cent
  - file: ios-app-actions.png
    alt: A backlog item's session actions in the iOS app, including Mark done
    route: /
    phone: true
    scene: backlog
    setup:
      - peer: desktop
      - assistSession: [backlog, run, a1]
    waitFor: text=Dark mode toggle
    actions:
      - click: text=Dark mode toggle
      - click: '[aria-label="Session actions"]'
  - file: ios-app-preview-card.png
    alt: A proposed backlog item's card on a session's screen in the iOS app
    route: /
    phone: true
    scene: previews
    setup:
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
    waitFor: text=Dark mode toggle
    actions:
      - click: text=Dark mode toggle
  - file: ios-app-review-sheet.png
    alt: The iOS app's review sheet showing a proposed backlog item in full
    route: /
    phone: true
    scene: previews
    setup:
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
    waitFor: text=Dark mode toggle
    actions:
      - click: text=Dark mode toggle
      - click: text=Review full item
---

:badge[experimental] The iOS app is still being worked out, and its screens and features may change or be removed.

The assist iOS app shows your sessions on your phone: see which agents are waiting on you, read their terminals, reply and answer their questions, away from your desk. It connects to one of your web servers over [Tailscale](https://tailscale.com/) and shows that node's sessions along with those of every [linked node](../sessions-linked-nodes/).

::screenshot{file="ios-app-sessions.png"}

## Installing

The app is distributed through TestFlight. Install [TestFlight](https://apps.apple.com/app/testflight/id899247664) on your iPhone, accept your tester invite, then install **assist** from TestFlight.

## Managing testers

Once your App Store Connect app is [configured](../cli-testflight/#config), open **TestFlight testers** from the dashboard's menu to see each tester's invite and install status. Enter an email and press **Add** to add a tester to the external group. Turn on **Internal** to invite them to your App Store Connect team instead, then add them again once they accept to put them in the internal group.

::screenshot{file="ios-app-testflight-testers.png"}

## Connecting to a home node

The node the app connects to is its home node. Before connecting, connect Tailscale on the phone and [link the node over Tailscale](../sessions-linked-nodes/#linking-over-tailscale) so its web server is reachable on your tailnet.

Open **Connect mobile** from the dashboard's menu on that node and scan its QR code with the iPhone camera. The app adds the node and makes it the home node.

::screenshot{file="ios-app-connect-mobile.png"}

To enter the address by hand instead, on first launch enter the address you open the dashboard at in a browser as the **Web server URL**, such as `https://mac.tail1234.ts.net:3100`, and press **Connect**. **Name** is filled in from the host name and labels the node chip at the top of the session list.

::screenshot{file="ios-app-connect.png"}

## Switching nodes

Tap the node chip to list your saved nodes. Tap one to make it the home node, the pencil to edit or delete it, or **Add node URL** to save another. Deleting the home node makes another saved node the home node, or, if it was the last one, takes you back to connecting a home node. The app remembers your choice across launches.

::screenshot{file="ios-app-nodes.png"}

When the home node can't be reached, the app shows the error. Press **Retry now**, or pick another node under **Switch home node**.

## Getting around

The tab bar along the bottom switches between **Sessions**, **Backlog** and **History**. Each tab keeps its place, so switching back returns to the screen you left; tap the active tab to return to its list. On a screen with a back button, swiping right from the left edge of the screen also goes back.

::screenshot{file="ios-app-backlog.png"}

## Acting on a session

Tap **⋯** on a session's screen, or long-press its row in the list, for its actions. On a backlog item's session, **Mark done…** marks the item done and ends the session, with any dev server started from it. On a backlog run, **Auto-advance phases** is the dashboard's [Continue](../backlog-running/#steering-a-run) toggle, and **Transfer to node** moves the run to another node.

::screenshot{file="ios-app-actions.png"}

Sessions asking you a question or proposing a backlog item sit under **Answer here** at the top of the list, above **Needs you**. A session waiting on a manual check shows the check on its screen: try it, add an optional note, and tap **Works** or **Doesn't work**. During a [backlog run](../backlog-running/), **Later phase** moves the check to a later phase of the item instead.

## Reviewing previews

When an agent puts something in the [preview pane](../sessions-preview-panes/), such as a proposed backlog item or a pull request, a card on its screen shows what it is, with the same buttons as on the dashboard.

::screenshot{file="ios-app-preview-card.png"}

Tap **Review full item**, or **Review** on other previews, to read the whole of it. Select text there and tap **Comment** to comment on it as in the pane: **Send to agent**, **Add to review**, **Cite a broken rule** or **Add rule**. The comments you've added to the review are listed at the bottom of the sheet, where you can remove any before you approve or reject. With linked nodes, pick the node to run on above **Approve & start**.

::screenshot{file="ios-app-review-sheet.png"}

## Starting a session with Siri

Start a session on the home node hands-free, such as from CarPlay, by saying "Hey Siri," then:

| Say                             | Starts                                                               |
| ------------------------------- | -------------------------------------------------------------------- |
| "Assist draft" or "Assist idea" | A [`/draft`](../backlog-writing/) session that writes a backlog item |
| "Assist bug"                    | A `/bug` session that files a bug                                    |
| "Assist prompt"                 | A plain agent session with what you say as its first prompt          |

"Backlog" works in place of "Assist". Siri asks which repo, then for your note, reads the note back and starts the session when you say yes.
