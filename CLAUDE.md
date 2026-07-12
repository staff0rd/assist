When asked to commit, use conventional commits: `fix:` (patch), `feat:` (minor), `feat!:` (major).

When adding, editing, or removing CLI or Claude commands, update README.md to reflect the change. Also add read-only commands to the allow list in `claude/settings.json`.

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

The `verify:config-keys` check enforces this: it fails when a leaf key in `assistConfigSchema` is surfaced by no command, or when a declared key is not in the schema. When adding a new config key, surface it with `configHelp` (and remove it from `pendingConfigDocumentation` in `src/commands/verify/pendingConfigDocumentation.ts` if listed there) so the check passes.

## Sessions daemon log

The sessions daemon writes its stdout/stderr (every `daemonLog` call) to `~/.assist/daemon/daemon.log`. On WSL the Windows-host daemon logs to `C:\Users\<you>\.assist\daemon\daemon.log` on the Windows side. When debugging daemon, Windows-proxy, or session behaviour, read this log first. Paths come from `daemonPaths` in `src/commands/sessions/daemon/daemonPaths.ts`.

The web server tails this same stream: it keeps a dedicated `subscribe-logs` connection (`web/streamDaemonLogs.ts`) that echoes every daemon line — both WSL and Windows-host (tagged `[windows]`) — to its own stdout, so `assist.log` shows the daemon's logs plus the web server's own output. The project-switch tray (`/mnt/c/git/project-switch`) launches that server with stdout/stderr redirected to `%LOCALAPPDATA%\project-switch\assist.log` (WSL path `/mnt/c/Users/<you>/AppData/Local/project-switch/assist.log`), which is what its "View logs" item tails. `assist.log` is therefore a superset of `daemon.log` plus web-server stdout.
