# Parallel work: principles

Run several assist sessions on the same repo at once, without having to remember
where you are or where any in-progress changes live. The tool tracks that; you don't.

## 1. Concurrent sessions are isolated automatically

- A second session on `<repo>` lands on `<repo>-2`, a third on `<repo>-3`, and so on.
- Each is a fully independent working copy — one session's edits never touch another's.
- You never choose, name, or manage these. You start a session on the repo; the tool
  places it.
- A workspace counts as free once nothing live is working in it and it holds nothing
  unlanded. A finished card left sitting on the board does not push the next session
  somewhere new — it reuses the workspace it is standing in.
- A repo reads as **one place** wherever you pick or browse it. The repo selector and
  the history list show it once — its own working copy and every `<repo>-N` workspace
  under the same remote — and sessions that ran in a workspace since cleaned away are
  still listed there, under the repo they belong to.
- Checking out someone else's PR — to review it, or to work through its comments —
  is placed the same way, and it never takes over a workspace that holds work in
  progress. A workspace is only reused for a checkout when it holds nothing
  unlanded, so whatever you had going is left exactly where it was; otherwise the
  PR gets a workspace of its own.
- Only work that changes code needs a workspace. Drafting, filing a bug and refining
  an item touch no code, so they run in the repo's own working copy — even while
  something else is working there — and are never given a workspace of their own, nor
  charged the wait to set one up. If one of them carries on into a coding run, **that**
  is when the run is placed, and it is placed like any other session.
- Isolation is per session, not per task. The same piece of work is never started
  twice: ask to run a backlog item that already has a live run and the tool
  **refuses and points at the run that holds it**, rather than isolating a duplicate
  into another workspace where two agents land the same phase.

## 2. A stream can hold more than one agent

- New sessions get their own stream (see 1), but you can spawn a plain prompt into an
  **existing** one to add another agent to work already there.
- This is opt-in — the default is always a fresh isolated stream.
- An added agent works in **that stream's workspace**; none is placed or created for
  it, so it picks up exactly the work in progress there.
- A stream can only take another agent while it is still working. One that has
  finished, stopped, or is being torn down is not joined; asking anyway gets the
  default — a fresh isolated stream.

## 3. Work is never lost — or lost track of

- In-progress work is **never discarded** while it still holds changes that aren't
  safely landed.
- **Closing a session that has unpushed changes only stops it** — it is killed but
  stays on the board in a `stopped` state, card still visible. While it holds unpushed
  changes the only actions are **resume**, **restart**, or an explicit **discard**.
- This applies to **whichever workspace the session is in**, the repo's own working
  copy included. A session there is stopped rather than closed away too; its workspace
  is of course never removed, only the card is at stake.
- Only the **last** session holding a workspace is stopped this way. Close one of
  several agents sharing a workspace and its card simply goes — the work is still
  held by the others.
- Closing many at once (a bulk drain) is still an explicit close: it says what is
  live before it acts, and holds whatever isn't landed.
- Discard is the one sanctioned way to lose work: it is never automatic, never a
  side effect of closing or completing, and always takes a confirmation that names
  what is about to be destroyed — the workspace and its work where that is what goes,
  or just the card where nothing on disk is touched.

## 4. Cleanup happens only at end of life

- A workspace is only ever removed when the last card holding it reaches **done** or
  the user closes it — **never** while a backlog run moves between phases, regardless
  of push state, and never while another session is still working there.
- End of life means the **stream** is over, not that a command in it finished. A card
  that carries straight on into more work keeps its workspace, so the work that
  follows continues where the last one left off — a drafted item picked up by
  auto-run, or a run continuing to its next phase.
- Even then it is removed only if nothing is unpushed; otherwise it stops (see 3).

## 5. Recovery is automatic — never manual

- If the system breaks down or leaves stray state behind, **the tool cleans up after
  itself** — recovering never means removing or pruning workspaces by hand.
- A workspace whose session died with it — a crash, a kill, a reboot — is picked back
  up on the next start: one holding nothing is cleaned away silently, one still
  holding unlanded work **comes back as a visible stopped card** with the actions from 3. It is watched from then on, so it clears itself the moment the work lands.
- What can't be determined is never guessed. A workspace already gone from disk holds
  nothing and pins no card; one whose state can't be read says so, rather than being
  reported as work you don't have.

## 6. Configuration

Two per-repo settings, both **default off**:

- **Parallel work on/off** — off by default. Off means all sessions on the repo share
  its single working copy; there is no `<repo>-N` isolation.
- **Trunk-based on/off** — off by default. Off means work lands on a branch: a workspace
  starts from the remote default with no mainline tracking and the session raises its own
  branch and PR. On means it lands straight on the mainline. The switch also settles what
  a commit does on a branch whose upstream is a differently-named remote branch: on, that
  tracking is deliberate and the commit is pushed there; off, it is git's own doing when a
  branch was cut from the mainline, so the commit is pushed to the branch's own remote
  branch and never onto the mainline.

One further per-repo switch, also **default off**: whether draft-type work gets its own
workspace. Off is the behaviour in 1 — drafting, bug filing and refining stay in the
repo's own working copy; on, they are placed like any other session.

Turning either on and back off again leaves **no trace on the repo**. Neither writes
settings into the repo's own git configuration, so how the repo pushes when you work in
it by hand is never changed underneath you.
