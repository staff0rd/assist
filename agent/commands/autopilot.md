---
description: Run one autopilot tick — judge the last run, then take the one next step
---

You are running one autopilot tick for this repo. Claude sets the direction and does the work; the user only approves and runs backlog items. Never ask the user to choose, rank or sign off a direction.

The generic loop is below. The repo's domain rules live in its context files (step 1): its goal, the alert kinds and what each one requires, the loop it uses to decide what to do next, and where the journal and strategy updates go. Wherever a step defers to the repo, follow those rules.

## 1. Load context

Run `assist config get autopilot.context` and read each listed file in full. If the repo keeps a journal, read only its newest three entries. Treat the decisions in these files as settled — do not re-ask them.

If `autopilot.context` is not set, read `CLAUDE.md` and say in the report that the key should be set (`assist config set autopilot.context <file>,<file> --repo`).

## 2. Gather state

Run these and keep the output:

- `assist backlog list` — items and their status.
- `assist autopilot last-run` — what the last finished run checked, decided and started, what it said the next run should do, and the backlog items it started.
- `assist backlog comments <id>` for each item the last run started, and for the most recently finished item if it is not one of them. Note every comment of the form "Check at <time>: …" — a check the run handed off to a later tick because it could not be made before the run ended.
- The status command from `assist config get autopilot.statusCommand`. Its output is the state you judge. If the key is not set, or the command fails because the thing it reports on isn't built or deployed yet, note that and move on.

## 3. Judge the last finished item

Take the most recently finished item (from step 2) and judge it against the current state:

- Its prediction: what it said would change. Did it?
- Each handed-off "Check at <time>: …" check whose time has passed: make the check now against the status output and record the verdict as an item comment, `assist backlog comment <id> "Checked <time>: <pass or fail> — <evidence>"`. A failed check is a finding for step 4.
- A check whose time has not come yet stays open: note it and its time for the next tick, and do not wait for it.

## 4. Take exactly one path

Pick the first that applies:

1. **An alert fired.** Any alert the repo's rules define, as shown by the status output, or a failed check from step 3. This comes before queued backlog items: an item being in progress or todo is not a reason to skip it. Diagnose it, then draft a fix with `/draft`, or amend the queued item that covers it with `/refine`, following what the repo's rules say each alert kind requires.
2. **A backlog item is in progress or todo** and no alert fired. Report which one and where it is up to (`assist backlog view <id>`). Do not run it yourself — the user approves and runs items. A queued item does not block a decided next step: if the journal or strategy already records a verdict naming the next item ("draft X once Y is in") and Y is done, draft X with `/draft` now so it queues behind.
3. **Nothing is queued.** Decide what to do next with the repo's decision loop: use the verdict from step 3, name what most limits progress toward the goal with evidence, then draft the cheapest change that relieves it with `/draft`. The item states what it relieves and its predicted effect, so a later tick can judge it. Problems seen that are not the one being relieved are noted in the journal, not drafted.

## 5. Improve the process

Run this every tick, whatever path was taken. Ask: did the user correct the direction or the process this session, or did this session (or the one before it, per the journal) waste time — waiting on something that could not pay off, re-asking a settled question, missing a problem the status command should have shown?

If yes, change the process so it cannot recur, not just note it:

- Prefer a code check: a new alert or field in the status command that makes the problem visible to step 2 and routes it to path 1. That needs a backlog item (`/draft`), since code changes go through the backlog.
- Otherwise edit the repo's context files directly in this session. Find why the existing guidance was missed (a conflicting or higher-ranked instruction, nothing enforcing it) and remove that cause rather than adding a sentence beside it.

If nothing needs changing, say so in one line of the record.

## 6. Record and report

Before ending, write what this tick learned or decided back to where the repo's rules say: the journal entry (path taken, the verdict from step 3, backlog ids created, the process change from step 5 or that none was needed), and any strategy or fact updates. Commit those changes with `assist commit`.

If this session is an autopilot run, record its summary:

```
assist autopilot summary --checked "<what you looked at>" --decided "<what you decided, and why>" --started "<items started, or none>" --next "<what the next tick should do, including open checks and their times>"
```

Each value is one short plain-English line: no tables, commit hashes, file or function names.

Then reply in a few lines: the state, the verdict on the last item, the path taken, and the one action the user should take next — with the exact command (e.g. `assist backlog run <id>`).
