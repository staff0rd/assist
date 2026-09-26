When asked to commit, use conventional commits: `fix:` (patch), `feat:` (minor), `feat!:` (major).

When adding, editing, or removing CLI or Claude commands, update README.md to reflect the change. Also add read-only commands to `allowed.cli-reads`.

## Asking the user to test

When asking the user to manually test a change, advise whether the **web server**, the **daemon**, or both need to be restarted for the change to take effect (and remind them to reload the browser for frontend changes):

- Frontend / web UI code (`src/commands/sessions/web/ui/`) ships in the React bundle — restart the web server to serve the rebuilt assets, then hard-reload the browser tab.
- Server-side session/daemon code (anything reached by the daemon, e.g. `parseSessionFile`/`discoverSessions` via `daemon/lifecycleHandlers.ts`) is held in memory by the running daemon — restart the daemon to pick it up.

## Config

Config is stored in `.claude/assist.yml` or `assist.yml`, validated with Zod. To add or change a config key:

1. Update the schema in `src/shared/types.ts` (`assistConfigSchema`)
2. Use `loadConfig()` from `src/shared/loadConfig.ts` to read values where needed

### Surfacing config keys in --help

Every command that reads config keys must document them in its `--help` via the `configHelp(command, entries)` helper (`src/shared/configHelp.ts`). Each entry names the key, its setter (an `assist config set <key> ...` line for scalar knobs, or a dedicated command like `assist sql auth` for connections/secrets), and a short note. See `src/commands/registerBranch.ts` for the reference example.

Entries live in a `<area>ConfigHelp.ts` data module next to the command (e.g. `src/commands/branch/branchConfigHelp.ts`), never inline in the `register*.ts` file. Every such module must be spread into `configHelpEntries` in `src/commands/configHelpEntries.ts`, which is what lets the web `/config` page show each key's note and setter without loading the command modules.

The `verify:config-keys` check enforces this: it fails when a leaf key in `assistConfigSchema` is surfaced by no command, when a declared key is not in the schema, or when the keys registered by commands and the keys in `configHelpEntries` disagree. When adding a new config key, surface it with `configHelp` (and remove it from `pendingConfigDocumentation` in `src/commands/verify/pendingConfigDocumentation.ts` if listed there) so the check passes.

## Sessions daemon log

The sessions daemon writes its stdout/stderr (every `daemonLog` call) to `~/.assist/daemon/daemon.log` (`C:\Users\<you>\.assist\daemon\daemon.log` for a native Windows node). When debugging daemon, link, or session behaviour, read this log first. Paths come from `daemonPaths` in `src/commands/sessions/daemon/daemonPaths.ts`.

Each linked node's daemon lines stream over its link and are relayed into this log tagged `[<node>]` (never re-exported to other peers); link lifecycle lines are prefixed `link <name> ws:` / `link <name> heal:`. `assist sessions nodes` shows each link's state and last error.

The web server tails this same stream: it keeps a dedicated `subscribe-logs` connection (`web/streamDaemonLogs.ts`) that echoes every daemon line — including relayed `[<node>]` lines — to its own stdout, so `assist.log` shows the daemon's logs plus the web server's own output. The project-switch tray (`/mnt/c/git/project-switch`) runs a list of web servers (`webservers` in `~/.project-switch.yml`), each `wsl` or `native` — on the PC `pc-wsl` (3100, in WSL) and `pc-windows` (3101, native Windows, which starts the Windows daemon itself). Each has its stdout/stderr redirected to `%LOCALAPPDATA%\project-switch\assist-<name>.log` (WSL path `/mnt/c/Users/<you>/AppData/Local/project-switch/assist-<name>.log`; the legacy single `webserver` key logs to `assist.log`), which is what its "View logs" item tails. Each such log is therefore a superset of its node's `daemon.log` plus web-server stdout.

## Rules

- **R1** — Do not document what is implicit — state only what the reader could not infer.
