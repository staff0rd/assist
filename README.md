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
- `/branch <description> [--jira KEY]` - Create a branch off the fresh remote default
- `/bug` - File a bug with reproduction steps, expected and actual behavior
- `/close` - End this session if its work is finished
- `/comment` - Add pending review comments to the current PR
- `/commit` - Commit only relevant files from the session
- `/devlog` - Generate devlog entry for the next unversioned day
- `/draft` - Draft a new backlog item with LLM-assisted questioning
- `/fix-conflict [--rebase]` - Resolve the current PR branch's conflicts against the remote default; `--rebase` rebases instead of merging
- `/fix-rules [dir]` - Put existing rules into the `## Rules` format `assist rules` reads
- `/forward-comments` - Split a coarse PR comment into per-line review comments, attributed to the original reviewer
- `/pr` - Raise a PR with a concise description
- `/prs-slack <number> [--no-confirm]` - Post a PR's title and URL to the `prs.slack` channel; `--no-confirm` skips the confirmation
- `/prs-status [channel] <owner/repo>...` - Post an overview of the open PRs across the named repos to Slack (default channel `slack.channel`)
- `/refactor` - Run refactoring checks for code quality
- `/prompts` - Analyze denied tool calls and suggest settings changes to auto-allow recurring prompts
- `/run-logs [session-id|group]` - Summarise a run session's output, by session id or this repo's server group (default `default`)
- `/releases-configure` - Derive this repo's release promotion topology from its workflows and write it to `releases.streams`
- `/refine` - Refine an existing backlog item through conversation
- `/rename [title]` - Retitle this session's dashboard card, inferring a title when given none
- `/restructure` - Analyze and restructure tightly-coupled files
- `/review-config` - Configure this repo's high-level review checklist keys
- `/review-ci` - Install a GitHub workflow that reviews new PRs with Claude and Codex through LiteLLM or Azure AI Foundry, without depending on assist
- `/review-high-level [number]` - Open the high-level review checklist for the current branch's PR, or PR `<number>`
- `/review-pr-comments` - Process PR review comments one by one
- `/jira [action] [KEY] [args]` - Jira actions: `view`, `associate`, `update`, `started`, `done`, `help`. `[KEY]` defaults to the session's backlog item's
- `/github [action] [ref] [args]` - GitHub issue actions: `view`, `edit`, `associate`, `update`, `started`, `done`, `help`. `[ref]` defaults to the session's backlog item's; a bare `/github <ref>` runs `edit`
- `/next [id]` - Signal completion and chain into the next backlog item
- `/slack-post [channel] [--thread <ts-or-permalink>] <what to say>` - Preview a markdown message, or a thread of them, then post it to a Slack channel (default `slack.channel`); `--thread` replies in that thread
- `/subtask <text>` - Add a sub-task to the session's current backlog item
- `/strip-code-comments` - Strip redundant comments from tracked source files
- `/sync` - Sync commands and settings to ~/.claude
- `/design <prompt>` - Apply the vendored design system prompt to a design task
- `/test-cover` - Incrementally increase test coverage by identifying and testing uncovered files
- `/test-review` - Review existing tests for quality, coverage gaps, and conventions
- `/inspect` - Run .NET code inspections on changed files
- `/screenshot` - Capture a screenshot of a running application window
- `/ask [what to ask about]` - Put a plan, summary or proposed decision in the web preview pane and wait for the user's sign-off
- `/show [what to show]` - Open long links, paths and snippets in the web preview pane, defaulting to those in the previous reply
- `/raven` - Query and manage RavenDB connections and collections
- `/miro [board url | extract name]` - Extract a Miro frame's boxes as an ordered YAML list
- `/seq` - Query Seq logs from a URL or filter expression
- `/sql` - Query a MSSQL database via assist sql
- `/verify` - Run all verification commands in parallel
- `/verify-new` - Add a new verify:\* run command to assist.yml
- `/transcripts` - Format and summarise meeting transcripts end to end

## CLI Commands

Every command supports `--help` for full detail on its flags and behaviour.

### Database

- `assist backup [-o, --out <dir>]` - Dump the backlog database to `<dir>` (default `~/.assist/backups`, or `backup.dir`)
- `assist backup schedule --every <duration>` - Schedule `assist backup` on a cadence (e.g. `5m`, `6h`)
- `assist backup schedule status` - Show the active backup cadence
- `assist backup schedule remove` - Remove the backup schedule
- `assist db migrate` - Apply pending backlog database migrations in order
- `assist db status` - Report whether the database is in sync with the build's bundled migrations
- `assist db drop-retired` - Drop tables left by removed features

### Git and GitHub

