---
description: Recall context from the most recent prior session in this repo
---

Summarise the most recent **prior** Claude Code session for this working directory, so the current session can pick up where it left off. Always operate on the current working directory; do not ask which repo to recall.

## Step 1: Locate the prior session JSONL

Sessions are stored under `~/.claude/projects/<encoded-cwd>/`, where `<encoded-cwd>` is the absolute current working directory with every `/` replaced by `-` (e.g. `/home/me/git/foo` → `-home-me-git-foo`).

1. Compute `<encoded-cwd>` from the absolute path of the current working directory. Do not hard-code a path — derive it.
2. List `*.jsonl` files in that directory, newest-first by mtime.
3. Walk the list and pick the **first** file that satisfies all of:
   - It is **not** the current session's JSONL (the current session id is in `$CLAUDE_SESSION_ID` if set, or matches the JSONL whose tail you would actively be appending to right now — when in doubt, skip the newest if it could be this session).
   - It is **not** an sdk-cli-only transcript. A transcript is sdk-cli-only when every `type:"user"` entry with text content has `"entrypoint":"sdk-cli"`. If at least one `type:"user"` entry has `"entrypoint":"cli"` (or any value other than `sdk-cli`), the transcript counts as a real interactive session and is eligible.

If no eligible prior session exists, emit:

```markdown
# Recall

No prior session found for this directory.
```

…and stop.

## Step 2: Emit the # Recall block

Read enough of the chosen JSONL to understand what the previous session was working on (recent human user turns are the highest signal — skip tool results and assistant messages). Then emit a single `# Recall` block directly in chat. **Do not write any file.**

Use this structure:

```markdown
# Recall

**Previous session:** <one-line summary of what the prior session was doing>

**Key points:**
- <bullet> — what was happening, decisions made, or where it stopped
- <bullet>
- <bullet>

**Suggested next step:** <one concrete thing to do now, or "—" if unclear>
```

## Guidelines

- Always operate on the current working directory — never guess or substitute another repo.
- Keep the summary terse. The user is reading it cold at the start of a new session.
- Prefer concrete file paths, command names, and backlog IDs over vague descriptions.
- If `.assist/HANDOVER.md` exists, the SessionStart hook will already have surfaced it — `/recall` complements that by pulling context from the prior transcript, not the handover file.
- Do not modify any files. `/recall` is read-only.
