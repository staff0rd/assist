# assist

A CLI tool for enforcing determinism in LLM development workflow automation.

See [devlog](https://staffordwilliams.com/devlog/assist/) for latest features.

## Installation

You can install `assist` globally using npm:

```bash
npm install -g @staff0rd/assist
assist sync
```

## Updating

```bash
assist update
```

## Local Development

```bash
# Clone the repository
git clone git@github.com:staff0rd/assist.git
cd assist

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .
```

After installation, the `assist` command will be available globally. You can also use the shorter `ast` alias.

## Claude Commands

- `/add-command` - Add a new run command to assist.yml
- `/add-rule` - Capture a new `CLAUDE.md` rule from a review comment
- `/branch <description> [--jira KEY]` - Create a branch off the fresh remote default, deriving a kebab-case slug from the description
- `/bug` - File a bug with reproduction steps, expected and actual behavior
- `/close` - Judge from the conversation alone whether the work is finished and nothing awaits the user, then run `assist sessions close`; otherwise report what is outstanding and leave the session running
- `/comment` - Add pending review comments to the current PR
- `/commit` - Commit only relevant files from the session
- `/devlog` - Generate devlog entry for the next unversioned day
- `/draft` - Draft a new backlog item with LLM-assisted questioning
- `/fix-conflict [--rebase]` - Resolve the current PR branch's conflicts against the remote default, verify, then push; merges by default, `--rebase` replays the branch and pushes with `--force-with-lease`
- `/fix-rules [dir]` - Put existing rules into the `## Rules` format `assist rules` reads
- `/forward-comments` - Split a coarse PR comment into per-line review comments, attributed to the original reviewer
- `/handover` - Write a session handover note for the next conversation
- `/pr` - Raise a PR with a concise description, then watch CI in the background
- `/prs-slack <number> [--no-confirm]` - Post a PR's title and URL to the Slack channel configured in `prs.slack`; `--no-confirm` skips the confirmation and posts straight away (used by chained announces)
- `/prs-status [channel] <owner/repo>...` - Post an overview of the open PRs across the named repos to Slack: a summary line in the channel, the PRs grouped by what they are waiting on in its thread; the channel falls back to `slack.channel`
- `/refactor` - Run refactoring checks for code quality
- `/prompts` - Analyze denied tool calls and suggest settings changes to auto-allow recurring prompts
- `/recall` - Recall the most recent handover note for this repo
- `/releases-configure` - Set this repo's release promotion topology: read its workflow files, follow every `uses:` reusable-workflow call to whatever depth it nests, flatten the `needs:` graph across those boundaries into nodes and edges, put the graph to the user to accept or edit, then write it with `assist releases configure --streams ...` to the project `assist.yml` or this repo's block in `~/.assist.yml`. The repo is the one you are in — it is never passed
- `/refine` - Refine an existing backlog item through conversation
- `/rename [title]` - Retitle this session's dashboard card via `assist sessions rename`; uses the argument verbatim, or infers a short title from the conversation when given none
- `/restructure` - Analyze and restructure tightly-coupled files
- `/review-config` - Set this repo's high-level review checklist keys: propose `review.highLevel.criticalPaths` and `uiPaths` from the repo's own tree with the files each glob matches, put them to the user to accept or edit, then write the accepted answers with `assist review --high-level --configure --answer ...` to the project `assist.yml` or this repo's block in `~/.assist.yml`
- `/review-pr-comments` - Process PR review comments one by one
- `/jira [action] [KEY] [args]` - Jira actions: `view`, `associate`, `update`, `started`, `done`, `help`. `[KEY]` is optional — it resolves from the session's backlog item
- `/github [action] [ref] [args]` - GitHub issue actions: `view`, `edit`, `associate`, `update`, `started`, `done`, `help`. `[ref]` is optional — it resolves from the session's backlog item. A bare `/github <ref>` runs `edit`, which opens the issue in the web preview pane; outside a web session the command prints the issue to chat instead
- `/journal` - Append a journal entry summarising recent work
- `/next [id]` - Signal completion and chain into the next backlog item
- `/slack-post [channel] [--thread <ts-or-permalink>] <what to say>` - Compose a markdown message, preview it in the web pane via `assist slack post`, then post the approved body to that Slack channel with the Slack MCP connector and report the permalink. The channel falls back to `slack.channel`; `--thread` posts the message as a reply in that thread. Asked for a thread of several messages, it composes all of them up front and previews the batch in a single `assist slack post --parts` call — a pane per message, in order — and posts nothing until every one is approved: the first message opens the thread and the rest follow under the `thread_ts` it returns, or all of them reply under the resolved `thread_ts` when `--thread` was given. A rejection posts nothing at all; the rejected message is revised in its working file and the whole batch re-previewed from the first message
- `/standup` - Summarise recent journal entries as a standup update
- `/subtask <text>` - Add a sub-task to the session's current backlog item
- `/strip-code-comments` - Strip redundant comments from tracked source files
- `/sync` - Sync commands and settings to ~/.claude
- `/design <prompt>` - Apply the vendored design system prompt to a design task
- `/test-cover` - Incrementally increase test coverage by identifying and testing uncovered files
- `/test-review` - Review existing tests for quality, coverage gaps, and conventions
- `/inspect` - Run .NET code inspections on changed files
- `/screenshot` - Capture a screenshot of a running application window
- `/raven` - Query and manage RavenDB connections and collections
- `/miro [board url | extract name]` - Dump a Miro frame's raw `board_list_items` pages and extract its boxes as an ordered YAML list via `assist miro extract`
- `/seq` - Query Seq logs from a URL or filter expression
- `/sql` - Query a MSSQL database via assist sql
- `/verify` - Run all verification commands in parallel
- `/verify-new` - Add a new verify:\* run command to assist.yml
- `/transcripts` - Format and summarise meeting transcripts end to end
- `/voice-setup` - Download required voice models (VAD, STT)
- `/voice-start` - Start the voice interaction daemon
- `/voice-stop` - Stop the voice interaction daemon
- `/voice-status` - Check voice daemon status
- `/voice-logs` - Show recent voice daemon logs

## CLI Commands

Every command supports `--help` for full detail on its flags and behaviour.

### Database

- `assist backup [-o, --out <dir>]` - Dump the entire backlog database to `<dir>/backup-<timestamp>.dump` (default `~/.assist/backups`, or `backup.dir`)
- `assist backup schedule --every <duration>` - Install or update a crontab block running `assist backup` on a cadence (e.g. `5m`, `6h`)
- `assist backup schedule status` - Print the active backup cadence and cron expression
- `assist backup schedule remove` - Remove the backup schedule block from the crontab
- `assist db migrate` - Apply pending backlog database migrations in order
- `assist db status` - Report whether the database is in sync with the build's bundled migrations

### Git and GitHub

- `assist sync [--prune] [--force]` - Copy commands, settings and design assets to `~/.claude` (plus `~/.codex` and `~/.pi` when those CLIs are on PATH). No global instructions file is written any more — `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md` and `~/.pi/agent/AGENTS.md` are all gone, and each harness instead receives the repo's composed advice at session start: Claude Code from the `assist advise --hook` SessionStart hook, Codex from `assist codex-hook` on its `SessionStart` event, and pi from the `assist-advice.ts` extension. Any of those three files an earlier sync left on disk is named on every run — sync never deletes them, since a hand-written one is indistinguishable from a leftover, but until they go they keep injecting the retired global instructions. With `--prune`, also lists commands in the target dirs that sync did not write — anything whose name is not in the repo's `claude/commands/*.md` set — and adding `--force` removes them. `~/.codex/skills` and `~/.pi/agent/prompts` are only inspected when those CLIs are detected; an orphaned codex skill directory is removed only when `SKILL.md` is its sole content, and any other is left in place with a reason. Subdirectories and non-`.md` files are listed separately and never removed. `--force` without `--prune` is an error
- `assist activity [--since <date>]` - Chart GitHub commit activity per day (defaults to last 30 days)
- `assist commit status` - Show git status and diff
- `assist commit <message> [files...] [--ref <ref>]` - Stage files and create a git commit with validation. The message must be a single line under 50 characters; `--ref` is the only way to give the commit a body. Each `--ref` value is free text containing a URL (e.g. `--ref "rationale for removing it https://…"`) and becomes one `Ref:` trailer line, verbatim — commas are not separators, so repeat the flag to pass several. A value carrying no `http`/`https` URL is rejected before anything is staged
- `assist branch <slug> [--jira <key>] [--from <ref>]` - Create and switch to a new branch off the fresh remote default (or `--from <ref>`); name is `[<prefix>/][<JIRA>-]<slug>`, long slugs shortened by LLM
- `assist watch wait [--interval <d>] [--timeout <d>|none] [--pull] [--build [entry]]` - Block until the current branch's upstream gains commits, then exit. Fetches once at startup, so commits already on the remote are picked up without waiting out an interval. `--timeout` defaults to `none`, so a quiet branch waits indefinitely rather than exiting 2. With `--pull`, fast-forwards (recovering a dirty tree or a merely-behind branch) and prints the build report (see `assist watch report`) baselined on the pre-pull SHA. With `--build`, runs the `auto-build` run entry — or `[entry]` if named — after a successful pull, then, when the report's **Sync** section names something, shells out to `assist sync --yes` so the freshly built binary installs the changed commands, skills and settings into `~/.claude`. Exit codes: `0` moved (and cleanly pulled, built and synced), `2` timed out on an explicit finite `--timeout`, `3` the branch has genuinely diverged, `4` the build or the post-build sync failed, `1` cannot wait, `130` interrupted
- `assist watch report [--from <sha>]` - Print the built version from `package.json`, the last 10 commits as a markdown SHA/When/Subject table newest-first, a **Restarts** section naming the restarts the new commits make necessary, and a **Sync** section naming what changed under the paths `assist sync` installs (`claude/commands/`, `claude/skills/`, `claude/settings.json`, `claude/design-system-prompt.md`, `codex/`, `pi/`), or `- not needed`. With `--from`, commits reachable from `HEAD` but not `<sha>` are marked `← new` and both the restart and sync advice come from the files they changed. Exit codes: `0` printed, `1` git could not resolve the range
- `assist read-time <target> [--budget <duration>]` - Estimate how long a document takes to read, printing e.g. `142 words · ~1m 39s read`. `<target>` is a pull request number, a GitHub pull request URL (which may point at another repo), `-` to read from stdin, or a path to a file; the current branch's PR is deliberately not a default. Prose counts at `readTime.wordsPerMinute` (default 200) and fenced code at half that, with a bare URL or an image/HTML tag counting as one word. The effective rate decays as the document grows, so a 500-word one reads at ~70 wpm and a 2000-word one at ~55. When the estimate exceeds the budget — one minute unless `--budget` (`45s`, `1m30s`, `2m`) says otherwise — `· over the ~1m budget` is appended
- `assist prs` - List pull requests for the current repository
- `assist prs status <owner/repo>... [--json]` - Report every open pull request across the named repos, grouped by repo. Each PR carries its number, title, url, author, draft, bot and `isDoNotMerge` flags — the last set when the title opens with `[DO NOT ...]` or `[DNM]` — `createdAt`/`updatedAt` with an age derived from `updatedAt`, the review decision and each latest reviewer's state, the failing and pending check names from the status check rollup, the mergeable/conflict state, and `unresolvedThreads` — the count of review threads still unresolved, `null` when that PR's thread query failed. Each PR also carries its `bucket` — `excluded` for a draft or do-not-merge title, otherwise the first of `pendingReview`, `changesRequested`, `failingChecks` or `readyToMerge` that matches — and `isStale` when untouched for 7+ days, and the payload's `summary` counts the repos read, the open PRs after exclusion, the excluded PRs, each bucket and the stale PRs. A repo that is not an `owner/repo` argument, is missing, or cannot be read is reported as an error entry beside the repos that succeeded, and the command still exits 0. `--json` emits the whole payload (`repos`, `errors` and `summary`) instead of the human listing
- `assist prs raise --title <t> --what <w> --why <y> [--how <h>] [--resolves <ref>] [--force] [--draft|--no-draft]` - Raise a PR, assembling the body from What/Why/How. Whether the PR is created as a draft comes from `prs.draft` unless `--draft` or `--no-draft` is passed, which always wins. In a web session the draft is previewed for approve/reject (with inline comments and pasted screenshots or video, hosted via the [`gh-image`](https://github.com/drogers0/gh-image) gh extension) before the PR is created. The preview pane carries two independent chain checkboxes, both default on: **Review PR** chains a `review --no-prompt --submit <n> --address-comments` session once the PR is raised (review → post findings → Address Comments), and **Post to Slack** announces the PR in Slack at the tail of that chain — or directly via `/prs-slack <n> --no-confirm` when Review PR is off. With both on, approving runs raise → Review PR + Post to Slack → Address Comments → Slack announce end to end. A third checkbox, **Auto-merge (squash)**, defaults off and is offered for both a new PR and an update to an existing one: approving with it ticked runs `gh pr merge --auto --squash` on the current branch's PR once it is placed, before the chain runs, and a repo that refuses auto-merge only prints a warning. It and **Draft** untick each other, since GitHub refuses auto-merge on a draft PR
- `assist prs edit [--title <t>] [--what <w>] [--why <y>] [--how <h>] [--resolves <ref>]` - Update only the supplied sections of the current PR's body. In a web session the resulting title and body are previewed for approve/reject first (with inline comments and pasted screenshots or video, as for `raise`); on approval the edit is applied with any screenshots appended, on rejection the reviewer's comments are printed and nothing is changed. Outside a session the edit applies directly
- `assist prs read-time <target> [--budget <duration>]` - Alias of `assist read-time`, kept because the estimate began as a pull request check
- `assist prs list-comments` - List all comments on the current branch's pull request
- `assist prs fixed <comment-id> <sha>` - Reply with commit link and resolve thread
- `assist prs wontfix <comment-id> <reason>` - Reply with reason and resolve thread. In a web session the reason is previewed for approve/reject first (with inline comments); on rejection nothing is posted, the reviewer's comments are printed and the command exits non-zero. Pass `-` as the reason to read it from stdin. A body containing markdown — backticks around identifiers, `$(...)`, `$VAR` — must be piped in rather than passed as an argument, or the calling shell expands it before assist sees it:

  ```bash
  assist prs wontfix 3718677497 - <<'EOF'
  Deferring to #197, which renames `query_duckdb` to `query_data`.
  EOF
  ```

- `assist prs reply <comment-id> <body>` - Reply to a comment thread without resolving it. In a web session the body is previewed for approve/reject first (with inline comments), as for `wontfix`. Pass `-` as the body to read it from stdin
- `assist prs comment <path> <line> <body>` - Add a line comment to the pending review. In a web session the comment is previewed for approve/reject first (with inline comments), headed `Comment on <path>:<line>`; nothing is posted until it is approved. Pass `-` as the body to read it from stdin
- `assist review [number]` - Run Claude and Codex in parallel to review the current branch's PR, then post line-bound comments. Findings post one at a time straight to the PR, without the preview pane that gates an agent-authored `prs comment`. The diff comes from GitHub, so stale local base branches don't pollute the review; cached `claude.md` / `codex.md` / `synthesis.md` are reused when present. Everything the run prints is also appended to `review.log` in the review folder — the terminal lines verbatim, with each spinner line in the state it finished in — so a run that failed inside a session whose card has since been reaped can still be read back
  - `[number]` - `gh pr checkout <number>` first, placed by the worktree allocator on a repo with parallel work enabled (see [docs/parallel-work.md](docs/parallel-work.md))
  - `--no-prompt` - Skip all confirmations
  - `--submit` - Default the submit prompt to yes
  - `--force` - Clear all cached files and re-run every phase; with `--high-level`, discard the review saved for this head SHA and start fresh
  - `--refine` - Skip posting; walk through `synthesis.md` interactively and edit it in place
  - `--apply` - Skip posting; walk through each finding asking apply/skip. Applied findings are fixed in the working tree
  - `--backlog` - Skip posting; file all findings as a single bug backlog item with one phase per finding
  - `--checkout-only` - Skip the review entirely; check the PR out and leave an idle interactive Claude session running in the checkout tree. Requires a PR number, and cannot be combined with `--refine`, `--apply`, `--backlog` or `--submit`
  - `--high-level` - Skip the LLM review; check the PR branch out and step through the high-level review checklist in the web UI preview pane, ticking the manual items and commenting on any item. The deterministic items are What/Why present, description under `review.highLevel.descriptionWordCap`, a GitHub issue linked, and a screenshot or video whenever a changed file matches `review.highLevel.uiPaths`; the manual items are change structure, critical-file diffs and backend PR linked. The two structural items carry their evidence in the pane: the structure item expands to the changed-file tree, each file marked added/deleted/modified with its `+`/`-` line counts, folders collapsible with their collapsed state remembered per PR, and clicking a file opens its diff in the same viewer the session diff uses (syntax highlighting, word-level edit marks, unified or split) in a dialog with a link out to GitHub; the critical-diff item expands to the full diff of every changed file matching `review.highLevel.criticalPaths`, inline in that same viewer. Diffs are capped at 1500 lines per file and 20000 across the review, whole hunks at a time and critical files first, with anything past the cap pointing at GitHub. Approving or requesting changes writes the verdict, per-item state and comments to `~/.assist/high-level-reviews/<repo>/<branch>-<head-sha>.json` and prints the path; re-running against the same head SHA reopens that saved review with its ticks and comments intact, unless `--force` is passed. Outside an assist session the checklist, the tree and the critical diffs are printed to the terminal instead. Nothing is posted to GitHub. Cannot be combined with `--refine`, `--apply`, `--backlog`, `--submit` or `--checkout-only`. See [docs/high-level-review.md](docs/high-level-review.md)
  - `--configure` - With `--high-level`: review nothing and configure the checklist instead. Asks for `review.highLevel.criticalPaths`, `uiPaths` and `descriptionWordCap` one at a time, each prefilled with its current value or, where the key is unset, with globs Claude proposes from this repo's own tree (every tracked directory and the extensions in it, so the proposal matches files the repo actually has); each answer is accepted, edited or left blank to leave that key unset. Before the questions it asks which config file the answers go to — the project `assist.yml`, checked in and shared with the team, or this repo's block in `~/.assist.yml`, personal, as `config set -g --repo` writes it — and all the answers are written in one pass at the end, so a rejected value leaves the file untouched. Takes no PR number and requires `--high-level`. The same flow is available to any command through the `configureConfigKeys` helper (`src/commands/config/configureConfigKeys.ts`), which takes `{key, question, suggest}` entries and answers each by prompting or from answers its caller supplies
  - `--scope <project|repo>` - With `--configure`: write to the repo's own `assist.yml` (`project`) or this repo's block in `~/.assist.yml` (`repo`) instead of asking which
  - `--answer <key=value>` - With `--configure`: answer one key without prompting, repeatable. This is the path for an agent that has already put the choice to the user — `/review-config` proposes the globs from the repo tree in the session, then passes the accepted answers here. Answer all three keys and nothing is prompted for and no globs are proposed; an empty value (`--answer 'review.highLevel.uiPaths='`) leaves that key unset
  - `--address-comments` - After the review posts comments and submits, start an Address Comments session (`assist review-pr-comments <n>`) for the PR. Only fires inside an assist session, and only when at least one comment was posted and the review was submitted
  - `--announce` - Announce the PR in Slack (`/prs-slack <n> --no-confirm`) at the tail of the chain: the Address Comments session announces once every thread is processed when one was started, otherwise a `/prs-slack` session is started directly. Announces exactly once, and only inside an assist session
  - `--verbose` - Per-line log output instead of the stacked-spinner UI (automatic in CI)
  - `review.codexModel` - Optional; set it (`assist config set review.codexModel gpt-5-codex`) to run the codex half of the review against that model on the LiteLLM proxy, injected per-invocation so `~/.codex/config.toml` is untouched. Requires `litellm.baseUrl` and `litellm.apiKey`; with either of them missing, or the key unset, the reviewer runs plain codex on the user's own codex auth. While the model is in use it is named in the codex spinner line and in any codex failure output. The cached `codex.md` is keyed on the review directory rather than the model, so after changing `review.codexModel` the previous model's review is reused until a run passes `--force`
  - `review.highLevel.criticalPaths` - Comma-separated globs (`assist config set review.highLevel.criticalPaths "**/*.graphql,en-AU/translation.json"`) whose full diffs back the critical-diff checklist item. Unset, no file is treated as critical
  - `review.highLevel.uiPaths` - Comma-separated globs (`assist config set review.highLevel.uiPaths "src/ui/**"`) that make a change a UI change, so `--high-level` requires a screenshot or video in the description. Unset, the UI-evidence check passes — a repo that has not said which files are UI cannot be told it is missing a screenshot of one
  - `review.highLevel.descriptionWordCap` - Word cap `--high-level` holds the PR description to (`assist config set review.highLevel.descriptionWordCap 300`); defaults to 300
- `assist github commits <org> [--since <date>] [--top <n>] [--json]` - Report commit activity across a GitHub organisation: repos ranked by commits, top committers, and a per-repo author breakdown
- `assist github issue create --title <title> --body <body> [-R <owner>/<repo>] [--type <name>] [--parent <issue>] [--project <number>] [--status <name>] [--label <name>]` - Create a GitHub issue on the current repo (or `-R`'s). There is no What/Why/How template — an issue reports a problem, and the target repo's own issue template is unknowable from here. The title and body are rejected if they reference Claude or an assist backlog item, and in a web session they are previewed for approve/reject first (with inline comments and pasted screenshots or video, as for `prs raise`, appended under `## Screenshots` on approval); nothing is created until it is approved. `--type` sets the native issue type after creation, `--parent` files the new issue as a sub-issue of the referenced issue (`owner/repo#number`, a github.com issue URL, or a bare number read against `--repo` or the current repo; a parent in another repository is allowed), `--project` adds the issue to the repo owner's project of that number, `--status` sets that project item's Status, and `--label` applies repo labels (repeat the flag or pass a comma-separated list). All five are resolved before the preview — including the token's `project` OAuth scope, whose remediation is `gh auth refresh -h github.com -s project` — so an unknown name, an unreadable parent, a missing scope, or `--status` without `--project` creates nothing. The preview pane names the repo, type, parent, project, status and labels above the body without adding them to the posted body. Raw `gh issue create` is denied in favour of this command
- `assist github issue edit <number> [-R <owner>/<repo>] [--fresh] [--parent <issue>]` - Rework an existing GitHub issue's body in the web preview pane. Fetches the issue's current `title`, `body` and `updatedAt` with `gh issue view`, writes the body to a working file under `~/.assist/github-issues/`, and previews it for approve/reject. Approving pushes the pane's markdown back with `gh issue edit --body-file`; nothing is pushed if the issue was updated on GitHub after it was fetched (the working file is named instead, so nobody else's edit is clobbered) or if the preview is rejected. Rejecting writes the pane's markdown — collapses included — to the working file and names it in the output, so the revision is made in that file rather than composed from scratch; a re-run resumes from the working file while the issue has not moved on GitHub, and `--fresh` discards it and re-fetches. Outside a web session there is no pane to edit in, so the command just prints the issue — callers never need to detect the session themselves. Only the body is touched — the title, labels, assignees and state are left alone. `--parent` instead makes the issue a sub-issue of the referenced issue (same forms as `create --parent`; a parent in another repository is allowed) without touching the body, previewing anything, or needing a web session. Raw `gh issue edit` is denied in favour of this command
- `assist github issue comment <number> --body <body> [-R <owner>/<repo>]` - Comment on a GitHub issue on the current repo (or `-R`'s); a body of `-` reads it from stdin. The body is rejected if it references Claude or an assist backlog item, and in a web session it is previewed for approve/reject first (with inline comments); nothing is posted until it is approved. Raw `gh issue comment` is denied in favour of this command
- `assist github issue edit-comment <comment-id> --body <body> [-R <owner>/<repo>]` - Replace the body of a comment that is already posted on the current repo (or `-R`'s); a body of `-` reads it from stdin. `<comment-id>` is the numeric comment id — the one in the comment's API url or its `#issuecomment-<id>` anchor — not the issue number. The replacement runs through the same gate as posting one: it is rejected if it references Claude or an assist backlog item, and in a web session it is previewed for approve/reject first (with inline comments); the published comment is untouched until it is approved. Approving sends the whole body as a `PATCH`, so what is there now is overwritten rather than appended to. Raw `gh api` writes to issue endpoints are denied in favour of this command
- `assist github issue started <number> [-R <owner>/<repo>]` - Start work on a GitHub issue on the current repo (or `-R`'s): assigns it to the authenticated user, then moves every project board it sits on to In Progress. The boards are discovered from the issue itself — one GraphQL read returns its `projectItems` with each project's `Status` field and options — so nothing is configured or passed as a flag, and an issue on several boards has all of them moved. The option is matched case-insensitively. The assignment is applied first and is never blocked by the board work: an issue on no board, a `Status` field with no In Progress option (the names it does offer are listed), and a `gh` token without the `project` scope are each reported and exit 0 with the assignment landed. The remediation for the scope is `gh auth refresh -h github.com -s project`
- `assist github issue fix-structure <target> [-R <owner>/<repo>] [--level <level>] [--type-chain <names>] [--strip-label <label>...] [--apply]` - Normalise the issue types across one issue subtree, reading and writing nothing outside it. `<target>` is `owner/repo#number`, a github.com issue URL, or a bare number with `-R`; a bare number with no repo is refused rather than guessed. Walks the subtree via sub-issues level by level (a single deep query blows the GraphQL node limit) and reports the type each issue should carry: every level below the target is typed to the next level down the chain, matching type names loosely so `Subtask` and `Sub-task` both bind to the leaf. The chain defaults to `Epic` > `Story` > `Subtask`; `--type-chain Initiative,Feature,Task` replaces it, parent level first, and every level named must already exist as an issue type on the organisation or the run fails listing the ones that do. Untyped issues are typed rather than skipped, and cross-repo children are handled in the one run. The target's own level is inferred from its issue type, so aiming at a story types its children as subtasks; when its type is not in the chain the level cannot be inferred and the command exits non-zero naming the type it has. `--level` asserts the position instead, which also types the target itself. No label is touched unless `--strip-label` names it; it is repeatable, matched case-insensitively, and each label is removed by the id found on that issue, since label ids differ per repository. Anything nested below the leaf level fails the run before a single write, naming the offender and its parent; nothing is ever re-parented. Without `--apply` nothing is written. `--apply` announces each write before it is issued and flushes it, so a long run shows progress, then re-walks the subtree and fails with a non-zero exit if any drift remains
- `assist news add [url]` - Add an RSS feed URL (rendered in the sessions web News tab)
- `assist releases [list]` - Print the declared release promotion streams — each stream's repo, release workflow, nodes and edges — as read from `releases.streams`. The same declaration drives the [Releases page](#releases) of the sessions dashboard
- `assist releases configure --streams <file> [--scope <project|repo>]` - Validate release streams and write them to `releases.streams`. `<file>` is a JSON or YAML array of streams (`-` reads stdin); a stream that names no `repo` gets the current one, so the caller never passes it. The array is checked twice before anything is written — every edge endpoint must be a declared node id and no two nodes may share one, then the whole config must pass the schema — and a failure prints each error and writes nothing. Streams already declared for other repos are kept, the ones for the repos in the file are replaced, and what was written is printed back as its environments, steps and edges. `--scope` picks the project `assist.yml` (default) or this repo's block in `~/.assist.yml`. The topology itself is derived by [`/releases-configure`](#claude-commands), which reads the repo's workflows and calls this

### Backlog

Backlog data is stored in a global Postgres database (shared across all repos, scoped per repository by git origin), so a connection string is required. Set it via the `ASSIST_DATABASE_URL` environment variable or the `database.url` key in `assist.yml`; the environment variable takes precedence. Without one, every `assist backlog` command exits with a setup message. Commands default to the current repository's items; pass `--all-repos` to span every repository.

Backlog item ids are written and displayed in an `a`-prefixed form (e.g. item 555 is `a555`) to disambiguate them from GitHub PR/issue numbers (`#42`) and Jira keys. Commands and web API routes that take an `<id>` accept either form.

- `assist backlog [--dir <path>]` - Open the backlog tab in the web dashboard (same as `backlog web`)
- `assist backlog list [--status <type>] [-a, --all] [--all-repos] [-v]` - List backlog items with status icons (alias: `ls`; also `assist list` / `assist ls`)
- `assist backlog add` - Add a new backlog item interactively (human CLI use only; agents must use `propose`)
- `assist backlog add --name <n> --type <t> --desc <d> --ac <criterion...>` - Add a backlog item from CLI options
- `assist backlog propose --json <file|-> [--confirmed]` - Create an agent-authored item from a JSON payload, previewed for approval in a web session. Outside a web session an agent invocation prints the draft and writes nothing until it is re-run with `--confirmed`; `--confirmed` is rejected in a web session, where the pane is the gate. Used by `/draft` and `/bug`. See [docs/backlog-item-preview.md](docs/backlog-item-preview.md)
- `assist backlog show <id> [--all-commits]` - Display full detail for a backlog item (alias: `view`). Activity lists the newest 10 commits; `--all-commits` prints every commit
- `assist backlog plan <id>` - Display the phased plan for a backlog item
- `assist backlog update-field <id> [--name <n>] [--desc <d>] [--type <t>] [--ac <criterion...>]` - Update fields on a backlog item
- `assist backlog update-field <id> [--add-ac <text>] [--edit-ac <n> <text>] [--remove-ac <n>]` - Granular 1-based acceptance-criteria edits
- `assist backlog update-field <id> --origin [url-or-key]` - Retag a single item to a different repo
- `assist backlog add-phase <id> <name> --task <t...> [--manual-check <c...>] [--position <pos>]` - Add a phase to an existing item
- `assist backlog update-phase <id> <phase> [--name <n>] [--task <t...>] [--manual-check <c...>]` - Modify a plan phase (alias: `edit-phase`)
- `assist backlog update-phase <id> <phase> [--add-task <t>] [--edit-task <n> <t>] [--remove-task <n>] [--add-check <c>] [--edit-check <n> <c>] [--remove-check <n>]` - Granular 1-based task and manual-check edits
- `assist backlog remove-phase <id> <phase>` - Remove a plan phase from a backlog item
- `assist backlog move-phase <id> <from> <to>` - Reorder a plan phase between 1-based positions
- `assist backlog update-plan <id> --json <file|->` - Replace an item's whole plan from a JSON payload, previewed as a single diff for approval. The path `/refine` and agent sessions use for every plan change
- `assist backlog add-subtask <id> --title <t> [--desc <d>]` - Add a sub-task. Sub-tasks under the `subtasks` key in `assist.yml` / `~/.assist.yml` are auto-applied to every new item
- `assist backlog edit-subtask <id> <idx> [--title <t>] [--desc <d>] [--status <s>]` - Edit a sub-task by its 1-based index
- `assist backlog remove-subtask <id> <idx>` - Remove a sub-task by its 1-based index
- `assist backlog subtask-status <id> <idx> <status>` - Set a sub-task's status (`todo`, `in-progress`, `done`)
- `assist backlog start <id>` - Set a backlog item to in-progress
- `assist backlog stop` - Revert all in-progress items to todo and reset their phase to 1
- `assist backlog done <id>` - Set a backlog item to done (blocked while any sub-task is not done)
- `assist backlog wontdo <id> [reason]` - Set a backlog item to won't do
- `assist backlog set-status <id> <status>` - Set status (`todo`, `in-progress`, `done`, `wontdo`)
- `assist backlog star <id>` / `assist backlog unstar <id>` - Pin an item ahead of unstarred items in the web view
- `assist backlog delete <id>` - Delete a backlog item
- `assist backlog comment <id> <text>` - Add a comment to a backlog item. Set `backlog.previewComments` to `true` to have the comment shown in the web preview pane and only written once approved; by default it is written immediately
- `assist backlog comments <id>` - List comments and summaries for a backlog item
- `assist backlog delete-comment <id> <comment-id>` - Delete a comment (summaries cannot be deleted)
- `assist backlog phase-done <id> <phase> <summary>` - Signal that a plan phase is complete
- `assist backlog rewind <id> <phase> --reason <reason>` - Rewind an item to an earlier phase
- `assist backlog next [id] [--once]` - Pick and run the next backlog item, or open `/draft` if none remain
- `assist backlog refine [id] [--once] [--harness <claude|codex|pi>]` - Alias for `refine`
- `assist backlog run <id> [--harness <claude|codex|pi>] [--write|--no-write]` - Run a backlog item's plan phase-by-phase with the selected harness, defaulting to `harness.engine`; for Codex, write access uses the `workspace-write` sandbox and `--no-write` uses `read-only`
- `assist backlog export [file]` - Export every table in the backlog database to a file, or stdout
- `assist backlog import [file]` - Restore every table present in a dump back into the database (`-y, --yes` skips the prompt)
- `assist backlog associate-jira <id> [key]` - Associate a Jira ticket (bare key or browse URL); clears any GitHub issue on the item. `--clear` removes it
- `assist backlog associate-github <id> [issue]` - Associate a GitHub issue (URL or `owner/repo#number`); clears any Jira key on the item. `--clear` removes it
- `assist backlog add-activity <id> <kind> <ref>` - Attach an activity ref (`branch`, `commit`, `commit-parent`, `pr`, `slack`, `session`); `--title`, `--url`, `--state` override metadata
- `assist backlog record-slack <url>` - Attach a Slack thread permalink to the current session's item; used by `/prs-slack`
- `assist backlog record-session <id>` - Attach the Claude session the command runs inside to an item; `--session <sessionId>` overrides detection
- `assist backlog move-repo <old-origin> [new-origin]` - Retag all items from one origin to another after a repo rename (`-y, --yes` skips the prompt)
- `assist backlog clone <origin>` - Clone a repo over SSH into `clone.baseDir` (default `~/git`)
- `assist backlog web [-p, --port <number>] [--no-open]` - Open the backlog tab in the web dashboard (default port 3100)

### Config and run commands

- `assist run <name> [params...]` - Run a configured command from assist.yml. A backlog item id (`a555` / `555`) with no matching command forwards to `assist backlog run`
- `assist run add` - Add a new run configuration to assist.yml and create a Claude command file
- `assist run link <path> --prefix <prefix>` - Link run configurations from another project's assist.yml
- `assist run remove <name>` - Remove a run configuration and delete its Claude command file

A run entry's relative `cwd` (and a `link` path) resolves against the **repo root** - the directory holding `assist.yml` or `.claude/`, or the enclosing git repository when the repo has no project config at all (entries coming only from a `repos:` override in `~/.assist.yml`). The base does not shift with which config file the entry came from. A resolved `cwd` that does not exist fails with `run config "<name>": cwd <path> does not exist` rather than a `spawn <command> ENOENT`, and the daemon logs that reason when a `run:` session errors.

- `assist config keys [filter]` - List every key in the config schema with its type, schema default, what it does and the `assist config set` line that sets it. The optional filter narrows to keys containing it (case-insensitive), so `assist config keys worktree` shows just the worktree block. The listing is derived from `assistConfigSchema` and the `configHelp` registry that `assist verify config-keys` forces to cover every key, so no key can go missing from it
- `assist config get <key>` - Get a config value. Secret values (`database.url`, `roam.*` tokens, `sql.connections[].password`, `seq.connections[].apiToken`) print as `<hidden>`; `--reveal` prints the raw value undecorated for command substitution and always needs an explicit permission prompt (the CLI hook never auto-approves it). An unset key exits non-zero and reports `Key "<key>" is not set`; when the key is a valid schema key that message carries its schema default (or `has no schema default`) plus the key's note and setter
- `assist config list` - List the config values that are **set**, with secret values shown as `<hidden>` (no reveal option). Unset optional blocks are omitted entirely, so the output leads with a comment pointing at `assist config keys` for the full schema
- `assist config set <key> <value>` - Set a config value. `--global` writes to `~/.assist.yml`; `-g --repo [name]` writes a per-repo override there. The confirmation line and any validation error mask secret values
- `assist config unset <key>` - Remove a config value so the key falls back to the global value or schema default (`-g` targets `~/.assist.yml`; `-g --repo [name]` removes it from a per-repo override there)

The Config tab of the sessions web dashboard never receives secret values: `GET /api/config` replaces each one with a set-or-unset marker, so a configured secret renders as a mask and an unset one as `not set`, both keeping their project/global/default chip. Secret fields edit write-only - the mask clears on focus, typing a value replaces the stored one, and leaving the field untouched keeps it.

### Verify and lint

- `assist verify` - Run all verify:\* commands in parallel (from assist.yml run configs and package.json scripts)
- `assist verify all` - Run all checks, ignoring diff-based filters
- `assist verify --measure` - Print a summary table of each command's status and duration
- `assist verify init [--package-json]` - Add verify scripts to a project
- `assist verify hardcoded-colors` - Check for hardcoded hex colors in src/ (`hardcodedColors.ignore`)
- `assist verify block-code-comments` - Fail on any comment on a changed line (`blockCodeComments.ignore`); machine directives exempt
- `assist verify forbidden-strings` - Check configured JSON files for disallowed values (`forbiddenStrings` rules)
- `assist verify config-keys` - Check every leaf key in `assistConfigSchema` is surfaced in some command's `--help` via `configHelp`
- `assist verify advice-fragments` - Check `adviceFragmentNames` matches the fragments shipped in `claude/advice`, so `advice.sections` can name every one and reject the rest
- `assist verify migrations` - Check bundled DB migrations are sequentially numbered, append-only, and free of unacknowledged destructive DDL
- `assist lint [-f, --fix]` - Run lint checks for conventions not enforced by oxlint
- `assist lint init` - Initialize oxlint with baseline linter config

### Refactoring

- `assist refactor check [pattern]` - Check for files that exceed the maximum line count
- `assist refactor ignore <file>` - Add a file to the refactor ignore list
- `assist refactor rename file <source> <destination>` - Rename/move a TypeScript file and update all imports (`--apply` to execute)
- `assist refactor rename symbol <file> <oldName> <newName>` - Rename a symbol across the project (`--apply` to execute)
- `assist refactor extract <file> <functionName> <destination>` - Extract a function and its private dependencies to a new file (`--apply` to execute)
- `assist refactor restructure [root]` - Place every file under `root` (default `src`) by its import graph alone, so re-running on the result makes no moves. Roots (no importers in scope, or imported from outside) sit at `root`; a single-importer file nests in `<importer dir>/<importer basename>/`; a shared file sits directly in the lowest folder common to its importers; cycles stay together; tests sit next to their subject. Dry-run prints the moves, resulting tree, depth statistics and basename collisions. `--apply` moves the files, rewrites imports (including `import()`, `import("…")` types and `vi.mock` paths) and removes emptied folders; `--check` lists files that drift from the plan and exits non-zero. Files matching `restructure.ignore` globs are never moved. Modules named in `restructure.pin` (basename without extension) move up out of deep import chains into the folder of the nearest root or pinned module above them, taking their subtrees with them

### Rules

- `assist rules list [path] [--full]` - List the rules in scope for a path (default: cwd), read from the `## Rules` section of every `CLAUDE.md` from that path's directory up to the repo root, nearest scope first, grouped by the file each rule came from. Shows each rule's title, or its description where it has no title; `--full` adds the description under every title. Rules are `- **<code>** — **<title>** — <text>` bullets, the title optional
- `assist rules add <text> [--title <title>] [--scope <path>]` - Add a rule to the `## Rules` section of the scope's `CLAUDE.md`, creating the section when absent and allocating the next repo-wide code. `--title` is the few-word summary the rule picker shows in place of the description. `--scope` takes a file or directory (resolved to the nearest existing `CLAUDE.md` at or above it, defaulting to cwd) or a `CLAUDE.md` path written to directly and created if absent. After writing, the root `CLAUDE.md` records the directories that carry their own `## Rules` so scoped rules stay discoverable from the root
- `assist rules index` - Record the directories that carry their own `## Rules` in the repo root's `CLAUDE.md`, rewriting the line in place rather than duplicating it. Always repo-wide, resolved from the cwd — it takes no path, since the index lives at the root by definition and cannot be narrowed. `rules add` does this on every add; run it directly after hand-editing a `## Rules` section (e.g. renaming an existing heading)

### Devlog

- `assist devlog list` - Group git commits by date
- `assist devlog next` - Show commits for the day after the last versioned entry
- `assist devlog repos` - Show which github.com/staff0rd repos are missing devlog entries
- `assist devlog skip <date>` - Add a date to the skip list
- `assist devlog version` - Show current repo name and version info

### Hooks

- `assist cli-hook` - PreToolUse hook auto-approving CLI commands from `allowed.cli-reads` / `allowed.cli-writes` (plus read-only `gh api`), checking each sub-command of a compound command independently; also denies `Read`/`Grep`/`Glob` calls targeting `~/.assist/restricted`
- `assist cli-hook add <cli>` - Discover a CLI's commands and auto-permit read-only ones
- `assist cli-hook check <command> [--tool <tool>]` - Check whether a command would be auto-approved
- `assist cli-hook deny` - List all deny rules
- `assist cli-hook deny add <pattern> <message>` - Add a deny rule for a command pattern
- `assist cli-hook deny remove <pattern>` - Remove a deny rule by pattern
- `assist codex-hook` - Codex hook that auto-approves read-only commands (`PreToolUse`/`PermissionRequest`) reusing the `cli-hook` allowlist, and reports session status to the sessions daemon (`UserPromptSubmit`/`PreToolUse`/`PostToolUse` → running, `Stop` and an undecided `PermissionRequest` → waiting) so a Codex session card shows live running/waiting; installed by `assist sync` when `codex` is on PATH
- `assist pi-hook` - pi permission-gate adapter reusing the `cli-hook` allowlist, emitting `allow` / `deny` / `gate`; installed by `assist sync` when `pi` is on PATH
- `assist edit-hook` - PreToolUse hook that blocks `Edit`/`Write`/`MultiEdit` calls from adding, changing, or removing a `// assist-maintainability-override` marker, or from introducing a code comment (use `code-comment set`/`confirm` for the rare comment that belongs)
- `assist code-comment set <file> <line> <text>` - Validate a comment (max 50 chars, single-line) and issue a pin authorising its insertion
- `assist code-comment confirm <pin>` - Insert the pinned comment at its file/line and clear the pin state
- `assist db-migration unlock` - Page a human to approve creating the next new migration module, issuing a pin via desktop notification
- `assist db-migration confirm <pin>` - Confirm a pin from `db-migration unlock`, letting that migration's file write through once
- `assist advise [--hook] [--explain]` - Print the advice fragments from `claude/advice/*.md` that apply to the cwd's repo, each selected by its `when` condition against the merged config and repo facts, composed in filename order. A fragment body may interpolate `{{variable}}` placeholders — `verify.md` names the repo's own `verify*` run commands that way. `advice.sections` overrides a section's condition by name — `advice.sections.verify false` drops it where its condition matched, `true` forces one in where it did not. Names are schema-validated against the shipped set, so `assist config set` refuses an unknown name instead of writing one that silently never matches, the web `/config` page picks the key from a list of the real names with each section's title beside it, and a hand-edited bad name fails on load like any other invalid enum value. `advice.verify` replaces the verify fragment's text and forces it in, and `advice.extra` is appended as a "Repo notes" section. `--hook` reads the SessionStart payload from stdin for the session's cwd and emits the markdown as `hookSpecificOutput.additionalContext`; `--explain` lists every shipped fragment with whether it was included and the reason. Claude Code gets this through the `assist advise --hook` SessionStart hook, Codex through `assist codex-hook` on its own `SessionStart` event, and pi through the `assist-advice.ts` extension, which composes on `session_start` and appends the markdown to the system prompt on `before_agent_start`
- `assist notify` - Show desktop notification from JSON stdin (macOS, Windows, WSL)
- `assist status-line` - Format Claude Code status line from JSON stdin

### .NET

- `assist dotnet inspect [sln]` - Run JetBrains inspections on changed .cs files to find dead code
  - `--scope all|base:<ref>|commit:<ref>` - Inspect the whole solution, everything changed since a base ref, or one commit
  - `--only <ids...>` / `--suppress <ids...>` - Show only, or suppress, specific issue type IDs
  - `--roslyn` - Use Roslyn analyzers via msbuild instead of JetBrains
  - `--swea` - Enable solution-wide error analysis (slower but more thorough)
- `assist dotnet check-locks` - Check if build output files are locked by a debugger
- `assist dotnet deps <csproj>` - Show .csproj project dependency tree and solution membership
- `assist dotnet in-sln <csproj>` - Check whether a .csproj is referenced by any .sln file

### Data sources

- `assist jira auth` - Authenticate with Jira via API token
- `assist jira ac <issue-key>` - Print acceptance criteria for a Jira issue
- `assist jira view <issue-key>` - Print the title and description of a Jira issue
  - Note: Claude fetches Jira context via the MCP Atlassian server, so `/jira` and Jira-key mentions go through MCP. These CLI commands remain for direct human use.
- `assist miro extract [name] [--items <file>] [--top-left <id|link> --bottom-right <id|link>] [--ignore <file>] [--out <file>] [--board <id>] [--frame <id>] [--save <name>] [-g] [-r [repo]]` - Print the text of every box inside a rectangle on a Miro board as a YAML list, leftmost box edge first (topmost edge breaks ties). `--items` is a file of raw `board_list_items` response pages; anchors accept a bare widget id or a `?moveToWidget=<id>` link. Omit both anchors to pick them by clicking the top-left then the bottom-right box in the assist web UI preview pane, which echoes the pair back as flags for later runs. `--ignore <file>` is a YAML list of box texts to drop, warning about entries that matched nothing; repeated identical text is listed once at its highest-priority position. `--out <file>` writes the YAML to a file with a header recording the board, frame, anchors and computed rectangle instead of printing to stdout; `--board`/`--frame` override the ids read from the items for that header. After a pick the selection can be saved as a named extract under `miro.extracts` — `--save <name>` saves without asking, and `-g` / `-r [repo]` choose the config file as they do for `assist config set` (the project `assist.yml` by default). `assist miro extract <name>` then replays that extract with no flags, resolving its paths from the repo root and reporting the config file it came from; any flag overrides the matching field
- `assist litellm list-models [--json]` - List the model ids the configured LiteLLM proxy serves, sorted one per line, from `GET <litellm.baseUrl>/v1/models`; `--json` prints the raw response body. Requires `litellm.baseUrl` and `litellm.apiKey`
- `assist ravendb auth add` - Add a new RavenDB connection
- `assist ravendb auth list` - List configured RavenDB connections
- `assist ravendb auth remove <name>` - Remove a configured connection
- `assist ravendb set-connection <name>` - Set the default connection
- `assist ravendb query [connection] [collection]` - Query a RavenDB collection (`--page-size`, `--sort`, `--query`, `--limit`)
- `assist ravendb collections [connection]` - List collections and document counts
- `assist seq auth add` - Add a new Seq connection
- `assist seq auth list` - List configured Seq connections
- `assist seq auth remove <name>` - Remove a configured connection
- `assist seq set-connection <name>` - Set the default Seq connection
- `assist seq query <filter>` - Query Seq events (`-c <connection>`, `--json`, `-n <count>`, `--from <date>`, `--to <date>`)
- `assist slack post [channel] --body <body|-> | --parts <file>... [--thread <ts-or-permalink>]` - Preview a markdown message bound for a Slack channel; `--body -` reads it from stdin. The channel falls back to `slack.channel` when the argument is omitted, and the command errors naming the `assist config set slack.channel` setter when neither is given. `--thread` takes a message ts (`1712345678.123456`) or a Slack archives permalink (`.../archives/C012AB3CD/p1712345678123456`, whose `thread_ts` query parameter wins when present, so a link to a reply resolves to its parent) and resolves it to the `thread_ts` the reply is posted under; anything else is a usage error. Posting is MCP-only, so the command never posts: in an assist web session it renders the markdown in the preview pane for approve/reject (with inline comments), and on approval writes the approved body to a working file under `~/.assist/slack/`, printing its path on the last line — preceded by the resolved `thread_ts` — for `/slack-post` to send. On rejection it exits non-zero with the reason and any inline comments, leaving the previewed markdown in that working file to revise in place and re-preview. Outside a web session there is no preview and the body passes straight through
  - `--parts <file>...` previews a whole thread — the files holding its messages, in thread order — so none of them is handed back until all of them are approved. Each part gets its own working file under `~/.assist/slack/` (`eng-1.md`, `eng-2.md`, …) and its own preview pane, popped in sequence and titled with the target and its position in the batch (`Post to #eng (2/3)`). Only after the last part is approved does the command print anything: a line naming the target, then every working-file path in thread order prefixed with its position (`2/3`), then a line saying how to thread them — without `--thread` part 1 opens the thread and the rest carry the `thread_ts` it returns, with `--thread` every part is a reply under the resolved `thread_ts`. The first rejection halts the batch: it exits non-zero naming that part's position, the reason, every inline comment with its excerpt, and that part's working file, and prints no paths — revise that file in place and re-run the whole batch, which re-previews from part 1. A missing or empty part file, or `--parts` together with `--body`, is an error raised before any pane opens
- `assist sql auth add` - Add a new MSSQL connection
- `assist sql auth list` - List configured SQL connections
- `assist sql auth remove <name>` - Remove a configured connection
- `assist sql set-connection <name>` - Set the default SQL connection
- `assist sql query "<sql>" [connection]` - Execute a read-only SQL statement and print a table (rejects mutating statements)
- `assist sql mutate "<sql>" [connection]` - Execute a mutating SQL statement and print rows affected
- `assist sql tables [connection]` - List tables in the connected database
- `assist sql columns <table> [connection]` - List columns for a table (`schema.table` for a non-default schema)

### Other

- `assist netcap [-p, --port <port>] [-o, --out <dir>] [-f, --filter <pattern>]` - Capture browser network traffic to `capture.jsonl` under `--out` (default `~/.assist/netcap`), paired with the [netcap browser extension](#netcap-browser-extension)
- `assist netcap extract-linkedin-posts [file]` - Parse a netcap capture into structured LinkedIn posts, written to `posts.json` beside the capture
- `assist criteria-extension [--sign]` - Print the directory to load the [acceptance criteria outliner extension](#acceptance-criteria-outliner-extension) unpacked from (copies to `C:\tools\criteria-extension` under WSL); `--sign` signs it on AMO's unlisted channel and prints the `.xpi` for a permanent Firefox install
- `assist screenshot <process>` - Capture a screenshot of a running application window (`screenshot.outputDir`, default `./screenshots`)
- `assist handover save --summary <s>` - Save a session handover note (content from stdin), scoped by the repo's git origin
- `assist handover list` - List unrecalled handovers for this repo, most recent first
- `assist handover recall [id]` - Print an unrecalled handover and mark it recalled (most recent by default)
- `assist handover load` - SessionStart hook entry point advising how many unrecalled handovers exist
- `assist mermaid export [file.md]` - Render each fenced mermaid block to `<stem>-<index>.svg` via [Kroki](https://kroki.io) (`--out`, `--index`, `mermaid.krokiUrl`)
- `assist prompts` - Show top 10 denied tool calls by frequency with count and repo breakdown
- `assist chart [--title <title>]` - Draw a terminal line chart of a `label value` series piped in on stdin, one pair per line, separated by a comma, tab or whitespace. Points are charted in the order given — nothing is sorted or aggregated — and the chart closes on q, Esc or Ctrl-C. The y axis fits the data range with 20% padding rather than starting at zero, so a series that only moves in its third decimal still reads as a shape; a flat series is padded so the line does not sit on the axis. Blank lines are skipped, fewer than two points prints `Not enough data points to chart.`, and a non-numeric value exits 1 naming the line

### Project setup

- `assist init` - Initialize project with VS Code and verify configurations
- `assist new vite` - Initialize a new Vite React TypeScript project
- `assist new cli` - Initialize a new tsup CLI project
- `assist update` - Update assist to the latest version and sync commands
- `assist vscode init` - Add VS Code configuration files
- `assist deploy init` - Initialize Netlify project and configure deployment
- `assist deploy redirect` - Add trailing slash redirect script to index.html
- `assist roam auth` - Authenticate with Roam via OAuth
- `assist roam show-claude-code-icon` - Forward Claude Code hook activity to Roam local API

### Complexity

- `assist coverage` - Print global statement coverage percentage
- `assist complexity <pattern>` - Analyze a file (all metrics if single match, maintainability if multiple)
- `assist complexity cyclomatic [pattern]` - Calculate cyclomatic complexity per function
- `assist complexity halstead [pattern]` - Calculate Halstead metrics per function
- `assist complexity maintainability [pattern]` - Calculate maintainability index per file (`--ignore <glob>`, plus `complexity.ignore`). A file can declare its own threshold with a `// assist-maintainability-override: N` comment in its first ~10 lines, replacing `--threshold` for that file only
- `assist complexity sloc [pattern]` - Count source lines of code per file

### Transcripts and voice

- `assist transcript configure` - Configure transcript directories
- `assist transcript clean <path>` - Clean any .vtt file and write the result to stdout (`--format <md|vtt>`, default `md`). Markdown chat log: `assist transcript clean ./raw.vtt > clean.md`; cleaned WebVTT with timings preserved: `assist transcript clean ./raw.vtt --format vtt > fixed.vtt`. `--timestamps` prefixes each markdown speaker turn with `[hh:mm:ss]`, so passages can be cited as ranges for `merge --select`: `assist transcript clean ./raw.vtt --format md --timestamps`
- `assist transcript list` - List raw .vtt filenames waiting in the pick-up directory
- `assist transcript merge <path...>` - Collapse several .vtt files into one transcript with `NOTE` provenance, rebasing cue times onto a continuous timeline (`--out <path>` to write a file instead of stdout): `assist transcript merge ./a.vtt ./b.vtt --out ./refinement.vtt`. `--select <file|->` takes keep/removed JSON (`-` reads it from stdin) naming the ranges to keep, so only those passages survive and the dropped ones are counted in the header: `assist transcript merge ./a.vtt ./b.vtt --select ./selection.json`. `--no-provenance` omits every `NOTE` — the Collapsed-from header, the per-passage source marks and the removed count — for an output going somewhere the source names and cut points should not follow: `assist transcript merge ./a.vtt ./b.vtt --select ./selection.json --no-provenance`. `--widen-audience` retunes the language for a reader who was not in the call: the casual asides pitched at the people who were — an intensifier before a word, emphasis after a wh-word, a standalone interjection — are deleted, along with any cue that is nothing but one, leaving anything that carries meaning (verb, idiom, decision marker, predicate adjective, noun, reported speech) for you to judge: `assist transcript merge ./a.vtt ./b.vtt --no-provenance --widen-audience`
- `assist transcript move <file>` - Convert a raw .vtt to a dated markdown transcript and archive the original
- `assist voice setup` - Download required voice models (VAD, STT)
- `assist voice start [--foreground]` - Start the voice daemon (always-on, listens for wake word)
- `assist voice stop` - Stop the voice daemon
- `assist voice status` - Check voice daemon status and recent events
- `assist voice devices` - List available audio input devices
- `assist voice logs [-n <count>]` - Show recent voice daemon log entries

### Sessions

- `assist sessions` - Start the web dashboard (same as `sessions web`)
- `assist sessions web [-p, --port <number>] [--no-open]` - Start the web dashboard with Sessions, Backlog and News tabs (default port 3100). Ctrl+R in the foreground terminal opens a restart menu; Ctrl+. in the browser jumps to the next session waiting on input; Ctrl+N or Alt+N opens a new-session prompt (Chrome and Edge only deliver Ctrl+N to installed app windows)
- `assist sessions summarise [-f, --force] [-n, --limit <count>]` - Generate one-line summaries for unsummarised Claude sessions
- `assist sessions close` - Dismiss the current daemon-managed session: kills its process tree, removes its card from the dashboard and reaps its worktree. Outside such a session it reports there is nothing to close and exits 0
- `assist sessions rename <title>` - Retitle the current daemon-managed session: the given title replaces the generated title and the backlog item name on its dashboard card for the rest of its life. Outside such a session it reports there is nothing to rename and exits 0
- `assist sessions set-status <status>` - Report the current session's status (`running`/`waiting`) to the daemon; invoked by the Claude Code hooks the daemon wires into each session
- `assist daemon run` - Run the sessions daemon in the foreground (normally auto-spawned detached)
- `assist daemon status` - Show daemon status, live sessions, and any stray processes or stolen socket
- `assist daemon stop` - Stop the sessions daemon; running claude sessions resume on next start
- `assist daemon restart` - Restart the sessions daemon, resuming previously running claude sessions
- `assist daemon drain [--yes]` - Remove all sessions from the local daemon for a clean slate; a session holding unpushed work is stopped, not removed

### Session launchers

- `assist next [id] [--once]` - Alias for `backlog next [id]`; `--once` exits after the first completed item run
- `assist draft [description] [--once]` (alias: `feat`) - Launch Claude in `/draft` mode, chain into next on `/next` signal
- `assist bug [description] [--once]` - Launch Claude in `/bug` mode, chain into next on `/next` signal
- `assist refine [id] [--once] [--harness <claude|codex|pi>]` - Launch a coding harness in `/refine` mode; `--harness` picks the engine, defaulting to the configured `harness.engine` (Claude)
- `assist review-pr-comments [number] [--announce] [--resume-session <id>]` - Launch Claude in `/review-pr-comments` mode; a PR number is checked out first via `gh pr checkout`. `--announce` (requires a number) announces the PR in Slack via `/prs-slack <number> --no-confirm` once every comment thread has been processed
- `assist fix-conflict [number] [--rebase] [--resume-session <id>]` - Launch Claude in `/fix-conflict` mode to resolve the branch's conflicts against the remote default; a PR number is checked out first via `gh pr checkout`. `--rebase` rebases onto the remote default instead of merging it in
- `assist signal next [id]` - Write a next signal to chain into `assist next`
- `assist signal done [id]` - Write a done signal marking the session's initial task complete; an optional `id` surfaces the backlog item the session created onto its card

`draft`, `bug`, `refine`, `review-pr-comments`, `fix-conflict` and `backlog run` accept `--resume-session <id>` to resume an interrupted Claude session (used by the daemon when it restarts or restores a running item). Launchers without the flag — `next` among them — are respawned without it rather than being handed an option they would reject.

## Sessions dashboard

Web sessions are owned by a long-lived daemon process, not the web server: the server is a thin client relaying WebSocket traffic to the daemon over a local IPC socket (`~/.assist/daemon/daemon.sock`; named pipe `\\.\pipe\assist-sessions-daemon` on Windows). Restarting the web server leaves sessions running with scrollback intact. The daemon logs to `~/.assist/daemon/daemon.log` and auto-exits once no sessions remain and no client has connected for 60 seconds. See [docs/session-lifecycle.md](docs/session-lifecycle.md).

The topnav has a **Design** dropdown: submitting a prompt launches an interactive `claude` session with the vendored design system prompt appended via `--append-system-prompt`.

Every live session card carries an **add-agent** button (👥) that starts a second agent inside that session's existing workspace rather than allocating a new one. While several agents share a workspace, only the last one to leave triggers teardown.

A `run:` entry in `assist.yml` flagged `server:` (with an optional display-only `port:`) is a singleton **dev server**. `server:` takes a group name — `server: api` and `server: web` are separate slots, so a repo that serves an API and a front end can keep both live at once; `server: true` normalises to the group `default`. At most one server may be live per group per normalised git remote, i.e. across a clone and all its sibling clones. Session cards for such a repo show a **▶ start** button; the daemon rejects a second server run for that remote and group, and the web UI turns the conflict into a "replace running server?" prompt. The serving card shows a `serving :<port>` chip and a **⏹ stop** button, and the slot frees whenever that session stops. Non-`server` runs are unconstrained.

### Windows-host repos (from WSL)

Requires `assist` installed on the Windows host.

- `sessions.windowsProjectsRoot` — the Windows `.claude/projects` directory as seen from WSL (e.g. `/mnt/c/Users/<user>/.claude/projects`); enables discovery of Windows-host repos, tagged with a `Windows` badge.
- `sessions.windowsDaemonHost` / `sessions.windowsDaemonPort` — where the WSL daemon reaches the native Windows daemon (defaults `127.0.0.1` / `51764`; set the host to the Windows IP on WSL2 NAT-mode networking).
- `sessions.windowsVersionCheck` — reaction to a protocol-version mismatch in the WSL↔Windows handshake: `block` (default) refuses creates and auto-heals the host, `warn` proceeds anyway, `off` skips the check.

### Session config keys

- `sessions.includeCommittedChanges` — defaults to **true**: the card's change counts, the `/diff` view and its scope picker cover the commits recorded against the session's backlog item as well as uncommitted work, so the change link survives the agent committing. Each committed path is diffed against the parent of the earliest of those commits that touched it, so nothing outside the item's own commits is shown. Set it false to count and diff only uncommitted changes. A session whose item has no recorded commits and a clean tree still shows nothing either way.
- `sessions.topBar` — defaults to **true**: a sticky top bar inside the terminal panel carrying the session's ids, backlog chip and story name, the phase caption, elapsed time, the Continue/Auto-run/Dismiss switches and the session actions. Set it false to keep all of that on the card instead.
- `sessions.floatWaiting` — defaults to **true**: sessions that have been `waiting` on input for longer than the threshold float above the other cards, longest waiting first. Set it false to keep the star-only ordering; starred sessions still sort above everything.
- `sessions.floatWaitingAfterMs` — defaults to **5000**: how long a session must have been `waiting` on input before `sessions.floatWaiting` floats it.
- `sessions.newSessionMode` — defaults to **draft**: the mode pre-selected when the Ctrl+N new session dialog opens. One of `draft`, `bug` or `prompt`.
- `sessions.maxLive` — defaults to **24**: the ceiling on concurrent live sessions one daemon holds. Spawning past it is refused (`session ceiling of N reached`) and a daemon birth respawns at most this many persisted sessions, deferring the rest to stopped cards. The daemon serves every repo, so set it globally: `assist config set sessions.maxLive 32 -g`.

### Releases

The **Releases** tab draws one row per declared release stream: a left rail naming the stream, its repo, its release workflow, the tip of the default branch, a link to the latest run and a summary pill per group of environments, and beside it the promotion graph the stream declares. Nodes sit in columns by edge depth, so a fan-in gate or a missing step is something you see rather than something you decode, and an SVG edge joins each pair — solid where the promotion has happened, dashed where the target does not carry the source's commit. Hovering or focusing a summary pill dims the graph and rings exactly the nodes that pill counts.

Two layers sit over the one graph, toggled rather than shown side by side:

- **What's live** — per environment, the commit of its newest deployment whose status is `success`, how long ago that went live, and how many commits behind the repo's default branch it is. A deployment still `waiting` on an approval is gated, not live, so it is passed over and shown on its own `queued` line instead.
- **Latest run** — per node, the state of its job in the latest run of the stream's workflow: how long it took, how long it has been sitting on an environment approval, or that the run never got there. Jobs are matched to nodes by name, most specific node first, so `Deploy to EU Staging` goes to the `eu-staging` node rather than the `staging` one.

Every timestamp renders in the viewer's own timezone, and every glyph and short token carries a tooltip on hover and on keyboard focus. Commit SHAs link to the commit, and their tooltip carries the commit subject and author. A stream whose repo or workflow cannot be read shows its error in place of its graph, leaving the other streams intact. Live state is read from the repo's GitHub deployments, so two streams deploying into the same environment read the same commit.

Topology is declared, not derived: assist does not parse workflow YAML at runtime.

```yaml
releases:
  streams:
    - name: Web App
      repo: owner/name
      workflow: release.yml
      nodes:
        - { id: build, kind: build }
        - { id: dev, environment: dev }
        - { id: eu-prod, environment: EU Production, label: eu-prod }
      edges:
        - [build, dev]
        - [dev, eu-prod]
```

- `id` names the node within the stream and is what `edges` refer to. A node with an `environment` is a GitHub deployment environment and reads live state; `kind` (`build` or `gate`) marks a node that deploys nothing. `label` overrides the text on the node, which is otherwise the `id`.
- `/releases-configure` derives the block from the repo's own workflows instead of hand-writing it, and `assist releases list` prints whatever is declared back as assist reads it.

## Parallel work

Concurrent sessions in one repo can be isolated with native git worktrees instead of keeping multiple physical clones: see [docs/parallel-work.md](docs/parallel-work.md). All of these flags **default off**:

- `worktree.enabled` (parallel work) — spill concurrent sessions into adjacent `<clone>-N` worktrees. Off means every session on the repo shares its single working copy.
- `worktree.watcher` — starting a backlog run also ensures one starred **watcher** session in the clone itself: a claude session whose prompt is `/watch`, run with `--permission-mode auto`, so the clone keeps fast-forwarding and rebuilding while the run works in its worktree. The watcher's cwd is always the clone, never a worktree. One watcher per clone — a run (fresh or chained) that finds a live one spawns no second, and the reason lands in `daemon.log`; a watcher that has stopped or errored is replaced by the next run. Dismissing the last other session in the clone or any of its worktrees also dismisses the watcher, logged to `daemon.log`; a finished card still showing keeps it alive. Needs `worktree.enabled`, a `/watch` command in the repo, and an `auto-build` run entry in its `assist.yml` (what `assist watch wait --build` invokes).
- `worktree.trunk` (trunk-based) — on, a spilled worktree's branch tracks `origin/<trunk>` so commits land on the mainline. Off, it starts off the remote default branch with no mainline tracking, leaving the session to raise its own branch and PR.

  While it is on, a job that commits never runs in the clone: `backlog run <id>` (spawned fresh or chained into from a session already sitting in the clone) and PR checkouts (`review <n>`, `review-pr-comments <n>`) always allocate a `<clone>-N`, even when the clone is idle and clean. Committing there would land the work on the local mainline and leave every later worktree starting from that HEAD. Plain prompts, `spawnInTree` sessions, `draft`/`bug`/`refine` and every other command keep the normal clone-preferring placement, and a session pinned in place stays where it was launched. There is no fallback — if the worktree can't be created the spawn fails with the reason in `daemon.log` rather than dropping the job in the clone. Non-trunk repos are unaffected.

- `worktree.includeDrafts` — give draft, bug and refine sessions their own `<clone>-N`. They change no code, so by default they run in the clone's working copy at no worktree, dep-install or teardown cost.

Neither flag leaves permanent state on the clone: nothing writes to the clone's `.git/config` (`assist commit` derives its push refspec from the current branch), so turning parallel work back off leaves the repo as it was.

## Iterating on assist itself

Web server changes only need the `assist sessions` process restarted — sessions survive. Daemon/session-core changes need `assist daemon restart`: claude sessions are auto-respawned via `claude --resume` with scrollback starting fresh, while run sessions reappear as not-restored tiles that can be retried.

A restart kills every managed session's pty, which also kills any background task running inside it. `daemon.log` names each session it kills, and the shutdown records the reason against them in `sessions.json` before the ptys die. On restore, a session the restart caught mid-turn is resumed with a prompt naming the restart instead of the generic one, and a session that was idle only because it was waiting on a background task — a `/watch` loop, say — is woken with the same prompt, naming the task ids that died. An idle session with no background work in flight is left idle, as before.

## Other config keys

- `harness.codexModel` — empty, Codex uses whatever provider codex itself is configured with. Set to a model (`assist config set harness.codexModel <model>`), every non-review Codex launch — daemon sessions (create, resume, restore and respawn) and CLI launches such as `assist backlog run --harness codex`, `assist refine --harness codex` or `harness.engine: codex` — routes through the LiteLLM proxy with that model, injected per-invocation so `~/.codex/config.toml` is untouched. Requires `litellm.baseUrl` and `litellm.apiKey`; with either missing, Codex falls back to its own configured provider. Independent of `review.codexModel`, which alone controls `assist review`
- `slack.channel` — the Slack channel (e.g. `#example`) that `assist slack post` and `/slack-post` target when no channel argument is given
- `prs.slack` — the Slack channel (e.g. `#example`) that `/prs-slack` posts pull requests to via the Slack MCP connector
- `prs.required` — when `true` (default `false`), `assist backlog run` cuts and records a fresh branch for a story that has no recorded branch at run start, so a new story never inherits the previous one's branch
- `prs.promptJira` — when `true` (default `false`), the `assist prs raise --help` `--resolves` guidance instructs asking the user for a Jira key
- `prs.promptGithub` — when `true` (default `false`), the `assist prs raise --help` `--resolves` guidance instructs asking the user for a GitHub issue (`#123`, `owner/repo#123`, or a github.com issue URL). With `prs.promptJira` also `true` the guidance asks for either, and a mixed `--resolves` list renders each value in its own form
- `prs.draft` — when `true` (default `false`), `assist prs raise` creates a draft PR. `--draft` and `--no-draft` override it in either direction; only the create path is affected, `assist prs edit` never changes an existing PR's draft state
- `readTime.wordsPerMinute` — nominal prose reading speed (default `200`) that `assist read-time` estimates with. The effective rate decays with document length, fitted to timed readings of real documents: ~88 wpm at 129 words, ~70 wpm at 485. Fenced code is scored at half the prose rate
- `prs.readingWordsPerMinute` — the same speed under the command's former name, read only when `readTime.wordsPerMinute` is unset
- `commit.pull` — when enabled, `assist draft`, `bug`, `refine`, `next` and `backlog run` run `git pull --ff-only` first and abort if it fails (`next` pulls once per invocation, not per item)
- `commit.expectedBranch` — when set (e.g. `main`), `assist commit` prints a non-blocking warning if HEAD is on any other branch, so work on a stray branch isn't silently orphaned
- `branch.prefix` — when set (e.g. `sw`), `assist branch <slug>` prepends `<prefix>/` to the branch name
- `branch.defaultBranch` — override the base branch, which is otherwise resolved live from the remote (`git ls-remote --symref origin HEAD`), falling back to `main`
- `releases.streams` — the release promotion streams drawn by the [Releases page](#releases), derived by `/releases-configure`, written by `assist releases configure --streams` and printed by `assist releases list`
- `cliHook.blockNpmRun` — when `true` (default), `assist cli-hook` denies `npm run` and redirects to `assist run <name>`, `assist verify` or `assist build`. Set it to `false` in a repo that genuinely needs npm scripts. `npm install`, `npm ci` and `npm test` are never affected

## Acceptance criteria outliner extension

`assist criteria-extension` prints the directory to load unpacked; nothing talks to assist at runtime. The extension is a single Manifest V3 content script scoped to `https://github.com/*`, built by `npm run build` from `src/commands/criteriaExtension/criteriaContentScript.ts` into `criteria-extension/content.js` (gitignored). It adds an **Outline criteria** toggle to the markdown toolbar of an issue's body editor and the new-issue form, re-attaching after client-side navigation; pressing it hides the textarea and mounts the same `AcceptanceCriteriaOutline` control the web preview panel uses, in a shadow root with its own emotion cache and MUI theme. A body whose acceptance criteria are bullets, checkboxes or prose gets a **Convert to outline** button instead, and a body with no acceptance criteria heading gets **Add acceptance criteria**. Each edit is written back through `writeAcceptanceCriteria` into the textarea and dispatched as an `input` event, so GitHub's own Save pushes it.

1. Run `assist criteria-extension` — it prints the extension directory. Under WSL it copies the extension to `C:\tools\criteria-extension` and prints that Windows path instead; re-run and reload the extension after a rebuild.
2. Load the unpacked extension:
   - **Chrome**: open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extension directory.
   - **Firefox**: open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `manifest.json` inside the printed extension directory. Firefox drops a temporary add-on on every restart; see [permanent Firefox install](#permanent-firefox-install) to avoid that.
3. Open an issue, press **Edit** on the body, and press **Outline criteria**. The new-issue form works the same way.

### Permanent Firefox install

Firefox release and beta only install signed add-ons, so a permanent install means having Mozilla sign the package. Signing uses AMO's **unlisted** (self-distribution) channel: Mozilla signs the `.xpi` and hands it back, with no public store listing and no human review queue.

Signing runs in CI, so the AMO key lives only as repo secrets and never on a developer machine. One-time setup: create an AMO API key at [addons.mozilla.org/developers/addon/api/key](https://addons.mozilla.org/en-US/developers/addon/api/key/) and add its two halves as the repo secrets `AMO_JWT_ISSUER` (the `user:12345678:123` issuer) and `AMO_JWT_SECRET`. The **Criteria extension** workflow maps them onto the `WEB_EXT_API_KEY` / `WEB_EXT_API_SECRET` that `web-ext` reads.

1. Run the **Criteria extension** workflow from the Actions tab (`gh workflow run criteria-extension.yml`). It checks out `main`, builds, signs the extension at assist's current version, and uploads the signed add-on to that version's GitHub release as `criteria-extension.xpi`. A failed AMO submission fails the job and attaches nothing.
2. Download `criteria-extension.xpi` from the release — the URL follows from the version, `https://github.com/staff0rd/assist/releases/download/v<version>/criteria-extension.xpi`.
3. Open the `.xpi` in Firefox (drag it onto a window, or `about:addons` → gear → **Install Add-on From File…**). It survives restarts.

AMO refuses a version it has already signed, which is why the staged manifest carries assist's version instead of the manifest's `1.0.0` placeholder — sign once per release, not twice at the same version. Unlisted add-ons get no updates from AMO, so a new build means installing the new `.xpi`; wiring up self-hosted `update_url` auto-updates is not done.

`assist criteria-extension --sign` still signs locally for someone who holds an AMO key: export `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET`, run `npm run build` (to refresh `content.js`), then the command. It stages a copy of the extension with assist's version stamped into `manifest.json`, shells out to `npx web-ext sign`, and writes the signed add-on to `~/.assist/criteria-extension/criteria-extension.xpi`. Under WSL it copies that to `C:\tools\criteria-extension.xpi` and prints the Windows path.

Two alternatives need no signing: **Firefox Developer Edition** or **Nightly** honour `xpinstall.signatures.required = false` in `about:config` and will then install an unsigned local `.xpi` permanently, and Chrome's **Load unpacked** already survives restarts, so the unpacked directory is one-time setup there.

## netcap browser extension

`assist netcap` only runs the receiver; the browser side is a raw Manifest V3 extension (no build step) under `netcap-extension/`. A MAIN-world content script patches `fetch`/`XMLHttpRequest` to capture `{url, method, status, requestBody, responseBody, timestamp}` and relays each entry to the background service worker, which POSTs it to the receiver. Forwarding happens in the background context, so the page's CSP (`connect-src`) never blocks it.

1. Run `assist netcap` — it prints the receiver URL, the capture file path, and the extension directory to load. The receiver host/port and the optional `--filter` substring are baked into the extension's `background.js` at this point. Under WSL it copies the extension to `C:\tools\netcap-extension` and targets the WSL VM's IP, printing that Windows path instead; re-run after a reboot (the WSL IP can change) and reload the extension.
2. Load the unpacked extension:
   - **Firefox**: open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `manifest.json` inside the printed extension directory. (Requires Firefox 128+ for MAIN-world content scripts.)
   - **Chrome**: open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extension directory.
3. On load the background worker pings the receiver; `ping from extension` appears in the `assist netcap` log, confirming browser→server connectivity.
4. Browse a site; matching requests append to the capture file live and survive page refreshes. Press Ctrl-C to stop the receiver; it prints how many entries were captured.
