## Rules

- **R2** — **Watch the extension deploy** — After pushing an extension change to main, watch the Release and Extension workflows until the new version is signed instead of telling the user to build or reload the extension — signing and add-on updates are automated. Once signed, run `assist browser status`; if the connected extension is behind, tell the user the assist web UI is offering the install link.
