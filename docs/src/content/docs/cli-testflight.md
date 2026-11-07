---
id: cli-testflight
title: assist testflight
group: CLI
order: 35
covers:
  - cli:testflight add
  - config:testflight.keyId
  - config:testflight.issuerId
  - config:testflight.keyRef
  - config:testflight.bundleId
  - config:testflight.externalGroup
  - config:testflight.internalGroup
---

These commands manage who can install the [iOS app](../ios-app/) from TestFlight, through the App Store Connect API.

## Commands

- `assist testflight add <email>` adds a tester to the external beta group.
- `assist testflight add <email> --internal` invites them to the App Store Connect team. Run it again after they accept to add them to the internal beta group.

## Config

```bash
assist config set testflight.keyId <key id>
assist config set testflight.issuerId <uuid>
assist config set testflight.keyRef op://<vault>/<item>/<field>
assist config set testflight.bundleId com.example.app
assist config set testflight.externalGroup "<group name>"
assist config set testflight.internalGroup "<group name>"
```

| Key             | Sets                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| `keyId`         | The App Store Connect API key id                                                      |
| `issuerId`      | The App Store Connect API issuer id                                                   |
| `keyRef`        | A 1Password reference to the API key's `.p8`, read with `op` each run and never saved |
| `bundleId`      | The bundle id of the app whose testers are managed                                    |
| `externalGroup` | The external beta group new testers are added to                                      |
| `internalGroup` | The internal beta group for App Store Connect team members                            |
