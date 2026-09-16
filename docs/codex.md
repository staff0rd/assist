# Codex harness gaps

Running notes on where the Codex CLI differs from Claude Code in ways that
affect `assist`, and how much each one hurts. Added as part of making Codex a
first-class harness (backlog `a667`). Verified against `codex-cli 0.133.0`.

Severity reflects impact on our workflows, not Codex's roadmap.

## Backlog run sandbox

`assist backlog run <id> --harness codex` launches Codex with
`--sandbox workspace-write` by default. Passing `--no-write` launches it with
`--sandbox read-only`; an explicit `--write` selects `workspace-write`.

| Gap                                     | Severity   | Impact on us                                                                                                                                                                                                                                                                                                     | Mitigation / workaround                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No command auto-approval classifier** | High       | Codex has no equivalent to Claude Code's built-in safe-command classifier, so it prompts for approval on commands Claude would auto-run. Without help, every tool call in a tracked Codex session stalls on approval.                                                                                            | `assist codex-hook` (a `PreToolUse`/`PermissionRequest` hook, synced into `~/.codex/config.toml`) auto-approves our read-only allowlist — the same allowlist the Claude `cli-hook` uses. Residual: anything outside the allowlist still prompts.                                                                                                                            |
| **Hooks must be trusted per machine**   | Low–Medium | A hook registered in `config.toml` is _configured but untrusted_; Codex refuses to run it until it has been trusted interactively once, and stores that trust in its per-machine sqlite state DB. So `assist codex-hook` requires a one-time "trust this hook?" approval on the first Codex run on each machine. | One-time and self-healing (persists after approval; re-prompts only if the hook command string changes). No supported way to pre-seed trust: `hooks_trust` / `trust_all_hooks` config keys are rejected, and inline `trusted` / `trusted_hash` on the handler are silently ignored. The launch-only escape hatch is `--dangerously-bypass-hook-trust` (not currently used). |
| **No user-defined slash commands**      | Low        | Codex CLI has no `/name` custom-command mechanism (file-based `/prompts:<name>` is ChatGPT-desktop only). Our synced commands can't be invoked as `/refine` the way they are under Claude.                                                                                                                       | Commands are synced as Codex _skills_ (`~/.codex/skills/<name>/SKILL.md`) and invoked by name — `$refine` or plain text matching the skill description. Verified working.                                                                                                                                                                                                   |

## Resuming a Codex session

`codex resume [SESSION_ID|name] [PROMPT]` takes an explicit UUID (with `--last`,
`--all` and a sibling `codex fork`), and its optional prompt is the equivalent of
the resume nudge we pass Claude — so resume needs no workaround. The one thing
Codex has no flag for is pre-assignment: Codex mints the id itself, so there is
no `--session-id` to fix up front the way `spawnClaude` does, and a launched
session has no id to record until we look it up.

Two ways to look it up, both against `codex-cli 0.145.0`:

1. **Rollout file on disk (primary).** Every session writes
   `~/.codex/sessions/YYYY/MM/DD/rollout-<ISO-8601>-<session_id>.jsonl`, whose
   first line is a `session_meta` record carrying `session_id`, `cwd`,
   `originator` (`codex-tui` for the TUI the daemon spawns, `codex_exec` for
   `codex exec`), `cli_version` and `timestamp`. Matching on cwd plus a
   spawn-time window resolves the id with no unsupported flags, and the same file
   is the transcript for history and the token source for usage. `codex exec`
   additionally prints `session id: <uuid>` in its header; the TUI does not.
2. **Hook payload (secondary).** Codex hook input carries `session_id`,
   `turn_id`, `transcript_path` and `cwd`, and the event list includes
   `SessionStart`/`SessionEnd`, so `assist codex-hook` could report the id via
   the activity file on the first event. Unverified end-to-end here: hooks did
   not fire in an isolated `CODEX_HOME` test, and trust is per-machine, so this
   is a follow-up rather than the load-bearing path.

Route 1 is what the daemon's Codex resume path is built on: resolve the id after
spawn, record it like any other conversation id, then `codex resume <id> "<nudge>"`
for restart and restore. The resolved id is stable: `codex resume <id>` appends to
the **same** rollout file and keeps the same `session_id` (verified on 0.145.0 by
resuming a session and watching the file grow with no new file created), so a
session only needs binding once no matter how many times it is resumed.

The id is stored on the session as `harnessSessionId`, additively — Claude keeps
using `claudeSessionId`, which stays the Claude-only field the transcript watcher,
title generation and usage recording key off. Resolution matches on `cwd` plus a
spawn-time window; two Codex sessions started in the same directory within the
same second are the one case that could bind to the wrong rollout (Claude avoids
this with `--session-id`, which Codex has no equivalent for).

## History and transcripts

`~/.codex/sessions` is discovered alongside `~/.claude/projects`, gated on the
directory existing. Each rollout becomes a history card with `harness: "codex"`
(the badge, chips and resume action come from that field), named after the first
`event_msg`/`user_message` in the file.

