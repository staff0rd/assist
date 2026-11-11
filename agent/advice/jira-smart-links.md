---
title: Editing Jira issues with Smart Links
when: jira
---

When editing a Jira issue whose description (or comment) contains Smart Links — rendered issue-key/URL chips, stored as ADF `inlineCard` nodes — edit via `editJiraIssue` with `contentFormat: "adf"` and emit real `inlineCard` nodes. Never round-trip such content through `contentFormat: "markdown"`: markdown has no representation for `inlineCard`, so every existing Smart Link is flattened to a plain browse URL and lost. Jira does not auto-promote plain browse URLs back into Smart Links, so the damage is not self-healing. Inspect the current stored ADF first and preserve existing `inlineCard` nodes when making a small edit. For anything beyond a trivial edit, build the ADF programmatically (a small script) rather than hand-authoring it inline — full-description ADF is verbose and easy to get wrong.
