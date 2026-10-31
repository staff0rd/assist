---
id: ios-app
title: iOS app
group: Sessions
order: 11
covers: []
---

The assist iOS app shows your sessions on your phone: see which agents are waiting on you, read their terminals, reply and answer their questions, away from your desk. It connects to one of your web servers over [Tailscale](https://tailscale.com/) and shows that machine's sessions along with those of every [linked machine](../sessions-linked-nodes/).

## Installing

The app is distributed through TestFlight. Install [TestFlight](https://apps.apple.com/app/testflight/id899247664) on your iPhone, accept your tester invite, then install **assist** from TestFlight. Each assist release publishes a new build there.

## Connecting to a home node

The machine the app connects to is its home node. Before connecting, connect Tailscale on the phone and [link the machine over Tailscale](../sessions-linked-nodes/#linking-over-tailscale) so its web server is reachable on your tailnet.

On first launch, enter the address you open the dashboard at in a browser as the **Web server URL**, such as `https://mac.tail1234.ts.net:3100`, and press **Connect**. **Name** is filled in from the host name and labels the node chip at the top of the session list.

## Switching nodes

Tap the node chip to list your saved nodes. Tap one to make it the home node, the pencil to edit it, or **Add node URL** to save another. The app remembers your choice across launches.

When the home node can't be reached, the app shows the error. Press **Retry now**, or pick another node under **Switch home node**.
