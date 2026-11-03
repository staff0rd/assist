---
id: hooks-and-permissions
title: Agent instructions and permissions
group: Repo tooling
order: 5
covers:
  - claude:prompts
  - config:advice.sections
  - config:advice.extra
  - config:advice.verify
  - config:advice.rules
  - config:deny
  - config:cliHook.blockNpmRun
  - config:notify.enabled
---

[`assist sync`](../getting-started/#install) sets Claude Code up to work with assist: every session gets instructions written for its repo, read-only commands run without asking you, and commands you don't want agents to run are blocked with a message saying what to do instead.

## Repo instructions

Each Claude Code session starts with instructions composed for its repo, such as how to verify a change and how to commit. Sections are included when they apply: the verify section only appears when the repo has [verify checks](../verify/), and the TypeScript refactoring section only in TypeScript repos.

Tune them per repo:

- Add your own notes, shown as a **Repo notes** section:

  ```bash
  assist config set advice.extra "Deploy from main only"
  ```

- Force a section on or off, whatever its condition says. [`assist advise --explain`](../cli-hooks/) lists every section's name:

  ```bash
  assist config set advice.sections.verify false
  ```

- Replace the verify section's text, which also forces it on:

  ```bash
  assist config set advice.verify "Run make check"
  ```

- List your own rules under `advice.rules`, each with a `title` and `text`, shown as a **Your rules** section:

  ```yaml
  advice:
    rules:
      - title: Link, don't navigate
        text: Give the direct URL whenever you send me to a web page or setting.
  ```

## Fewer permission prompts

Read-only commands of common CLIs, such as `git log` or `gh pr view`, run without a permission prompt. Commands that change things still ask.

When the same prompts keep coming up, run `/prompts`. The agent lists the commands you've been asked about most, suggests which are safe to allow, and makes only the changes you agree to.

## Blocking commands

A deny rule stops agents running a command and tells them what to do instead. Add one with [`assist deny add`](../cli-hooks/#deny-rules):

```bash
assist deny add "rm -rf" "Delete files one at a time with rm"
```

Rules are kept in the `deny` config key, so they can also be edited on the [Config](../config/) page.

assist also blocks some commands for agents, such as `git commit`, `gh pr create` and `npm run`, so they use the assist command that does the job. To let agents use `npm run` in a repo:

```bash
assist config set cliHook.blockNpmRun false
```

## Approving with a pin

Some agent actions need your approval, such as [adding a code comment](../code-quality/#approving-a-comment), [editing the docs](../backlog-docs/#turning-it-on) during a backlog run or changing a database schema. assist sends a three-digit pin as a desktop notification, on the node you're controlling the session from. Give the agent the pin to approve; withhold it to refuse.

## Desktop notifications

assist shows a desktop notification when Claude Code needs your permission or is waiting for input. To turn them off:

```bash
assist config set notify.enabled false
```
