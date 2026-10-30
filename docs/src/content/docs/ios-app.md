---
id: ios-app
title: iOS app
group: Contributing
order: 1
covers: []
---

## Build and run

`ios-app/` is a Capacitor iOS app that bundles the sessions web UI and views one **home node** over Tailscale. It has no sessions of its own; the home node already merges its linked nodes' sessions. The web server accepts REST and `/ws` requests from the app's `capacitor://localhost` origin and refuses `/ws` from any other cross-origin browser.

Needs macOS with Xcode, an iOS simulator or a device, and the Tailscale app on the phone signed in to the same tailnet.

1. `npm run ios:install` — install the Capacitor CLI and iOS platform into `ios-app/`.
2. `npm run ios:build` — build assist, copy the UI bundle into `ios-app/www`, and `cap sync` it into the Xcode project. Re-run after any UI change.
3. `npm run ios:run` to pick a simulator or connected device, or `npm run ios:open` to build and run from Xcode (a device needs your Apple ID team set under **Signing & Capabilities**).
4. On first launch, enter the home node's URL, e.g. `https://mac.<tailnet>.ts.net:3100`. It is stored on the device.

## Using the app

The session list groups sessions by status with **Needs you** (waiting and errored) first; pull down to refresh, tap **Done** to expand finished sessions, and use the clock icon for history. Tap a session to open it full screen: the terminal is read-only, so pinch to zoom and drag to pan. Type in the reply field (Return adds a line, the send button submits) or use the key strip for `1`/`2`/`3`, arrows, Esc, Tab and ⌃C.
