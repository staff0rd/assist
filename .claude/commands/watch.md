---
description: Watch for new commits on the remote and auto-build each time the branch moves
---

Watch this repo for new upstream commits and build them as they land.

Run `assist watch wait --pull --build` as a **background task**. It blocks until the current branch's upstream actually moves, then pulls, prints the build report, builds, and — when the pulled commits touched the files `assist sync` installs — syncs `~/.claude` with the freshly built binary, so no agent turn runs while the branch is quiet. You are re-invoked when the process exits, not on a clock tick. Takes no arguments; ignore any that were passed.

Say you are watching, then stop. Do not poll the background task or do anything else while it runs.

When it exits, branch on the exit code:

- **0** — the upstream moved, was fast-forwarded, built and (if needed) synced. Echo the command's report verbatim, then run `assist watch wait --pull --build` in the background again.
- **4** — the build or the post-build sync failed. Report the failing output, then run `assist watch wait --pull --build` in the background again.
- **3** — the branch has genuinely diverged (local commits not on the remote, a rebase or merge in progress, conflicts). Report git's reason and stop. Never force or reset.
- **1** — cannot wait at all (no upstream, detached HEAD, not a repo). Stop.
- **130** — user interrupt. Stop. A killed or torn-down task is not an interrupt — start a new wait.

## If the daemon restarts mid-wait

Restarting the sessions daemon kills this session's processes, the background wait included, and then resumes this conversation with a message naming the restart and the task ids it killed. That is not a stop — the wait never reported an exit code, and nothing was pulled or built. Run `assist watch wait --pull --build` in the background again. An assist auto-update restarts the daemon on its own, so a lap that builds a new assist ends this way routinely.

## Why the pull is part of the wait

`auto-build` compiles the working tree — it does not fetch or pull. A watch that only detects movement will rebuild the same stale source indefinitely: the build passes, the version in the browser never changes, and the branch silently falls further behind. `--pull` is what makes detect-then-build mean anything.

## Why the sync comes last

The report's **Sync** section names what the pulled commits changed under the paths `assist sync` installs (`claude/commands/`, `claude/skills/`, `claude/settings.json`, `claude/CLAUDE.md`, `claude/design-system-prompt.md`, `codex/`, `pi/`), or `- not needed`. When it names something, `assist sync --yes` runs as a separate process after the build, so the newly built binary — not the long-running pre-pull one — installs the files. Nothing in that set touched means no sync runs.
