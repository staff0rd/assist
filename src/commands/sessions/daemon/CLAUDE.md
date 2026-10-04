# Sessions daemon

## Every daemon operation MUST be logged

There is no central logging chokepoint in this daemon. `daemonLog()` (`daemonLog.ts`) is a thin `console.log` wrapper, and logging is opt-in per call site — a line reaches `daemon.log` only if someone explicitly added a `daemonLog(...)` call there.

This has burned debugging before: `assist daemon drain` killed every pty, deleted every session, and rewrote `sessions.json` to empty while emitting **nothing**, so the log gave no evidence the drain ever happened.

Rule: any operation that mutates daemon state or acts on a session MUST emit a `daemonLog` line. This covers, at minimum:

- Every inbound message handler in `messageHandlers.ts` (`drain`, `dismiss`, `input` is high-volume — see exception below, `resize`, `retry`, `create*`, `resume`, `set-status`, `set-autorun`, `set-autoadvance`, `shutdown`).
- Session lifecycle mutations: spawn, restore, status change, dismiss, drain, error.
- Persistence writes (`persistLiveSessions` / `savePersistedSessions`): what was saved and how many.
- Node link routing decisions, forwards and drops, WebSocket connect/close/reconnect with reason, `hello` outcome, breaker trips, state changes and heal steps (`links/`, prefixed `link <name> ws:` / `link <name> heal:`).

Log enough to reconstruct the sequence after the fact: include the session id/name and the relevant count or reason. Prefer logging at the daemon-side handler (where the action actually happens) over the client command, so it is captured regardless of who triggered it.

Exception: genuinely per-keystroke, high-frequency operations (`input`) may be summarised or sampled rather than logged per call, but the absence must be deliberate, not accidental.

## Where the logs go

- `daemonLog()` output → `~/.assist/daemon/daemon.log` or `C:\Users\<you>\.assist\daemon\daemon.log` on a native Windows node. See `daemonPaths.ts`.
- `daemonLog()` output is _also_ forwarded to log subscribers (the web server's dedicated `subscribe-logs` connection in `web/streamDaemonLogs.ts`), so every daemon line reaches the web-server stdout (project-switch `assist.log`) too. A bounded ring buffer (`daemonLog.ts`) is replayed on subscribe so startup lines aren't lost. A linked node's lines arrive over its link's `subscribe-logs` and are relayed tagged `[<node>]` via `relayDaemonLog`, which marks them relayed so `ClientHub` never sends them on to a peer. This is the single unified stream — there is no separate web-server lifecycle logger.
