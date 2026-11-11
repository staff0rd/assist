---
description: Raise a PR with a concise description
---

Run `assist prs raise --help` and follow its guidance exactly to compose and raise the pull request for the current branch. The help text is authoritative — it covers the section options, how to pitch each section, and whether to confirm the title and body in the terminal or leave that to the web UI. Do not use `gh pr create` directly.

## After a successful raise

Only once the PR has actually been placed (skip this if the raise was rejected in the web preview or errored — there is nothing to watch), start watching CI in the background so you can keep working:

- Run `gh pr checks --watch` as a background task. It resolves the current branch's PR on its own, so no arguments are needed. Do not block on it — continue with other work while it polls.
- When the background task returns, report the outcome:
  - **Pass** → briefly confirm CI passed.
  - **Fail** → report which checks failed and offer to investigate and fix them.
