---
id: cli-verify
title: assist verify and assist lint
group: CLI
order: 17
covers:
  - cli:verify list
  - cli:verify hardcoded-colors
  - cli:verify block-code-comments
  - cli:verify no-venv
  - cli:verify forbidden-strings
  - cli:verify config-keys
  - cli:verify advice-fragments
  - cli:verify harness-follow-ups
  - cli:verify migrations
  - cli:lint
  - cli:coverage
  - config:hardcodedColors.ignore
  - config:blockCodeComments.ignore
  - config:forbiddenStrings
---

`assist verify` runs a repo's checks; see [Verify](../verify/).

## Commands

- `assist verify list` lists the repo's `verify:*` checks.
- `assist lint` checks TypeScript conventions that oxlint doesn't: file names match what they export (PascalCase only for classes and components), imports are static, and relative imports have no file extension. `-f` renames misnamed files and updates their imports.
- `assist coverage` runs the Vitest tests with coverage and prints the overall statement coverage percentage.

## Built-in checks

These are ready-made checks to add as `verify:*` [run commands](../run-commands/), such as `assist run add verify:no-venv assist verify no-venv`.

- `assist verify hardcoded-colors` fails on hex colours in `src/`, so colours come from the theme. Exempt files with `hardcodedColors.ignore`:

  ```bash
  assist config set hardcodedColors.ignore "**/theme.ts"
  ```

- `assist verify block-code-comments` fails on any code comment on a changed line. Exempt files with `blockCodeComments.ignore`:

  ```bash
  assist config set blockCodeComments.ignore "**/*.test.ts"
  ```

- `assist verify no-venv` fails when the repo contains a Python `venv` folder.
- `assist verify forbidden-strings` fails when a value in a JSON file matches a disallowed glob. Each `forbiddenStrings` rule names a `file`, the dotted `paths` to read in it, and the `disallowed` glob:

  ```yaml
  forbiddenStrings:
    - file: appsettings.json
      paths:
        - ConnectionStrings.Default
      disallowed: "*Password=*"
  ```

- `assist verify migrations` fails when database migrations aren't numbered in sequence, when an existing migration was edited, or when one drops data without an acknowledgement marker.

### Checks for the assist repo

`assist verify config-keys`, `assist verify advice-fragments` and `assist verify harness-follow-ups` check assist's own source: that every config key is documented in some command's `--help`, that every shipped [repo instructions](../hooks-and-permissions/#repo-instructions) fragment can be named in `advice.sections`, and that every backlog item named as the follow-up for a feature a [harness](../harnesses/) doesn't support exists and is still open.