Transcripts are parsed by a Codex-specific adapter, not the Claude JSONL parser:

| Rollout record                                          | Transcript message                         |
| ------------------------------------------------------- | ------------------------------------------ |
| `event_msg` / `user_message`                            | user                                       |
| `event_msg` / `agent_message`                           | assistant                                  |
| `response_item` / `function_call` \| `custom_tool_call` | tool (target from `cmd`/`command`/`input`) |

The conversation is read from the `event_msg` stream rather than the
`response_item` messages, because the latter replay the whole system prompt and
`AGENTS.md` as `developer`/`user` messages on every turn. Claude's discovery and
parser are untouched; `parseTranscript` tries the Claude lookup first and only
falls back to a rollout when no Claude transcript matches the id.

## Session status (running / waiting)

Claude drives session status from the daemon's own `--settings` hook file
(`ensureHooksSettings.ts`), which is per-launch and never touches the user's
config. Codex has no `--settings` equivalent, so status rides the same
user-level hook that already does auto-approval: `assist codex-hook`, registered
from `codex/config.toml` and merged into `~/.codex/config.toml` by `assist sync`.
One command handles every event, so no extra hook (and no extra trust prompt) is
needed.

Event → status, mirroring the Claude mapping:

| Codex event                        | Reported status                           |
| ---------------------------------- | ----------------------------------------- |
| `UserPromptSubmit`                 | `running` (source `prompt`)               |
| `PreToolUse` / `PostToolUse`       | `running` (source `pretool` / `posttool`) |
| `PermissionRequest` we auto-decide | `running` (source `permission`)           |
| `PermissionRequest` we pass on     | `waiting` (source `permission`)           |
| `Stop`                             | `waiting` (source `stop`)                 |

Every report uses `set-status --ack` (the retrying, acknowledged delivery path),
unlike Claude, which only acks its waiting transitions. Best-effort delivery from
a short-lived hook process is unreliable: the client writes one line and
immediately half-closes, which races the daemon's greeting write on the same
connection, and the queued line is dropped when that write errors. Measured from
the built CLI: 0 of 10 best-effort sends reached the daemon, 10 of 10 ack'd sends
did. Claude survives this because a turn fires many `pretool`/`posttool` hooks, so
some land; Codex fires roughly three status events per turn, so losing them left
the card stuck on `waiting`.

The undecided-`PermissionRequest` split is more precise than the Claude mapping,
which reports `waiting` for every permission request: under Codex we only report
waiting when the request actually falls through to the user. `done`/`error` still
come from pty exit, as they do for Claude — `wirePtyEvents` never infers status
from output for any harness.

Codex 0.145.0 has no `Notification` event (Claude does), so the only
waiting-without-a-stop signal is the permission fall-through above.
`set-status` is a no-op without `ASSIST_SESSION_ID`, so a Codex run in a plain
terminal reports nothing.

Caveat: the hook must be trusted once per machine (see the table above), and an
existing install needs `assist sync` to pick up the added events.

## Repo instructions

`assist sync` used to copy `claude/CLAUDE.md` to `~/.codex/AGENTS.md`, giving
every repo the same instructions. It no longer writes that file — and the shipped
`claude/CLAUDE.md` is gone. Instead `assist codex-hook` handles Codex's
`SessionStart` event and returns `hookSpecificOutput.additionalContext`, the
markdown `assist advise` composes for the session's repo from `claude/advice/*.md`.

Codex's `SessionStartHookSpecificOutputWire` carries exactly `hookEventName` and
`additionalContext`, so the payload is the same shape Claude Code's SessionStart
hook accepts and `adviceHookPayload` builds it for both. Codex sends no `cwd` in
the hook input on every event, so the hook falls back to its own process cwd,
which Codex sets to the session's directory.

The hook config supports an `additionalContextLimit` per handler; we do not set
one, so the default applies. The composed output is the thing to trim if that
ever bites — the `verify` fragment is the largest section.

## Hook wire contract (for reference)

Verified against the current Codex hook contract. `assist codex-hook` emits
these shapes:

- **PreToolUse** — allow: no output, so Codex continues to its permission flow; deny: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"…"}}`.
- **PermissionRequest** — `{"hookSpecificOutput":{"hookEventName":"PermissionRequest","decision":{"behavior":"allow"|"deny","message":"…"}}}`.
- **SessionStart** — `{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"…"}}`, carrying the markdown `assist advise` composes for the session's repo.
- Unrecognised command → no output, so Codex falls through to its normal approval flow.
- Status-only events (`UserPromptSubmit`, `PostToolUse`, `Stop`) → no output; the hook only pushes the session status.

Codex mirrors Claude's hook input schema (`hook_event_name`, `tool_name`,
`tool_input.command`, `tool_use_id`), which is why the same allowlist logic
serves both harnesses.
