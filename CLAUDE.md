When asked to commit, use conventional commits: `fix:` (patch), `feat:` (minor), `feat!:` (major).

When adding, editing, or removing CLI or Claude commands, update README.md to reflect the change. Also add read-only commands to the allow list in `claude/settings.json`.

## Config

Config is stored in `.claude/assist.yml` or `assist.yml`, validated with Zod. To add or change a config key:

1. Update the schema in `src/shared/types.ts` (`assistConfigSchema`)
2. Use `loadConfig()` from `src/shared/loadConfig.ts` to read values where needed

## Sessions daemon log

The sessions daemon writes its stdout/stderr (every `daemonLog` call) to `~/.assist/daemon/daemon.log`. On WSL the Windows-host daemon logs to `C:\Users\<you>\.assist\daemon\daemon.log` on the Windows side. When debugging daemon, Windows-proxy, or session behaviour, read this log first. Paths come from `daemonPaths` in `src/commands/sessions/daemon/daemonPaths.ts`.

Note a separate stream: the **web server** logs session lifecycle events (`session started` / `session ended`, from `createSessionLifecycleLogger.ts`) via raw `console.log`, _not_ `daemonLog` — so they never reach `daemon.log`. They land in the web-server process's stdout. The project-switch tray (`/mnt/c/git/project-switch`) launches that server with stdout/stderr redirected to `%LOCALAPPDATA%\project-switch\assist.log` (WSL path `/mnt/c/Users/<you>/AppData/Local/project-switch/assist.log`), which is what its "View logs" item tails. If a symptom is in "View logs" but absent from `daemon.log`, check `assist.log`.
