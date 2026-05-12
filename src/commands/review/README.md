# `assist review`

Orchestrates two independent LLM code reviewers (Claude and Codex), consolidates their findings into a single synthesis, and posts the result as pending line comments on the current PR.

## End-to-end flow

```mermaid
flowchart LR
    Diff[Branch diff] --> Request[Review request]
    PriorComments[Prior PR comments] --> Request
    Request --> Claude[Claude reviewer]
    Request --> Codex[Codex reviewer]
    Claude --> Synthesis[Synthesis]
    Codex --> Synthesis
    Synthesis --> Post[Post as pending comments]
    Post --> Submit[Submit review on PR]
```

## Key files

- `review.ts` — entry point; wires context, paths, prior comments, pipeline, and posting.
- `gatherContext`, `buildReviewPaths` (in `buildRequest.ts`, `buildReviewPaths.ts`) — derive the working set.
- `fetchExistingComments.ts` — pulls PR review comments via REST (`--paginate`) and enriches them with thread IDs / resolved state via GraphQL. Returns `null` when no PR exists.
- `formatPriorComments.ts` — groups comments into threads (by `threadId`, falling back to `inReplyToId`) and renders the `## Prior review comments` section.
- `buildRequest.ts` — assembles `request.md` (branch metadata, changed files, optional prior comments, unified diff).
- `runReviewers.ts` — runs Claude and Codex in parallel. Skips a reviewer when its output file already exists (caching across re-runs).
- `synthesise.ts` / `buildSynthesisStdin.ts` — consolidates the two reviews. The synthesis prompt defines the `Source` enum including `already-raised` for findings substantively covered by a prior comment.
- `parseFindings.ts` / `partitionFindings.ts` — parse `synthesis.md` and split findings into `lineBound`, `unlocated`, and `alreadyRaised` buckets.
- `postReviewToPr.ts` / `postAndMaybeSubmit.ts` / `postFindings.ts` — post line-bound findings as pending comments and optionally submit the review.

## Re-running on the same PR

The review directory is keyed by `branch-shortSha`, so re-running with no new commits hits the same folder. Existing `claude.md` / `codex.md` / `synthesis.md` are reused unless `--force` is passed. Findings the synthesis tags as `already-raised` (because they overlap with prior comments fetched in step 4) are filtered out before posting, so a second run on an unchanged PR posts zero new comments.

## `--refine`

`assist review --refine` runs the pipeline up through synthesis and then, instead of posting, launches an interactive Claude session (`runRefineSession.ts`) with `synthesis.md` open. The agent investigates each finding, walks the user through it, and edits `synthesis.md` in place — dropping, editing, or appending blocks using the format `parseFindings.ts` expects.

Because the file is edited in place, a subsequent `assist review` (no flag) hits the cached `synthesis.md` via `cachedReviewerResult` and posts only the surviving / appended findings as pending comments. `--force` re-runs the pipeline before refining; `--submit` is ignored when `--refine` is set because nothing is posted in the refine step itself.

```mermaid
flowchart LR
    Synthesis[synthesis.md] --> Refine[--refine: interactive Claude edits file]
    Refine --> Next[next assist review]
    Next --> Cached{cached synthesis.md}
    Cached --> Post[Post surviving findings]
```
