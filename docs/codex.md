# Codex harness gaps

Running notes on where the Codex CLI differs from Claude Code in ways that
affect `assist`, and how much each one hurts. Added as part of making Codex a
first-class harness (backlog `a667`). Verified against `codex-cli 0.133.0`.

Severity reflects impact on our workflows, not Codex's roadmap.

| Gap                                     | Severity   | Impact on us                                                                                                                                                                                                                                                                                                     | Mitigation / workaround                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No command auto-approval classifier** | High       | Codex has no equivalent to Claude Code's built-in safe-command classifier, so it prompts for approval on commands Claude would auto-run. Without help, every tool call in a tracked Codex session stalls on approval.                                                                                            | `assist codex-hook` (a `PreToolUse`/`PermissionRequest` hook, synced into `~/.codex/config.toml`) auto-approves our read-only allowlist — the same allowlist the Claude `cli-hook` uses. Residual: anything outside the allowlist still prompts.                                                                                                                            |
| **Hooks must be trusted per machine**   | Low–Medium | A hook registered in `config.toml` is _configured but untrusted_; Codex refuses to run it until it has been trusted interactively once, and stores that trust in its per-machine sqlite state DB. So `assist codex-hook` requires a one-time "trust this hook?" approval on the first Codex run on each machine. | One-time and self-healing (persists after approval; re-prompts only if the hook command string changes). No supported way to pre-seed trust: `hooks_trust` / `trust_all_hooks` config keys are rejected, and inline `trusted` / `trusted_hash` on the handler are silently ignored. The launch-only escape hatch is `--dangerously-bypass-hook-trust` (not currently used). |
| **No user-defined slash commands**      | Low        | Codex CLI has no `/name` custom-command mechanism (file-based `/prompts:<name>` is ChatGPT-desktop only). Our synced commands can't be invoked as `/refine` the way they are under Claude.                                                                                                                       | Commands are synced as Codex _skills_ (`~/.codex/skills/<name>/SKILL.md`) and invoked by name — `$refine` or plain text matching the skill description. Verified working.                                                                                                                                                                                                   |

## Hook wire contract (for reference)

Decompiled from the 0.133.0 binary's embedded JSON schema. `assist codex-hook`
emits these shapes:

- **PreToolUse** — allow: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"…"}}`; block: `{"decision":"block","reason":"…"}`.
- **PermissionRequest** — `{"hookSpecificOutput":{"hookEventName":"PermissionRequest","decision":{"behavior":"allow"|"deny","message":"…"}}}`.
- Unrecognised command → no output, so Codex falls through to its normal approval flow.

Codex mirrors Claude's hook input schema (`hook_event_name`, `tool_name`,
`tool_input.command`, `tool_use_id`), which is why the same allowlist logic
serves both harnesses.
