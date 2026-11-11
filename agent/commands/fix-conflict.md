---
description: Resolve the current PR branch's merge conflicts against the remote default
---

Resolve the conflicts between this branch and the remote default branch, then push.

The branch is already checked out — `assist fix-conflict <number>` checks the PR out before launching this session. Never switch branches.

## Step 0: Pick the strategy

If the arguments contain `--rebase`, follow the **rebase** flow (Steps R1–R4). Otherwise follow the **merge** flow (Steps M1–M4).

Both flows start by finding the remote default branch:

```
git remote show origin | sed -n 's/.*HEAD branch: //p'
```

Call the result `<default>`. If it comes back empty, fall back to `git symbolic-ref --short refs/remotes/origin/HEAD` and strip the `origin/` prefix.

## Resolving a conflicted file

Both flows resolve conflicts the same way. List the conflicts with `git diff --name-only --diff-filter=U`, then work through them one at a time:

1. Read the file and understand both sides. `git log --oneline origin/<default>..HEAD` and `git log --oneline HEAD..origin/<default>` show what each side changed and why.
2. Write the resolution that keeps **both** intents. A conflict usually means two changes to the same region, not a choice between them — only drop a side when it is genuinely superseded.
3. Remove every conflict marker (`<<<<<<<`, `=======`, `>>>>>>>`).
4. `git add <file>`.

Handle the non-text cases explicitly:

- **Lock files** (`package-lock.json`, `pnpm-lock.yaml`): do not hand-merge. Take the default branch's version (`git checkout --theirs <file>`), then regenerate it with the project's install command and `git add` the result.
- **Delete/modify conflicts**: decide whether the deletion or the modification wins from the two logs, then `git rm <file>` or `git add <file>`.

Repeat until `git diff --name-only --diff-filter=U` is empty. Confirm no markers survived:

```
git grep -n '^<<<<<<< \|^>>>>>>> ' -- . || true
```

Note that during a rebase the sides are swapped: `--ours` is the upstream (`origin/<default>`) and `--theirs` is the commit being replayed.

# Merge flow

## Step M1: Fetch and merge

```
git fetch origin
git merge origin/<default>
```

If the merge reports "Already up to date" or completes cleanly with no conflicts, there is nothing to resolve — say so and stop. Do not push, do not create an empty commit.

## Step M2: Resolve every conflicted file

Follow **Resolving a conflicted file** above.

## Step M3: Verify

Run `/verify`. Fix anything it reports — a merge that compiles on each side can still break where the two changes meet, so treat failures as part of the conflict resolution rather than pre-existing breakage.

Do not proceed to Step M4 until verify passes.

## Step M4: Commit and push

```
git commit --no-edit
git push
```

`--no-edit` keeps git's generated merge message. Do not use `/commit` here — this is a merge commit, not a feature commit.

Report the resolved files and the pushed SHA when done.

# Rebase flow

## Step R1: Fetch and rebase

```
git fetch origin
git rebase origin/<default>
```

If the rebase completes with no conflicts, the branch is simply replayed — go straight to Step R3. If it reports the branch is already up to date and nothing was replayed, there is nothing to resolve — say so and stop without pushing.

## Step R2: Resolve conflicts one commit at a time

A rebase stops at each commit that conflicts. For every stop:

1. Read `git status` to see which commit is being replayed (`git log -1 --oneline REBASE_HEAD`).
2. Resolve the conflicted files following **Resolving a conflicted file** above, keeping that commit's intent intact — do not fold later commits' changes into an earlier one.
3. `git rebase --continue`.

If a replayed commit's changes have already landed upstream and it resolves to nothing, `git rebase --skip` is the right move — say which commit you skipped and why.

Repeat until the rebase finishes. `git status` no longer reporting a rebase in progress is the signal.

## Step R3: Verify

Run `/verify`. Fix anything it reports — a rebase that replays cleanly per commit can still break where the two histories meet, so treat failures as part of the conflict resolution rather than pre-existing breakage.

If a fix is needed, commit it on top rather than amending a replayed commit.

Do not proceed to Step R4 until verify passes.

## Step R4: Push

```
git push --force-with-lease
```

The rebase rewrote the branch's history, so a plain push is rejected. `--force-with-lease` is required and `--force` is not — the lease is what stops the push from clobbering commits someone else pushed while the session was running. If the push is rejected because the lease is stale, do not retry with `--force`: fetch, report what moved, and ask the user.

Report the resolved files, any skipped commits, and the pushed SHA when done.

## Important

- Never `git merge --abort`, `git rebase --abort`, or reset without being asked — the user launched this session to get the conflicts resolved.
- Never force-push on the merge strategy; a plain `git push` is correct because the merge only adds a commit.
- If a conflict genuinely cannot be resolved without a product decision, stop and ask the user rather than guessing.
