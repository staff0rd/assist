# iOS app

A Capacitor app that bundles the sessions UI and dials a home node over its Tailscale URL. Run these from the repo root:

```bash
npm run ios:install   # once
npm run ios:build     # build the UI and sync it into ios-app/ios
npm run ios:open      # open in Xcode, or npm run ios:run for a simulator
```

`assist run ios:icon` regenerates the app icon from `extension/icons/assist-master.png` (needs ImageMagick).

## TestFlight

Each release dispatches `.github/workflows/ios.yml`, which builds, signs with fastlane match and uploads to TestFlight as `<release version> (<run number>)`. Run it by hand from [Actions → iOS TestFlight](https://github.com/staff0rd/assist/actions/workflows/ios.yml) with an optional tag.

Signing shares collab-love's match repo (`staff0rd/collab-love-certificates`), distribution certificate and passphrase; this app adds only its `com.staff0rd.assist` App Store profile. `assist run match:sync` force-regenerates that profile (e.g. after changing capabilities), reading the ASC key and passphrase from 1Password.

The workflow reads these secrets from the `testflight` environment:

| Secret                          | Value                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `ASC_KEY_ID`                    | App Store Connect API key id                                                         |
| `ASC_ISSUER_ID`                 | App Store Connect API issuer id                                                      |
| `ASC_KEY_CONTENT`               | The key's `.p8`, base64 encoded                                                      |
| `APPLE_TEAM_ID`                 | Developer team id                                                                    |
| `MATCH_PASSWORD`                | The match passphrase                                                                 |
| `MATCH_GIT_BASIC_AUTHORIZATION` | `staff0rd:<PAT>` base64 encoded, with a PAT that can read `collab-love-certificates` |

To install on a phone, install [TestFlight](https://apps.apple.com/app/testflight/id899247664) and accept the internal tester invite from the app's TestFlight tab in [App Store Connect](https://appstoreconnect.apple.com/apps).