- `assist sync [--prune] [--force]` - Copy commands, settings and design assets to `~/.claude` (plus `~/.codex` and `~/.pi` when those CLIs are installed); `--prune` lists commands sync did not write and `--prune --force` removes them
- `assist activity [--since <date>]` - Chart GitHub commit activity per day (defaults to last 30 days)
- `assist commit status` - Show git status and diff
- `assist commit <message> [files...] [--ref <ref>]` - Stage files and create a validated single-line commit; each `--ref` (free text containing a URL) adds a `Ref:` trailer
- `assist branch <slug> [--jira <key>] [--from <ref>]` - Create and switch to a new branch off the fresh remote default (or `--from <ref>`)
- `assist watch wait [--interval <d>] [--timeout <d>|none] [--pull] [--build [entry]]` - Wait until the current branch's upstream gains commits; `--pull` fast-forwards to them and `--build` then runs the `auto-build` run entry (or `[entry]`), showing its output only if it fails
- `assist watch loop` - Keep the current branch pulled and built as its upstream moves
- `assist watch simulate-divergence` - Make the next `assist watch wait` poll in this repo exit 3 as a simulated divergence, to test the watcher's escalation
- `assist watch report [--from <sha>]` - Summarise recent commits and the restarts and sync they call for, since `<sha>` when given
- `assist read-time <target> [--budget <duration>]` - Estimate how long a PR (number or URL), file or stdin (`-`) takes to read, against `--budget` (default 1m)
- `assist prs` - List pull requests for the current repository
- `assist prs status <owner/repo>... [--json]` - Report the open pull requests across the named repos and what each is waiting on
- `assist prs raise --title <t> --what <w> --why <y> [--how <h>] [--resolves <ref>] [--force] [--draft|--no-draft]` - Raise a PR with a What/Why/How body, previewed for approval in a web session; `--draft`/`--no-draft` override `prs.draft`
- `assist prs edit [--title <t>] [--what <w>] [--why <y>] [--how <h>] [--resolves <ref>]` - Update the supplied sections of the current PR's body, previewed for approval in a web session
- `assist prs read-time <target> [--budget <duration>]` - Alias of `assist read-time`
- `assist prs list-comments` - List all comments on the current branch's pull request
- `assist prs fixed <comment-id> <sha>` - Reply with commit link and resolve thread
- `assist prs wontfix <comment-id> <reason>` - Reply with reason and resolve thread, previewed for approval in a web session; `-` reads the reason from stdin
- `assist prs reply <comment-id> <body>` - Reply to a comment thread without resolving it, previewed for approval in a web session; `-` reads the body from stdin
- `assist prs comment <path> <line> <body>` - Add a line comment to the pending review, previewed for approval in a web session; `-` reads the body from stdin
- `assist review [number]` - Review the current branch's PR (or PR `[number]`) with Claude and Codex in parallel and post line-bound comments
  - `[number]` - Check out that PR first (see [docs/parallel-work.md](docs/parallel-work.md))
  - `--no-prompt` - Skip all confirmations
  - `--submit` - Default the submit prompt to yes
  - `--force` - Re-run every phase instead of reusing cached results; with `--high-level`, start a fresh review
  - `--refine` - Skip posting; walk through the findings interactively and edit them
  - `--apply` - Skip posting; walk through each finding asking apply/skip
  - `--backlog` - Skip posting; file all findings as a single bug backlog item with one phase per finding
  - `--checkout-only` - Skip the review; check the PR out and leave an idle Claude session in it
  - `--high-level` - Skip the LLM review; step through the high-level review checklist in the web preview pane. See [docs/high-level-review.md](docs/high-level-review.md)
  - `--configure` - With `--high-level`: configure the checklist's `review.highLevel.*` keys instead of reviewing
  - `--scope <project|repo>` - With `--configure`: write to the project `assist.yml` or this repo's block in `~/.assist.yml` instead of asking
  - `--answer <key=value>` - With `--configure`: answer one key without prompting, repeatable; an empty value leaves the key unset
  - `--address-comments` - Start an Address Comments session for the PR once comments are posted and the review submitted
  - `--announce` - Announce the PR in Slack at the end of the chain
  - `--verbose` - Per-line log output instead of the stacked-spinner UI
  - `review.codexModel` - LiteLLM model the Codex reviewer uses; unset, it uses your own codex auth
  - `review.highLevel.criticalPaths` - Globs of files whose diffs back the critical-diff checklist item; unset, no file is critical
  - `review.highLevel.uiPaths` - Globs that make a change a UI change, requiring a screenshot or video; unset, the check passes
  - `review.highLevel.descriptionWordCap` - Word cap for the PR description; defaults to 300
