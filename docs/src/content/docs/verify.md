---
id: verify
title: Verify
group: Repo tooling
order: 2
covers:
  - claude:verify
  - claude:verify-new
  - cli:verify
  - config:verify.roots
---

Verify runs every check a repo has, such as lint, types and tests, in one go. Agents run it before committing and fix what fails, and a [backlog run](../backlog-running/) verifies each phase before moving on.

## Running verify

Run `/verify` in a session to have the agent run the checks and fix failures until they pass. From a terminal, run:

```bash
assist verify
```

Checks run in parallel, and only failing checks print their output.

- `assist verify all` runs every check, including those that only run when matching files changed.
- `--measure` prints each check's status and duration at the end.
- `--verbose` prints every check's output, not only failures.

## Adding a check

A check is a [run command](../run-commands/) whose name starts with `verify:`.

To start a TypeScript project with the usual checks, run [`assist verify init`](../cli-setup/#setting-up-an-existing-project). It offers the checks the project doesn't have yet, such as lint, formatting, tests, unused code, duplicate code, maintainability and a dependency audit, then installs the tools for the ones you pick and adds them.

For any other check, run `/verify-new` and describe it: the agent finds the options that keep the tool quiet when it passes, then adds it. Or add one yourself:

```bash
assist run add verify:types tsc --noEmit --pretty false
assist run add verify:test vitest run --reporter=dot
```

Add `--filter <glob>` to run a check only when a changed file matches it:

```bash
assist run add verify:docs markdownlint-cli2 "docs/**/*.md" --filter "docs/**"
```

## Fix and check modes

A check can come in two variants: `verify:<name>`, which only reports problems, and `verify:<name>:fix`, which fixes them, such as a formatter that rewrites files. Verify runs one of each pair:

- Locally it runs the `:fix` variant, so review the diff afterwards.
- When the `CI` environment variable is set, it runs only `verify:<name>`.

Set `VERIFY_MODE=check` or `VERIFY_MODE=fix` to choose the mode yourself.

## Monorepos

When packages in a monorepo keep their own `verify:*` scripts in `package.json`, list their folders in `verify.roots`. Verify then runs a package's scripts when files under it change.

```bash
assist config set verify.roots packages/api,packages/web
```
