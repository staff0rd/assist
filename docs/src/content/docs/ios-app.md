---
id: ios-app
title: iOS app
group: Sessions
order: 11
covers:
  - route:/connect-mobile
  - cli:testflight add
  - config:testflight.keyId
  - config:testflight.issuerId
  - config:testflight.keyRef
  - config:testflight.bundleId
  - config:testflight.externalGroup
  - config:testflight.internalGroup
screenshots:
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
---

:badge[experimental] The iOS app is still being worked out, and its screens and features may change or be removed.

The assist iOS app shows your sessions on your phone: see which agents are waiting on you, read their terminals, reply and answer their questions, away from your desk. It connects to one of your web servers over [Tailscale](https://tailscale.com/) and shows that node's sessions along with those of every [linked node](../sessions-linked-nodes/).

::screenshot{file="ios-app-sessions.png"}

## Installing

The app is distributed through TestFlight. Install [TestFlight](https://apps.apple.com/app/testflight/id899247664) on your iPhone, accept your tester invite, then install **assist** from TestFlight.

## Managing testers

To invite testers to your own build, point assist at your app in App Store Connect with an [API key](https://appstoreconnect.apple.com/access/integrations/api):

```bash
assist config set testflight.keyId <key id>
assist config set testflight.issuerId <issuer id>
assist config set testflight.keyRef op://<vault>/<item>/<field>
assist config set testflight.bundleId <bundle id>
assist config set testflight.externalGroup <group name>
assist config set testflight.internalGroup <group name>
```

`testflight.keyRef` is the 1Password reference to the key's `.p8` file. New testers go into `testflight.externalGroup`; App Store Connect team members go into `testflight.internalGroup`.

Open **TestFlight testers** from the dashboard's menu to see each tester's invite and install status. Enter an email and press **Add** to add a tester to the external group. Turn on **Internal** to invite them to your App Store Connect team instead, then add them again once they accept to put them in the internal group. `assist testflight add <email> [--internal]` does the same from the CLI.

## Connecting to a home node

The node the app connects to is its home node. Before connecting, connect Tailscale on the phone and [link the node over Tailscale](../sessions-linked-nodes/#linking-over-tailscale) so its web server is reachable on your tailnet.

On first launch, enter the address you open the dashboard at in a browser as the **Web server URL**, such as `https://mac.tail1234.ts.net:3100`, and press **Connect**. **Name** is filled in from the host name and labels the node chip at the top of the session list.

::screenshot{file="ios-app-connect.png"}

To skip typing the address, open **Connect mobile** from the dashboard's menu on that node and scan its QR code with the iPhone camera. The app adds the node and makes it the home node.

## Switching nodes

Tap the node chip to list your saved nodes. Tap one to make it the home node, the pencil to edit it, or **Add node URL** to save another. The app remembers your choice across launches.

::screenshot{file="ios-app-nodes.png"}

When the home node can't be reached, the app shows the error. Press **Retry now**, or pick another node under **Switch home node**.

## Getting around

The tab bar along the bottom switches between **Sessions**, **Backlog** and **History**. Each tab keeps its place, so switching back returns to the screen you left; tap the active tab to return to its list. On a screen with a back button, swiping right from the left edge of the screen also goes back.

::screenshot{file="ios-app-backlog.png"}

## Acting on a session

Tap **⋯** on a session's screen, or long-press its row in the list, for its actions. On a backlog item's session, **Mark done…** marks the item done and ends the session, with any dev server started from it. On a backlog run, **Auto-advance phases** is the dashboard's [Continue](../backlog-running/#steering-a-run) toggle, and **Transfer to node** moves the run to another node.

::screenshot{file="ios-app-actions.png"}

Sessions asking you a question sit under **Answer here** at the top of the list, above **Needs you**. A session waiting on a manual check shows the check on its screen: try it, add an optional note, and tap **Works** or **Doesn't work**. During a [backlog run](../backlog-running/), **Later phase** moves the check to a later phase of the item instead.

## Starting a session with Siri

Start a session on the home node hands-free, such as from CarPlay, by saying "Hey Siri," then:

| Say                             | Starts                                                               |
| ------------------------------- | -------------------------------------------------------------------- |
| "Assist draft" or "Assist idea" | A [`/draft`](../backlog-writing/) session that writes a backlog item |
| "Assist bug"                    | A `/bug` session that files a bug                                    |
| "Assist prompt"                 | A plain agent session with what you say as its first prompt          |

"Backlog" works in place of "Assist". Siri asks which repo, then for your note, reads the note back and starts the session when you say yes.