- `assist github commits <org> [--since <date>] [--top <n>] [--json]` - Report commit activity across a GitHub organisation
- `assist github issue create --title <title> --body <body> [-R <owner>/<repo>] [--type <name>] [--parent <issue>] [--project <number>] [--status <name>] [--label <name>]` - Create a GitHub issue on the current repo (or `-R`'s), previewed for approval in a web session; the options set its issue type, parent issue, project, project status and labels
- `assist github issue edit <number> [-R <owner>/<repo>] [--fresh] [--parent <issue>]` - Rework an issue's body in the web preview pane; `--fresh` discards an unpushed revision, and `--parent` instead makes the issue a sub-issue of `<issue>`
- `assist github issue comment <number> --body <body> [-R <owner>/<repo>]` - Comment on a GitHub issue, previewed for approval in a web session; `--body -` reads stdin
- `assist github issue edit-comment <comment-id> --body <body> [-R <owner>/<repo>]` - Replace the body of a posted issue comment, previewed for approval in a web session; `--body -` reads stdin
- `assist github issue started <number> [-R <owner>/<repo>]` - Assign a GitHub issue to yourself and move it to In Progress on its project boards
- `assist github issue fix-structure <target> [-R <owner>/<repo>] [--level <level>] [--type-chain <names>] [--strip-label <label>...] [--apply]` - Normalise the issue types across an issue's sub-issue subtree to a type chain (default `Epic,Story,Subtask`); `--level` sets the target's position in the chain, `--strip-label` removes a label, and nothing is written without `--apply`
- `assist news add [url]` - Add an RSS feed URL (rendered in the sessions web News tab)
- `assist releases [list]` - Print the release promotion streams declared in `releases.streams`
- `assist releases configure --streams <file> [--scope <project|repo>]` - Write release streams from a JSON or YAML file (`-` for stdin) to `releases.streams`, in the project `assist.yml` (default) or this repo's block in `~/.assist.yml`

### Backlog

Backlog data is stored in a global Postgres database (shared across all repos, scoped per repository by git origin), so a connection string is required. Set it via the `ASSIST_DATABASE_URL` environment variable or the `database.url` key in `assist.yml`; the environment variable takes precedence. Commands default to the current repository's items; pass `--all-repos` to span every repository.

Backlog item ids are written in an `a`-prefixed form (e.g. item 555 is `a555`) to disambiguate them from GitHub PR/issue numbers (`#42`) and Jira keys. Commands that take an `<id>` accept either form.

- `assist backlog [--dir <path>]` - Open the backlog tab in the web dashboard (same as `backlog web`)
- `assist backlog list [--status <type>] [-a, --all] [--all-repos] [-v]` - List backlog items (alias: `ls`; also `assist list` / `assist ls`)
- `assist backlog add` - Add a new backlog item interactively (human CLI use only; agents must use `propose`)
- `assist backlog add --name <n> --type <t> --desc <d> --ac <criterion...>` - Add a backlog item from CLI options
- `assist backlog propose --json <file|-> [--confirmed]` - Create an agent-authored item from a JSON payload, previewed for approval in a web session; outside one, `--confirmed` writes it. See [docs/backlog-item-preview.md](docs/backlog-item-preview.md)
- `assist backlog show <id> [--all-commits]` - Display full detail for a backlog item (alias: `view`); `--all-commits` lists every commit
- `assist backlog plan <id>` - Display the phased plan for a backlog item
- `assist backlog update-field <id> [--name <n>] [--desc <d>] [--type <t>] [--ac <criterion...>]` - Update fields on a backlog item
- `assist backlog update-field <id> [--add-ac <text>] [--edit-ac <n> <text>] [--remove-ac <n>]` - Granular 1-based acceptance-criteria edits
- `assist backlog update-field <id> --origin [url-or-key]` - Retag a single item to a different repo
- `assist backlog add-phase <id> <name> --task <t...> [--manual-check <c...>] [--position <pos>]` - Add a phase to an existing item
- `assist backlog update-phase <id> <phase> [--name <n>] [--task <t...>] [--manual-check <c...>]` - Modify a plan phase (alias: `edit-phase`)
- `assist backlog update-phase <id> <phase> [--add-task <t>] [--edit-task <n> <t>] [--remove-task <n>] [--add-check <c>] [--edit-check <n> <c>] [--remove-check <n>]` - Granular 1-based task and manual-check edits
- `assist backlog remove-phase <id> <phase>` - Remove a plan phase from a backlog item
- `assist backlog move-phase <id> <from> <to>` - Reorder a plan phase between 1-based positions
- `assist backlog update-plan <id> --json <file|->` - Replace an item's whole plan from a JSON payload, previewed as a diff for approval
- `assist backlog add-subtask <id> --title <t> [--desc <d>]` - Add a sub-task. Sub-tasks under the `subtasks` key in `assist.yml` / `~/.assist.yml` are added to every new item
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
- `assist backlog comment <id> <text>` - Add a comment to a backlog item, previewed for approval first when `backlog.previewComments` is `true`
- `assist backlog comments <id>` - List comments and summaries for a backlog item
- `assist backlog delete-comment <id> <comment-id>` - Delete a comment (summaries cannot be deleted)
- `assist backlog phase-done <id> <phase> <summary>` - Signal that a plan phase is complete
- `assist backlog rewind <id> <phase> --reason <reason>` - Rewind an item to an earlier phase
- `assist backlog next [id] [--once]` - Pick and run the next backlog item, or open `/draft` if none remain
- `assist backlog refine [id] [--once] [--harness <claude|codex|pi>]` - Alias for `refine`
- `assist backlog run <id> [--harness <claude|codex|pi>] [--write|--no-write]` - Run a backlog item's plan phase-by-phase with the selected harness (default `harness.engine`)
- `assist backlog export [file]` - Export the backlog database to a file, or stdout
- `assist backlog import [file]` - Restore a dump into the backlog database (`-y, --yes` skips the prompt)
- `assist backlog associate-jira <id> [key]` - Associate a Jira ticket (bare key or browse URL), replacing any GitHub issue; `--clear` removes it
- `assist backlog associate-github <id> [issue]` - Associate a GitHub issue (URL or `owner/repo#number`), replacing any Jira key; `--clear` removes it
- `assist backlog add-activity <id> <kind> <ref>` - Attach an activity ref (`branch`, `commit`, `commit-parent`, `pr`, `slack`, `session`); `--title`, `--url`, `--state` override metadata
- `assist backlog record-slack <url>` - Attach a Slack thread permalink to the current session's item
- `assist backlog record-session <id>` - Attach the current Claude session to an item; `--session <sessionId>` overrides detection
- `assist backlog move-repo <old-origin> [new-origin]` - Retag all items from one origin to another after a repo rename (`-y, --yes` skips the prompt)
- `assist backlog clone <origin>` - Clone a repo into `clone.baseDir` (default `~/git`)
- `assist backlog web [-p, --port <number>] [--no-open]` - Open the backlog tab in the web dashboard (default port 3100)

### Config and run commands

- `assist run <name> [params...]` - Run a configured command from assist.yml, or a backlog item (`a555` / `555`) when no command matches
- `assist run add` - Add a new run configuration to assist.yml and create a Claude command file
- `assist run link <path> --prefix <prefix>` - Link run configurations from another project's assist.yml
- `assist run remove <name>` - Remove a run configuration and delete its Claude command file

A run entry's relative `cwd` (and a `link` path) resolves against the **repo root** - the directory holding `assist.yml` or `.claude/`, or the enclosing git repository when the repo has no project config, whichever config file the entry came from.

- `assist config keys [filter]` - List every config key with its type, default, effect and setter, optionally filtered by name
- `assist config get <key>` - Get a config value; secret values are hidden unless `--reveal` is passed
- `assist config list` - List the config values that are set, with secret values hidden
- `assist config set <key> <value>` - Set a config value. `--global` writes to `~/.assist.yml`; `-g --repo [name]` writes a per-repo override there
- `assist config unset <key>` - Remove a config value so the key falls back to the global value or schema default (`-g` targets `~/.assist.yml`; `-g --repo [name]` removes it from a per-repo override there)

The Config tab of the sessions web dashboard never shows secret values; their fields are write-only.

### Verify and lint

- `assist verify` - Run all verify:\* commands in parallel (from assist.yml run configs and package.json scripts)
- `assist verify all` - Run all checks, ignoring diff-based filters
- `assist verify --measure` - Run all verify:\* commands and time each one
- `assist verify init [--package-json]` - Add verify scripts to a project
- `assist verify hardcoded-colors` - Check for hardcoded hex colors in src/ (`hardcodedColors.ignore`)
- `assist verify block-code-comments` - Fail on any comment on a changed line (`blockCodeComments.ignore`); machine directives exempt
- `assist verify forbidden-strings` - Check configured JSON files for disallowed values (`forbiddenStrings` rules)
- `assist verify config-keys` - Check every config key is surfaced in some command's `--help`
- `assist verify advice-fragments` - Check the advice fragment names match the fragments shipped in `claude/advice`
- `assist verify migrations` - Check bundled DB migrations are sequentially numbered, append-only, and free of unacknowledged destructive DDL
- `assist lint [-f, --fix]` - Run lint checks for conventions not enforced by oxlint
- `assist lint init` - Initialize oxlint with baseline linter config

### Refactoring

- `assist refactor check [pattern]` - Check for files that exceed the maximum line count
- `assist refactor ignore <file>` - Add a file to the refactor ignore list
- `assist refactor rename file <source> <destination>` - Rename/move a TypeScript file and update all imports (`--apply` to execute)
- `assist refactor rename symbol <file> <oldName> <newName>` - Rename a symbol across the project (`--apply` to execute)
- `assist refactor extract <file> <functionName> <destination>` - Extract a function and its private dependencies to a new file (`--apply` to execute)
- `assist refactor restructure [root]` - Move files under `root` (default `src`) into folders derived from the import graph (`--apply` to execute, `--check` to fail on drift)

### Rules

Rules are `- **<code>** — **<title>** — <text>` bullets, the title optional, in the `## Rules` section of a `CLAUDE.md`.

- `assist rules list [path] [--full]` - List the rules in scope for a path (default: cwd); `--full` adds each rule's description
- `assist rules add <text> [--title <title>] [--scope <path>]` - Add a rule to the `## Rules` section of the `CLAUDE.md` nearest `--scope` (default cwd)
- `assist rules index` - Record the directories that carry their own `## Rules` in the repo root's `CLAUDE.md`; run it after hand-editing a `## Rules` section

### Devlog

- `assist devlog list` - Group git commits by date
- `assist devlog next` - Show commits for the day after the last versioned entry
- `assist devlog repos` - Show which github.com/staff0rd repos are missing devlog entries
- `assist devlog skip <date>` - Add a date to the skip list
- `assist devlog version` - Show current repo name and version info

### Hooks

- `assist cli-hook` - PreToolUse hook auto-approving CLI commands from `allowed.cli-reads` / `allowed.cli-writes`, and denying reads of `~/.assist/restricted`
- `assist cli-hook add <cli>` - Discover a CLI's commands and auto-permit read-only ones
- `assist cli-hook check <command> [--tool <tool>]` - Check whether a command would be auto-approved
- `assist cli-hook deny` - List all deny rules
- `assist cli-hook deny add <pattern> <message>` - Add a deny rule for a command pattern
- `assist cli-hook deny remove <pattern>` - Remove a deny rule by pattern
- `assist codex-hook` - Codex hook that auto-approves read-only commands and reports session status to the sessions dashboard
- `assist pi-hook` - pi permission gate that auto-approves read-only commands
- `assist edit-hook` - PreToolUse hook that blocks `Edit`/`Write`/`MultiEdit` calls from adding, changing, or removing a `// assist-maintainability-override` marker, or from introducing a code comment (use `code-comment set`/`confirm` for the rare comment that belongs)
- `assist code-comment set <file> <line> <text>` - Request a pin authorising a single-line comment (max 50 chars)
- `assist code-comment confirm <pin>` - Insert the pinned comment at its file/line
- `assist db-migration unlock` - Ask a human to approve creating the next migration module
- `assist db-migration confirm <pin>` - Confirm a pin from `db-migration unlock`, letting that migration's file be written once
- `assist advise [--hook] [--explain]` - Print the advice fragments that apply to the current repo; `--hook` runs it as a SessionStart hook and `--explain` shows why each fragment was or wasn't included. `advice.sections` forces a fragment in or out by name, `advice.verify` replaces the verify fragment's text and `advice.extra` appends repo notes
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
- `assist miro extract [name] [--items <file>] [--top-left <id|link> --bottom-right <id|link>] [--ignore <file>] [--out <file>] [--board <id>] [--frame <id>] [--save <name>] [-g] [-r [repo]]` - Extract the text of every box inside a rectangle on a Miro board as an ordered YAML list. Omit the anchors to pick them in the web preview pane; `--save <name>` saves the selection under `miro.extracts` so `assist miro extract <name>` replays it
- `assist litellm list-models [--json]` - List the model ids the configured LiteLLM proxy serves
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
- `assist slack post [channel] --body <body|-> | --parts <file>... [--thread <ts-or-permalink>]` - Preview a markdown message bound for a Slack channel (default `slack.channel`) for approval, for `/slack-post` to send; `--body -` reads stdin, `--thread` takes a message ts or permalink to reply under, and `--parts` previews a thread of messages, one file each, in order
- `assist sql auth add` - Add a new MSSQL connection
- `assist sql auth list` - List configured SQL connections
- `assist sql auth remove <name>` - Remove a configured connection
- `assist sql set-connection <name>` - Set the default SQL connection
- `assist sql query "<sql>" [connection]` - Execute a read-only SQL statement
- `assist sql mutate "<sql>" [connection]` - Execute a mutating SQL statement
- `assist sql tables [connection]` - List tables in the connected database
- `assist sql columns <table> [connection]` - List columns for a table (`schema.table` for a non-default schema)

### Other

- `assist netcap [-p, --port <port>] [-o, --out <dir>] [-f, --filter <pattern>]` - Capture browser network traffic under `--out` (default `~/.assist/netcap`), paired with the [netcap browser extension](#netcap-browser-extension)
- `assist netcap extract-linkedin-posts [file]` - Parse a netcap capture into structured LinkedIn posts
- `assist criteria-extension [--sign]` - Locate the [acceptance criteria outliner extension](#acceptance-criteria-outliner-extension) to load unpacked; `--sign` signs it for a permanent Firefox install
- `assist screenshot <process>` - Capture a screenshot of a running application window (`screenshot.outputDir`, default `./screenshots`)
- `assist mermaid export [file.md]` - Render each fenced mermaid block to SVG via [Kroki](https://kroki.io) (`--out`, `--index`, `mermaid.krokiUrl`)
- `assist prompts` - Show the most frequently denied tool calls
- `assist chart [--title <title>]` - Draw a terminal line chart of a `label value` series piped in on stdin, one pair per line
- `assist ask --title <title> --body <markdown|->` - Put a plan, summary or proposed decision in the session's web preview pane and wait for the user to approve or reject it; `--body -` reads stdin
- `assist show --body <markdown|-> [--title <title>]` - Render markdown in the session's web preview pane so long links, paths and code can be clicked and copied unbroken; `--body -` reads stdin

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

### Transcripts

- `assist transcript configure` - Configure transcript directories
- `assist transcript clean <path>` - Clean a .vtt file to markdown or, with `--format vtt`, WebVTT; `--timestamps` prefixes each markdown speaker turn with its time
- `assist transcript list` - List raw .vtt filenames waiting in the pick-up directory
- `assist transcript merge <path...>` - Collapse several .vtt files into one transcript on a continuous timeline (`--out <path>`); `--select <file|->` keeps only the chosen ranges, `--no-provenance` omits source notes and `--widen-audience` drops asides aimed at those in the call
- `assist transcript move <file>` - Convert a raw .vtt to a dated markdown transcript and archive the original

### Sessions

- `assist sessions` - Start the web dashboard (same as `sessions web`)
- `assist sessions web [-p, --port <number>] [--no-open]` - Start the web dashboard with Sessions, Backlog and News tabs (default port 3100)
- `assist sessions summarise [-f, --force] [-n, --limit <count>]` - Generate one-line summaries for unsummarised Claude sessions
- `assist sessions close` - End the current daemon-managed session
- `assist sessions rename <title>` - Retitle the current daemon-managed session's dashboard card
- `assist sessions output [session-id] [--server [group]] [-n, --lines <count>]` - Print the recent output of a session on this node, or with `--server [group]` the current repo's live server run
- `assist sessions nodes [--json]` - List this node and every linked node with its link state (see [Linked nodes](#linked-nodes))
- `assist sessions nodes link <name> [url] [--tailscale <host> --port <port>]` - Link a peer node by its web server URL or its Tailscale name
- `assist sessions nodes unlink <name>` - Remove a linked node
- `assist sessions nodes doctor [name] [--json]` - Find where a link is broken and how to fix it
- `assist sessions nodes logs <name> [-n, --lines <count>] [--json]` - Tail a linked node's `daemon.log`
- `assist sessions set-status <status>` - Report the current session's status (`running`/`waiting`) to the daemon
- `assist daemon run` - Run the sessions daemon in the foreground
- `assist daemon status` - Show daemon status, live sessions and each link's state
- `assist daemon stop` - Stop the sessions daemon; running claude sessions resume on next start
- `assist daemon restart` - Restart the sessions daemon, resuming previously running claude sessions
- `assist daemon drain [--yes]` - Remove all sessions from the local daemon; a session holding unpushed work is stopped, not removed

### Session launchers

- `assist next [id] [--once]` - Alias for `backlog next [id]`; `--once` exits after the first completed item run
- `assist draft [description] [--once]` (alias: `feat`) - Launch Claude in `/draft` mode, chain into next on `/next` signal
- `assist bug [description] [--once]` - Launch Claude in `/bug` mode, chain into next on `/next` signal
- `assist refine [id] [--once] [--harness <claude|codex|pi>]` - Launch a coding harness in `/refine` mode (default `harness.engine`)
- `assist review-pr-comments [number] [--announce] [--resume-session <id>]` - Launch Claude in `/review-pr-comments` mode, on PR `[number]` when given; `--announce` announces the PR in Slack once every thread is processed
- `assist fix-conflict [number] [--rebase] [--resume-session <id>]` - Launch Claude in `/fix-conflict` mode, on PR `[number]` when given; `--rebase` rebases instead of merging
- `assist signal next [id]` - Signal the session to chain into `assist next`
- `assist signal done [id]` - Signal the session's initial task complete, surfacing backlog item `[id]` on its card

`draft`, `bug`, `refine`, `review-pr-comments`, `fix-conflict` and `backlog run` accept `--resume-session <id>` to resume an interrupted Claude session.

## Sessions dashboard

Web sessions are owned by a long-lived daemon process, not the web server: the server is a thin client relaying WebSocket traffic to the daemon over a local IPC socket (`~/.assist/daemon/daemon.sock`; named pipe `\\.\pipe\assist-sessions-daemon` on Windows). Restarting the web server leaves sessions running with scrollback intact. The daemon logs to `~/.assist/daemon/daemon.log` and auto-exits once no sessions remain and no client has connected for 60 seconds. See [docs/session-lifecycle.md](docs/session-lifecycle.md).

The topnav's **+** button (or Ctrl+N / Alt+N) opens the new-session dialog, which replaces the old draft / bug / prompt / design topnav buttons. Its mode selector picks `draft`, `bug`, `prompt` or `design`; in `prompt` mode a harness selector under it picks Claude, Codex or pi when those are exposed, and Up/Down moves between the two rows. `design` launches an interactive `claude` session with the vendored design system prompt appended via `--append-system-prompt`. Left/Right change the mode or harness, and Tab steps through a selector's options before moving on to the next control.

Alt+1 to Alt+5 select the Nth visible top-level tab (with Releases hidden, News is Alt+4), including while the terminal has focus; on macOS use Option. Alt+A, Alt+S and Alt+D follow the main area left to right: Alt+A focuses the active session's sidebar card (expanding the sidebar and switching to Active), Alt+S focuses its terminal, and Alt+D opens and focuses its diff panel, or closes it back to the terminal when the diff already has focus; each returns to Sessions first. Alt+X opens the config page and Alt+C opens the menu. Ctrl+/ (Cmd+/ on macOS) or the menu's **Keyboard shortcuts** item opens a sheet listing every sessions-view shortcut. The top-level tabs, the new-session button, the active session's diff counts, the config cog and the menu button show their chord in their tooltip on hover and keyboard focus.

Every live session card carries an **add-agent** button (👥) that starts a second agent inside that session's existing workspace rather than allocating a new one. While several agents share a workspace, only the last one to leave triggers teardown.

A `run:` entry in `assist.yml` flagged `server:` (with an optional display-only `port:`) is a singleton **dev server**. `server:` takes a group name — `server: api` and `server: web` are separate slots, so a repo that serves an API and a front end can keep both live at once; `server: true` normalises to the group `default`. At most one server may be live per group per normalised git remote, i.e. across a clone and all its sibling clones. Session cards for such a repo show a **▶ start** button; the daemon rejects a second server run for that remote and group, and the web UI turns the conflict into a "replace running server?" prompt. The serving card shows a `serving :<port>` chip and a **⏹ stop** button, and the slot frees whenever that session stops. Non-`server` runs are unconstrained.

### Linked nodes

Each assist install is a **node** with its own daemon and web server. A node can link to other nodes, and its web UI then shows its own sessions merged with each linked node's, as `<node>:<id>` cards carrying a node badge. Links are flat: a node only exports its own sessions and log lines, so two nodes linked to each other show no duplicates. See [docs/multi-node-sessions.md](docs/multi-node-sessions.md).

- `assist sessions nodes [--json]` — this node and each link's state and peer version.
- `assist sessions nodes link <name> --tailscale <host> --port <port>` (or `<url>`) — link a peer by its Tailscale host name, or by any web server URL. `<name>` must match the peer's `sessions.nodeName`. See [Linking machines over Tailscale](#linking-machines-over-tailscale).
- `assist sessions nodes unlink <name>` — remove a link.
- `assist sessions nodes doctor [name] [--json]` — find where a link is broken and how to fix it.
- `assist sessions nodes logs <name> [-n, --lines <count>] [--json]` — tail a linked node's `daemon.log`; naming this node reads the local log.
- `sessions.linkVersionCheck` — reaction to a version mismatch with a linked node: `block` (default) updates an older peer and holds the link until the versions match; `warn` proceeds anyway; `off` skips the check.

With more than one node, a machine picker appears in the top nav and a machine selector in the new-session dialog; the dialog's selector defaults to the top nav's choice, which is remembered per browser. With a linked node selected in the picker, the hamburger's restart item becomes **Restart <node>**: it restarts that node's daemon and web server via `POST /api/restart?target=both&node=<node>` without reloading the page, toasts once the node's link reconnects, and on failure names the first broken `nodes doctor` hop (served locally by `GET /api/node-doctor?link=<node>`). The peer logs each restart as `restart <target> from=<viewer> trace=<id>`. The update item likewise becomes **Update assist on <node>**: over a connected link it opens an `assist update` card on that node, restarts the node's web server once the card completes, and toasts the node's new version; when the link is disconnected or `version-blocked` it falls back to `POST /api/self-update?node=<node>` (logged by the peer as `self-update: requested from=<viewer> trace=<id>`). The picker's menu shows each linked node's version, and the picker marks a node **behind** or **ahead** of this node's version. Linked nodes' daemon lines appear in this node's `daemon.log` tagged `[<node>]`. Every launch forwarded over a link and every `?node=` panel request carries a `traceId`, logged as `trace=<id>` by both nodes. `GET /api/health` reports the node's name, version, protocol, daemon reachability and its links' states. The retired `sessions.windows*` keys are ignored.

#### Linking machines over Tailscale

Every web server listens on `127.0.0.1` only and, when it starts, exposes itself on the tailnet with `tailscale serve` (`tailscale.exe` under WSL) at `https://<host>.<tailnet>.ts.net:<port>`. Windows' `tailscale serve` fronts the WSL web server on `<port>` + 1000, because mirrored WSL networking holds `<port>` itself.

1. Install Tailscale on every machine, sign in to the same tailnet, and turn on MagicDNS and HTTPS certificates in the admin console.
2. Link each peer by its Tailscale host name. From the Mac to both PC nodes:

   ```
   assist sessions nodes link pc-wsl --tailscale pc --port 4100
   assist sessions nodes link pc-windows --tailscale pc --port 3101
   ```

   and optionally from the PC's WSL node back to the Mac: `assist sessions nodes link mac --tailscale mac --port 3100`.

3. Check each link with `assist sessions nodes doctor`.

A config still holding a retired ssh link (`ssh:` / `port:` / `localPort:`) fails to load; `assist sessions nodes link` and `unlink` remove such links and name them so they can be relinked with `--tailscale`.

### Session config keys

- `sessions.nodeName` — this install's node label. Defaults to the OS hostname, suffixed `-wsl` under WSL.
- `sessions.tailscaleServe` — expose the web server on the tailnet. Defaults to **true**.
- `sessions.includeCommittedChanges` — include the commits recorded against the session's backlog item, not just uncommitted work, in its change counts and diff. Defaults to **true**.
- `sessions.topBar` — show the session's details and actions in a top bar inside the terminal panel instead of on the card. Defaults to **true**.
- `sessions.floatWaiting` — float sessions waiting on input above the other cards. Defaults to **true**.
- `sessions.floatWaitingAfterMs` — how long a session must wait on input before it floats. Defaults to **5000**.
- `sessions.newSessionMode` — the mode pre-selected in the new session dialog: `draft`, `bug`, `prompt` or `design`. Defaults to **draft**.
- `sessions.maxLive` — the most live sessions one daemon holds at once. Defaults to **24**.

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

## Next

The **Next** tab (`/next`) recommends what to do next, in this order:

1. **Peer PRs** — open PRs across `next.repos` by `next.peers` or requesting your review
2. **Assigned issues** — open issues assigned to you across `next.repos`
3. **Pickups** — unassigned items on `next.projects` boards in a `next.pickStatuses` status, in board order

**Start session** runs in the item's local clone: PRs open the review dialog, issues open the new-session dialog, and pickups are assigned to you and moved to In Progress first. Project pickups need the gh `project` scope. See `assist sessions web --help` for each key.

```bash
assist config set next.peers alice,bob -g --repo
assist config set next.repos my-org,other/web -g --repo
assist config set next.projects my-org/3,my-org/5 -g --repo
assist config set next.pickStatuses Ready,Todo -g --repo
assist config set next.excludeLabels blocked,spike -g --repo
assist config set next.excludeTypes Epic -g --repo
```

## Parallel work

Concurrent sessions in one repo can be isolated with native git worktrees instead of keeping multiple physical clones: see [docs/parallel-work.md](docs/parallel-work.md). All of these keys **default off** except `worktree.install`:

- `worktree.enabled` (parallel work) — spill concurrent sessions into adjacent `<clone>-N` worktrees instead of sharing the clone's working copy.
- `worktree.watcher` — keep an `assist watch loop` console session in the clone while a backlog run works in a worktree, so the clone stays pulled and rebuilt. If the branch diverges, the daemon starts one claude session in the clone that rebases (or merges) onto the upstream without force-pushing or resetting, pushes, rebuilds and closes; the daemon then restarts the watcher. The watcher's output, escalations, restarts and relaunches accumulate per clone in `~/.assist/watchers/`, so each new or relaunched watcher shows the clone's history. Needs `worktree.enabled` and an `auto-build` run entry.
- `worktree.trunk` (trunk-based) — a worktree's branch tracks `origin/<trunk>` so commits land on the mainline, and jobs that commit (`backlog run`, PR checkouts) always run in a worktree, never the clone. Off, worktrees start off the remote default branch with no mainline tracking.
- `worktree.includeDrafts` — give draft, bug and refine sessions their own `<clone>-N` instead of the clone's working copy.
- `worktree.install` — how a new worktree installs its deps: `true` (default) auto-detects pnpm/yarn/bun/npm, a string is the install command, `false` skips it, and a list of paths installs in each in order.

None of them leaves permanent state on the clone, so turning parallel work back off leaves the repo as it was.

## Iterating on assist itself

Web server changes only need the `assist sessions` process restarted — sessions survive. Daemon/session-core changes need `assist daemon restart`: claude sessions are auto-respawned via `claude --resume` with scrollback starting fresh, while run sessions reappear as not-restored tiles that can be retried.

A restart kills every managed session's pty, which also kills any background task running inside it. `daemon.log` names each session it kills, and the shutdown records the reason against them in `sessions.json` before the ptys die. On restore, a session the restart caught mid-turn is resumed with a prompt naming the restart instead of the generic one, and a session that was idle only because it was waiting on a background task is woken with the same prompt, naming the task ids that died. An idle session with no background work in flight is left idle, as before.

## Other config keys

- `harness.codexModel` — LiteLLM model every non-review Codex launch uses. Unset, Codex uses its own configured provider.
- `slack.channel` — the Slack channel `assist slack post` and `/slack-post` target when given none.
- `prs.slack` — the Slack channel `/prs-slack` posts pull requests to.
- `prs.required` — cut a fresh branch when `assist backlog run` starts a story with no recorded branch. Defaults to `true`.
- `prs.promptJira` — have `assist prs raise --help` ask the user for a Jira key to resolve. Defaults to `false`.
- `prs.promptGithub` — have `assist prs raise --help` ask the user for a GitHub issue to resolve. Defaults to `false`.
- `prs.draft` — raise PRs as drafts. Defaults to `false`.
- `readTime.wordsPerMinute` — the prose reading speed `assist read-time` assumes. Defaults to `200`.
- `prs.readingWordsPerMinute` — the former name of `readTime.wordsPerMinute`, read only when that is unset.
- `commit.pull` — fast-forward before `assist draft`, `bug`, `refine`, `next` and `backlog run` start, aborting if that fails. Defaults to off.
- `commit.expectedBranch` — warn on `assist commit` when HEAD is on any other branch. Unset by default.
- `branch.prefix` — prefix for branch names from `assist branch`. Unset by default.
- `branch.defaultBranch` — the base branch for new branches. Defaults to the remote's default branch.
- `releases.streams` — the release promotion streams the [Releases page](#releases) draws.
- `cliHook.blockNpmRun` — deny `npm run` in favour of `assist run`. Defaults to `true`.

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

AMO refuses a version it has already signed, which is why the staged manifest carries assist's version instead of the manifest's `1.0.0` placeholder — sign once per release, not twice at the same version.

Unlisted add-ons get no updates from AMO, so the manifest's `gecko.update_url` points at `criteria-extension/updates.json` on `main` instead. `--sign` writes that update manifest next to the `.xpi`, pointing at the signed version's release asset, and the workflow commits it back to `main` with `[skip ci]`; an installed add-on then upgrades itself on Firefox's next update check (or **Check for Updates** in `about:addons`).

`assist criteria-extension --sign` still signs locally for someone who holds an AMO key: export `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET`, run `npm run build` (to refresh `content.js`), then the command. It stages a copy of the extension with assist's version stamped into `manifest.json`, shells out to `npx web-ext sign`, and writes the signed add-on to `~/.assist/criteria-extension/criteria-extension.xpi`. Under WSL it copies that to `C:\tools\criteria-extension.xpi` and prints the Windows path.

Two alternatives need no signing: **Firefox Developer Edition** or **Nightly** honour `xpinstall.signatures.required = false` in `about:config` and will then install an unsigned local `.xpi` permanently, and Chrome's **Load unpacked** already survives restarts, so the unpacked directory is one-time setup there.

## netcap browser extension

`assist netcap` only runs the receiver; the browser side is a raw Manifest V3 extension (no build step) under `netcap-extension/`. A MAIN-world content script patches `fetch`/`XMLHttpRequest` to capture `{url, method, status, requestBody, responseBody, timestamp}` and relays each entry to the background service worker, which POSTs it to the receiver. Forwarding happens in the background context, so the page's CSP (`connect-src`) never blocks it.

1. Run `assist netcap` — it prints the receiver URL, the capture file path, and the extension directory to load. The receiver host/port and the optional `--filter` substring are baked into the extension's `background.js` at this point. Under WSL it copies the extension to `C:\tools\netcap-extension` and targets the WSL VM's IP, printing that Windows path instead; re-run after a reboot (the WSL IP can change) and reload the extension.
2. Load the unpacked extension:
   - **Firefox**: open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `manifest.json` inside the printed extension directory. (Requires Firefox 128+ for MAIN-world content scripts.)
   - **Chrome**: open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extension directory.
3. On load the background worker pings the receiver; `ping from extension` appears in the `assist netcap` log, confirming browser→server connectivity.
4. Browse a site; matching requests append to the capture file live and survive page refreshes. Press Ctrl-C to stop the receiver.
