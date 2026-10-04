---
description: Get the install link for the assist browser extension
---

Run:

```
assist criteria-extension --url
```

It prints the download URL of the latest signed Firefox build. If it fails, report the error and stop.

Show the link whole in the web preview pane:

```
printf '%s\n' '[Install the assist browser extension](<url>)' '' 'Open it in Firefox and accept the install prompt. Once installed, the add-on updates itself.' | assist show --title 'assist browser extension' --body -
```

Then reply with the URL and one line saying Firefox installs it permanently and keeps it updated.
