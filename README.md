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
- `/associate-jira <KEY> [id]` - Associate a Jira ticket with the backlog item this session is working on (or an explicit id) by calling `assist backlog associate-jira`
- `/branch <description> [--jira KEY]` - Create a branch off the fresh remote default via `assist branch`, deriving a kebab-case slug from the description and auto-filling the Jira key from the session's backlog item when one is associated
- `/bug` - File a bug with reproduction steps, expected and actual behavior
- `/comment` - Add pending review comments to the current PR
- `/commit` - Commit only relevant files from the session
- `/devlog` - Generate devlog entry for the next unversioned day
- `/draft` - Draft a new backlog item with LLM-assisted questioning
- `/forward-comments` - Split a coarse PR comment (e.g. from Slack) into per-line review comments on the current branch's PR, attributed to the original reviewer
- `/handover` - Write a session handover note for the next conversation and save it to the backlog DB (scoped by git origin, never on disk). Can be run any number of times; each call appends a note with a one-line summary. The SessionStart hook advises how many unrecalled handovers exist
- `/pr` - Raise a PR with a concise description
- `/prs-slack <number>` - Post a PR's title and URL to the Slack channel configured in `prs.slack`
- `/refactor` - Run refactoring checks for code quality
- `/prompts` - Analyze denied tool calls and suggest settings changes to auto-allow recurring prompts
- `/recall` - Recall the most recent handover note for this repo from the backlog DB, emit it as a `# Recall` block, and mark it recalled. Reads DB handovers only (no transcripts or disk files)
- `/refine` - Refine an existing backlog item through conversation
- `/restructure` - Analyze and restructure tightly-coupled files
- `/review-comments` - Process PR review comments one by one
- `/jira` - View a Jira work item
- `/update-jira [JIRA-KEY]` - Post a concise summary of this session's findings to a Jira ticket via MCP; attaches a passed key to the session's backlog item (else reads the key from it), retargets sub-task comments to the parent, and previews the comment before posting on confirmation
- `/journal` - Append a journal entry summarising recent work, decisions, and notable observations
- `/next [id]` - Signal completion and chain into the next backlog item; pass an `id` to run a specific item directly (falls back to the picker if the id is missing, done, won't-do, or blocked)
- `/standup` - Summarise recent journal entries as a standup update
- `/subtask <text>` - Add a sub-task to the backlog item this session is working on (errors if there is no current item) by calling `assist backlog add-subtask`
- `/strip-comments` - Enforce self-documenting code: declare the comment policy in CLAUDE.md if absent, then strip redundant comments, commented-out code, and section banners from tracked source files (functional directives and genuine workaround comments are preserved); edits are left unstaged
- `/sync` - Sync commands and settings to ~/.claude
- `/test-cover` - Incrementally increase test coverage by identifying and testing uncovered files
- `/test-review` - Review existing tests for quality, coverage gaps, and adherence to conventions
- `/inspect` - Run .NET code inspections on changed files
- `/screenshot` - Capture a screenshot of a running application window
- `/raven` - Query and manage RavenDB connections and collections
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

- `assist activity [--since <date>]` - Chart GitHub commit activity per day (defaults to last 30 days)
- `assist backup [-o, --out <dir>]` - Write a dump of the entire backlog database to `<dir>/backup-<timestamp>.dump` (default dir `~/.assist/backups`, overridable via the `backup.dir` config key or `--out`) and record the dump's path and byte size in the backups table; on failure no row is recorded and the command exits with an error
- `assist backup schedule --every <duration>` - Install or update a marked crontab block that runs `assist backup` on a recurring cadence (e.g. `5m` → `*/5 * * * *`, `6h` → `0 */6 * * *`), appending output to `<backup.dir>/cron.log`; re-running with a new duration replaces the block without duplicating it. Durations cron cannot represent evenly (sub-minute, or non-divisor intervals like `90m`) are rejected
- `assist backup schedule status` - Print the active backup cadence and cron expression, or report that none is set
- `assist backup schedule remove` - Remove the marked backup schedule block from the crontab, leaving all other crontab lines intact (reports if none is set)
- `assist init` - Initialize project with VS Code and verify configurations
- `assist new vite` - Initialize a new Vite React TypeScript project
- `assist new cli` - Initialize a new tsup CLI project
- `assist sync` - Copy command files to `~/.claude/commands`
- `assist commit status` - Show git status and diff
- `assist commit <message>` - Commit staged changes with validation
- `assist commit <message> [files...]` - Stage files and create a git commit with validation
- `assist branch <slug> [--jira <key>]` - Create and switch to a new branch off the fresh remote default branch. Assembles the name as `[<prefix>/][<JIRA>-]<slug>` (prefix from the optional `branch.prefix` config, Jira key used verbatim), fetches and branches from `origin/<default>` (resolved live from the remote, falling back to `main`, overridable via `branch.defaultBranch`), and rejects slugs whose numeric tokens look like backlog IDs
- `assist prs` - List pull requests for the current repository
- `assist prs raise --title <title> --what <what> --why <why> [--how <how>] [--resolves <key>] [--force]` - Raise a pull request, assembling the body from `## What`, `## Why` (with `--resolves` Jira URLs appended inline), and an optional `## How`; errors if a PR already exists unless `--force` overwrites its title and body
- `assist prs edit [--title <title>] [--what <what>] [--why <why>] [--how <how>] [--resolves <key>]` - Update only the supplied sections of the current branch's pull request, preserving every other section of its body
- `assist prs list-comments` - List all comments on the current branch's pull request
- `assist prs fixed <comment-id> <sha>` - Reply with commit link and resolve thread
- `assist prs wontfix <comment-id> <reason>` - Reply with reason and resolve thread
- `assist prs reply <comment-id> <body>` - Reply to a comment thread without resolving it
- `assist prs comment <path> <line> <body>` - Add a line comment to the pending review
- `assist review [number] [options]` - Run Claude and Codex in parallel to review the open PR for the current branch. The diff is fetched from GitHub (base SHA → head SHA via `gh pr diff`), so stale local base branches don't pollute the review; fails fast if no PR is open. By default, prompts before posting line-bound comments and then prompts again to submit the pending review (defaulting to no). Findings whose lines fall outside the diff are skipped with a warning rather than being silently dropped by GitHub. Cached `claude.md` / `codex.md` / `synthesis.md` are reused when present; if any reviewer is re-run, the synthesis is invalidated.
  - `[number]` - Run `gh pr checkout <number>` first, then review that PR's branch. If the checkout fails (dirty working tree, unknown PR number), the review aborts
  - `--no-prompt` - Skip all confirmations
  - `--submit` - Default the submit prompt to yes (or auto-submit when combined with `--no-prompt`)
  - `--force` - Clear all cached files and re-run every phase
  - `--refine` - Skip posting; launch an interactive Claude session that walks through `synthesis.md` and edits it in place. A subsequent `assist review` reuses the refined file and posts only the surviving findings
  - `--apply` - Skip posting; launch an interactive Claude session that walks through each finding asking apply/skip. Applied findings are fixed in the working tree (unstaged) and removed from `synthesis.md`; skipped findings stay so a subsequent `assist review` posts them. Cannot be combined with `--refine`
  - `--backlog` - Skip posting; launch an interactive Claude session running `/bug` that files all findings (including `already-raised`) as a single bug backlog item with one phase per finding. `synthesis.md` is left untouched; `--submit` is ignored. Cannot be combined with `--refine` or `--apply`
  - `--verbose` - Disable the stacked-spinner UI and fall back to per-line log output. Non-TTY environments (CI) automatically use this mode
- `assist github commits <org>` - Report commit activity across a GitHub organisation over the last 30 days: repos ranked by commits to their default branch, top committers, and a per-repo author breakdown (empty repos are skipped; commits with no linked GitHub account fall back to the raw author name)
  - `--since <date>` - Start of the window as `YYYY-MM-DD` instead of the default 30 days ago
  - `--top <n>` - Only report the top `n` repos by commit count; committers and the author breakdown then cover those repos only (also caps the per-repo author queries, which speeds up large orgs)
  - `--json` - Output all three views as structured JSON instead of tables
- `assist news add [url]` - Add an RSS feed URL (rendered in the sessions web News tab)
  Backlog data is stored in a global Postgres database (shared across all repos, scoped per repository by git origin), so a connection string is required. Set it via the `ASSIST_DATABASE_URL` environment variable or the `database.url` key in `assist.yml`; the environment variable takes precedence. Without one, every `assist backlog` command exits with a setup message. (There is no SQLite/JSONL fallback.) Commands default to the current repository's items; pass `--all-repos` to span every repository.

The first backlog command in a repository that still has a local `.assist/backlog.jsonl` automatically migrates it into Postgres — but only as a one-time bootstrap into an empty origin. If Postgres has **no** items for the repo's origin yet, it runs `git pull` (best-effort) to fetch the latest committed copy, imports every item under the origin with fresh global IDs (rewriting links to other items), and verifies the result. If Postgres **already** has items for that origin (a prior run, another clone, or a pre-seeded database), the import is skipped to avoid creating duplicates. Either way the local `.assist/backlog.jsonl` and `.assist/backlog.db` are renamed to `*.bak`, so the migration never re-runs and a local copy is retained.

- `assist backlog [--dir <path>]` - Open the backlog tab in the web dashboard (same as `backlog web`). `--dir` overrides the directory used to resolve the current repository's git origin
- `assist backlog init` - Create an empty backlog
- `assist backlog list [--status <type>] [-a, --all] [--all-repos] [-v]` - List backlog items with status icons (alias: `ls`). Defaults to the current repository's todo/in-progress items; `--all` includes done/wontdo, `--all-repos` lists items across all repositories. Also available as the top-level shortcut `assist list` / `assist ls` with the same flags
- `assist backlog add` - Add a new backlog item interactively (prompts for type: story/bug)
- `assist backlog add --name <n> --type <t> --desc <d> --ac <criterion...>` - Add a backlog item from CLI options (used by `/draft`)
- `assist backlog add-phase <id> <name> --task <t...> [--manual-check <c...>] [--position <pos>]` - Add a phase (appends by default; `--position` inserts at a 1-indexed position)
- `assist backlog add-subtask <id> --title <t> [--desc <d>]` - Add a sub-task (status `todo`) to a backlog item. Sub-tasks listed under the `subtasks` key (each `title` and optional `description`) in `assist.yml` and `~/.assist.yml` are auto-applied to every newly created item (stories and bugs); the global and project lists are combined
- `assist backlog subtask-status <id> <idx> <status>` - Set a sub-task's status (`todo`, `in-progress`, `done`) by its 1-based index from `backlog show`
- `assist backlog update-field <id> [--name <n>] [--desc <d>] [--type <t>] [--ac <criterion...>]` - Update fields on a backlog item
- `assist backlog update-field <id> [--add-ac <text>] [--edit-ac <n> <text>] [--remove-ac <n>]` - Granular acceptance-criteria edits using 1-based indices matching `backlog show`: `--add-ac` appends (repeatable), `--edit-ac` replaces criterion n in place, `--remove-ac` deletes criterion n and renumbers the rest (cannot be combined with the whole-list `--ac`)
- `assist backlog update-phase <id> <phase> [--name <n>] [--task <t...>] [--manual-check <c...>]` - Modify a plan phase (name, tasks, or manual checks)
- `assist backlog update-phase <id> <phase> [--add-task <text>] [--edit-task <n> <text>] [--remove-task <n>] [--add-check <text>] [--edit-check <n> <text>] [--remove-check <n>]` - Granular task and manual-check edits using 1-based indices matching `backlog show`: `--add-*` appends (repeatable), `--edit-*` replaces entry n in place, `--remove-*` deletes entry n and renumbers the rest (task ops cannot be combined with `--task`; check ops cannot be combined with `--manual-check`)
- `assist backlog remove-phase <id> <phase>` - Remove a plan phase from a backlog item
- `assist backlog next [id] [--once]` - Pick and run the next backlog item, or open `/draft` if none remain; pass an `id` to run that item first, then continue chaining; `--once` exits after the first completed item run instead of prompting for another
- `assist backlog refine [id] [--once]` - Alias for `refine`
- `assist backlog start <id>` - Set a backlog item to in-progress
- `assist backlog stop` - Revert all in-progress backlog items to todo and reset their phase to 1
- `assist backlog done <id>` - Set a backlog item to done (blocked while any sub-task is not done)
- `assist backlog wontdo <id> [reason]` - Set a backlog item to won't do
- `assist backlog set-status <id> <status>` - Set a backlog item to a specific status (`todo`, `in-progress`, `done`, `wontdo`)
- `assist backlog star <id>` - Star a backlog item to pin it ahead of unstarred items in the web view
- `assist backlog unstar <id>` - Remove the star from a backlog item
- `assist backlog delete <id>` - Delete a backlog item
- `assist backlog show <id>` - Display full detail for a backlog item (alias: `view`)
- `assist backlog plan <id>` - Display the phased plan for a backlog item
- `assist backlog comment <id> <text>` - Add a comment to a backlog item
- `assist backlog comments <id>` - List comments and summaries for a backlog item
- `assist backlog delete-comment <id> <comment-id>` - Delete a comment from a backlog item (summaries cannot be deleted)
- `assist backlog phase-done <id> <phase> <summary>` - Signal that a plan phase is complete with a summary (used by orchestrator)
- `assist backlog rewind <id> <phase> --reason <reason>` - Rewind a backlog item to an earlier phase, setting status to in-progress
- `assist backlog run <id>` - Run a backlog item's plan phase-by-phase with Claude; `--resume-session <id>` resumes an interrupted Claude session for the current phase (used by the sessions daemon when it restarts a running item)
- `assist backlog export [file]` - Export every table in the backlog database (discovered by live schema introspection, so new tables are covered automatically) to a file, or stdout if omitted
- `assist backlog import [file]` - Restore every table present in a dump (file or stdin) back into the backlog database in foreign-key-safe order, faithfully replacing all data and resyncing identity sequences; prompts for confirmation (use `-y, --yes` to skip; required when reading from stdin)
- `assist backlog associate-jira <id> [key]` - Associate a Jira ticket with a backlog item; validates the key shape, fetches the issue to confirm it exists, and stores the key (re-running with a different key replaces it). Use `--clear` to remove the association
- `assist backlog move-repo <old-origin> [new-origin]` - Retag all items from one origin to another after a repo rename; the new origin defaults to the current repo's remote, both accept URL or `git@` forms, and a bare repo name works for the old origin when unambiguous. Prompts for confirmation (use `-y, --yes` to skip)
- `assist backlog web [-p, --port <number>] [--no-open]` - Open the backlog tab in the web dashboard (default port 3100); `--no-open` skips opening a browser on startup
- `assist roam auth` - Authenticate with Roam via OAuth (opens browser, saves tokens to ~/.assist.yml)
- `assist roam show-claude-code-icon` - Forward Claude Code hook activity to Roam local API
- `assist run <name> [params...]` - Run a configured command from assist.yml (positional params are matched to `params` config; supports `pre` array of commands to run first). If `<name>` is purely numeric and matches no configured command, it is treated as an alias for `assist backlog run <name>` and forwards `--write`/`--no-write`/`-w`.
- `assist run add` - Add a new run configuration to assist.yml and create a Claude command file
- `assist run link <path> --prefix <prefix>` - Link run configurations from another project's assist.yml
- `assist run remove <name>` - Remove a run configuration from assist.yml and delete its Claude command file
- `assist config set <key> <value>` - Set a config value (e.g. commit.push true)
- `assist config get <key>` - Get a config value
- `assist config list` - List all config values
  - `prs.slack` - The Slack channel (e.g. `#example`) that `/prs-slack` posts pull requests to via the Slack MCP connector
- `assist verify` - Run all verify:\* commands in parallel (from run configs in assist.yml and scripts in package.json)
- `assist verify all` - Run all checks, ignoring diff-based filters
- `assist verify --measure` - After the run, print a summary table of each command's status and duration (slowest first) plus a wall-clock total
- `assist verify init` - Add verify scripts to a project (writes to `assist.yml` by default; pass `--package-json` to write to `package.json` scripts instead)
- `assist verify hardcoded-colors` - Check for hardcoded hex colors in src/ (supports `hardcodedColors.ignore` globs in config)
- `assist verify block-comments` - Fail on any comment on a changed line (staged + unstaged), whether newly added or edited, reporting each offending file:line; functional machine directives are exempt and `blockComments.ignore` globs in config scope which files are scanned. Yaml `.yml`/`.yaml` files are scanned for `#` comments with no directive exemptions
- `assist verify forbidden-strings` - Check configured JSON files for disallowed values. Each `forbiddenStrings` rule names a `file`, a list of dot-`paths` to inspect (string or string[] values are scanned; other types skipped), and a `disallowed` wildcard matched via minimatch; any matching value fails the check. Zero rules is a no-op that passes
- `assist lint [-f, --fix]` - Run lint checks for conventions not enforced by oxlint (use `-f` to auto-fix)
- `assist lint init` - Initialize oxlint with baseline linter config
- `assist refactor check [pattern]` - Check for files that exceed the maximum line count
- `assist refactor ignore <file>` - Add a file to the refactor ignore list
- `assist refactor rename file <source> <destination>` - Rename/move a TypeScript file and update all imports (dry-run by default, use `--apply` to execute)
- `assist refactor rename symbol <file> <oldName> <newName>` - Rename a variable, function, class, or type across the project (dry-run by default, use `--apply` to execute)
- `assist refactor extract <file> <functionName> <destination>` - Extract a function and its private dependencies to a new file (dry-run by default, use `--apply` to execute)
- `assist refactor restructure [pattern]` - Analyze import graph and restructure tightly-coupled files into nested directories
- `assist devlog list` - Group git commits by date
- `assist devlog next` - Show commits for the day after the last versioned entry
- `assist devlog repos` - Show which github.com/staff0rd repos are missing devlog entries
- `assist devlog skip <date>` - Add a date to the skip list
- `assist devlog version` - Show current repo name and version info
- `assist cli-hook` - PreToolUse hook for auto-approving CLI commands (reads from `allowed.cli-reads` and `allowed.cli-writes`, also auto-approves read-only `gh api` calls). Supports compound commands (`|`, `&&`, `||`, `;`) by checking each sub-command independently.
- `assist cli-hook add <cli>` - Discover a CLI's commands and auto-permit read-only ones
- `assist cli-hook check <command> [--tool <tool>]` - Check whether a command would be auto-approved by `cli-hook` (tool defaults to `Bash`)
- `assist cli-hook deny` - List all deny rules
- `assist cli-hook deny add <pattern> <message>` - Add a deny rule for a command pattern
- `assist cli-hook deny remove <pattern>` - Remove a deny rule by pattern
- `assist edit-hook` - PreToolUse hook that blocks `Edit`/`Write`/`MultiEdit` calls from adding, changing, or removing a `// assist-maintainability-override` marker, or from introducing a code comment (use `code-comment set`/`confirm` for the rare comment that belongs)
- `assist code-comment set <file> <line> <text>` - Validate a single-line comment (max 50 chars; no block comments for `.ts`/`.js`) and issue a pin authorising its insertion; inserts `#` for `.yml`/`.yaml` files and `//` otherwise
- `assist code-comment confirm <pin>` - Insert the pinned comment at its file/line and clear the pin state
- `assist update` - Update assist to the latest version and sync commands
- `assist vscode init` - Add VS Code configuration files
- `assist deploy init` - Initialize Netlify project and configure deployment
- `assist deploy redirect` - Add trailing slash redirect script to index.html
- `assist notify` - Show desktop notification from JSON stdin (supports macOS, Windows, WSL)
- `assist status-line` - Format Claude Code status line from JSON stdin
- `assist dotnet inspect [sln]` - Run JetBrains inspections on changed .cs files to find dead code
- `assist dotnet inspect [sln] --scope all` - Inspect the full solution
- `assist dotnet inspect [sln] --scope base:<ref>` - Inspect all .cs files changed since diverging from a base ref (e.g. `--scope base:main` for a full PR)
- `assist dotnet inspect [sln] --scope commit:<ref>` - Inspect .cs files changed in a specific commit
- `assist dotnet inspect [sln] --only <ids...>` - Show only the specified issue type IDs (e.g. `--only CommentedCode`)
- `assist dotnet inspect [sln] --suppress <ids...>` - Suppress specific issue type IDs on the command line
- `assist dotnet inspect [sln] --roslyn` - Use Roslyn analyzers via msbuild instead of JetBrains
- `assist dotnet inspect [sln] --swea` - Enable solution-wide error analysis (slower but more thorough)
- `assist dotnet check-locks` - Check if build output files are locked by a debugger
- `assist dotnet deps <csproj>` - Show .csproj project dependency tree and solution membership
- `assist dotnet in-sln <csproj>` - Check whether a .csproj is referenced by any .sln file
- `assist jira auth` - Authenticate with Jira via API token (saves site/email to ~/.assist/jira.json)
- `assist jira ac <issue-key>` - Print acceptance criteria for a Jira issue
- `assist jira view <issue-key>` - Print the title and description of a Jira issue
  - Note: Claude is wired to the MCP Atlassian server (`mcp__claude_ai_Atlassian__getJiraIssue`) for fetching Jira context, so the `/jira` slash command and Jira-key mentions go through MCP. These `assist jira` CLI commands remain for direct human use.
- `assist ravendb auth add` - Add a new RavenDB connection (prompts for name, URL, database, op:// secret reference)
- `assist ravendb auth list` - List configured RavenDB connections
- `assist ravendb auth remove <name>` - Remove a configured connection
- `assist ravendb set-connection <name>` - Set the default connection for query/collections commands
- `assist ravendb query [connection] [collection]` - Query a RavenDB collection (outputs JSON to stdout)
- `assist ravendb query [connection] [collection] --page-size <n> --sort <field> --query <lucene> --limit <n>` - Query with options
- `assist ravendb collections [connection]` - List collections and document counts in a database
- `assist seq auth add` - Add a new Seq connection (prompts for name, URL, API token)
- `assist seq auth list` - List configured Seq connections
- `assist seq auth remove <name>` - Remove a configured connection
- `assist seq set-connection <name>` - Set the default Seq connection
- `assist seq query <filter>` - Query Seq events with a filter expression
- `assist seq query <filter> -c <connection>` - Query using a specific connection
- `assist seq query <filter> --json` - Output raw JSON
- `assist seq query <filter> -n <count>` - Fetch a specific number of events (default 50)
- `assist seq query <filter> --from <date>` - Start of query window (UTC date or relative e.g. 5m, 1h, 2d)
- `assist seq query <filter> --to <date>` - End of query window (UTC date or relative e.g. 5m, 1h, 2d)
- `assist sql auth add` - Add a new MSSQL connection (prompts for name, server, port, user, password, database)
- `assist sql auth list` - List configured SQL connections
- `assist sql auth remove <name>` - Remove a configured connection
- `assist sql set-connection <name>` - Set the default SQL connection
- `assist sql query "<sql>" [connection]` - Execute a read-only SQL statement and print results in table format (rejects INSERT/UPDATE/DELETE/DROP/CREATE/ALTER/TRUNCATE/MERGE/GRANT/REVOKE/EXEC)
- `assist sql mutate "<sql>" [connection]` - Execute a mutating SQL statement and print rows affected (rejects non-mutating statements like pure SELECTs)
- `assist sql tables [connection]` - List tables in the connected database (via INFORMATION_SCHEMA.TABLES)
- `assist sql columns <table> [connection]` - List columns for a table (use `schema.table` for non-default schema; via INFORMATION_SCHEMA.COLUMNS)
- `assist netcap [-p, --port <port>] [-o, --out <dir>] [-f, --filter <pattern>]` - Start a local receiver that captures browser network traffic to a JSONL file (`capture.jsonl` under `--out`, default `~/.assist/netcap`), paired with the netcap browser extension. Sends permissive CORS, logs each ping/capture live, and runs until Ctrl-C, then prints a capture count (default port `8723`). `--filter` bakes a URL substring into the extension so only matching requests forward. See [netcap browser extension](#netcap-browser-extension)
- `assist netcap extract-linkedin-posts [file]` - Parse a netcap capture file into structured LinkedIn posts (`text`, `markdown` with mentions linked, `author`, `mentions`, `hashtags`, `links`, `relatedPosts`, `permalink` to the post, and `postedAt` decoded from the activity id) and write them to `posts.json` beside the capture (defaults to `~/.assist/netcap/capture.jsonl`). Reads both the LinkedIn SDUI (rsc-action) responses rendered on first paint and the voyager GraphQL profile-updates responses loaded on scroll, deduped by activity urn keeping the richest copy of each post
- `assist screenshot <process>` - Capture a screenshot of a running application window (e.g. `assist screenshot notepad`). Output directory is configurable via `screenshot.outputDir` (default `./screenshots`)
- `assist handover save --summary <s>` - Save a session handover note to the backlog DB (content read from stdin), scoped by the repo's git origin. Appends a new row each call; `--summary` is the one-line description shown when recalling
- `assist handover list` - List unrecalled handovers for this repo, most recent first, one per line as tab-separated `id`, ISO-8601 created timestamp, and one-line summary. Prints nothing when none are pending
- `assist handover recall [id]` - Print an unrecalled handover for this repo and mark it recalled (so it drops out of the SessionStart advisory and future recalls). Recalls the most recent by default, or the given `id`. Prints nothing when none match
- `assist handover load` - SessionStart hook entry point: reads `{cwd, session_id}` from stdin, migrates any legacy disk handovers (`.assist/HANDOVER.md` and notes under `.assist/handovers/`) into the backlog DB then deletes them, and emits `{ hookSpecificOutput: { hookEventName: "SessionStart" }, systemMessage }` advising how many unrecalled handovers exist. Emits nothing when there are none (use `/recall` to load one)
- `assist mermaid export [file.md]` - Render each fenced mermaid block to `<stem>-<index>.svg` via [Kroki](https://kroki.io). With no file, scans `*.md` in the current directory (non-recursive). Use `--out <dir>` to override the output directory. Use `--index <n>` to render only the nth mermaid block (1-based; requires a file argument). Endpoint is configurable via `mermaid.krokiUrl` (default `https://kroki.io`).
- `assist prompts` - Show top 10 denied tool calls by frequency with count and repo breakdown
- `assist coverage` - Print global statement coverage percentage
- `assist complexity <pattern>` - Analyze a file (all metrics if single match, maintainability if multiple)
- `assist complexity cyclomatic [pattern]` - Calculate cyclomatic complexity per function
- `assist complexity halstead [pattern]` - Calculate Halstead metrics per function
- `assist complexity maintainability [pattern]` - Calculate maintainability index per file (`--ignore <glob>`, repeatable, excludes extra files on top of `complexity.ignore`). A file can declare its own threshold with a `// assist-maintainability-override: N` comment in its first ~10 lines (integer 0-100); that value replaces the global `--threshold` for that file only and the output annotates it with `(override: N)`
- `assist complexity sloc [pattern]` - Count source lines of code per file
- `assist transcript configure` - Configure transcript directories
- `assist transcript list` - List raw .vtt filenames waiting in the pick-up directory
- `assist transcript move <file>` - Convert a raw .vtt to a dated markdown transcript and archive the original
- `assist voice setup` - Download required voice models (VAD, STT)
- `assist voice start` - Start the voice daemon (always-on, listens for wake word)
- `assist voice start --foreground` - Start in foreground for debugging
- `assist voice stop` - Stop the voice daemon
- `assist voice status` - Check voice daemon status and recent events
- `assist voice devices` - List available audio input devices
- `assist voice logs [-n <count>]` - Show recent voice daemon log entries
- `assist sessions` - Start the web dashboard (same as `sessions web`)
- `assist sessions web [-p, --port <number>] [--no-open]` - Start the web dashboard with Sessions, Backlog and News tabs, xterm.js terminals with clickable http(s) links (default port 3100); `--no-open` skips opening a browser on startup; press Ctrl+R in the foreground terminal for an in-terminal restart menu (Restart daemon, Restart webserver, Restart both); Restart webserver re-execs the foreground process (passing `--no-open` so no browser pops on restart) so the connected browser auto-reconnects
- `assist sessions summarise [-f, --force] [-n, --limit <count>]` - Generate one-line summaries for unsummarised Claude sessions (force re-generates all; limit caps how many to process)
- `assist sessions set-status <status>` - Report the current session's status (`running`/`waiting`) to the sessions daemon; reads the session id from `$ASSIST_SESSION_ID` and is invoked by the Claude Code hooks the daemon wires into each session (exits silently when run outside a daemon session)
- `assist daemon run` - Run the sessions daemon in the foreground (normally auto-spawned detached by `assist sessions`)
- `assist daemon status` - Show sessions daemon status, live sessions, and any stray daemon processes or stolen socket
- `assist daemon stop` - Stop the sessions daemon; running claude sessions resume on next start
- `assist daemon restart` - Restart the sessions daemon, resuming previously running claude sessions
- `assist daemon drain` - Remove all sessions from the local daemon for a clean slate (does not affect the Windows daemon)

Web sessions are owned by a long-lived daemon process, not the web server: the server is a thin client that relays WebSocket traffic to the daemon over a local IPC socket (unix domain socket at `~/.assist/daemon/daemon.sock`; named pipe `\\.\pipe\assist-sessions-daemon` on Windows). Restarting the web server leaves sessions running with scrollback intact. The daemon logs to `~/.assist/daemon/daemon.log` (timestamped lines tagged with the daemon's pid, including why it spawned and which sessions it restored) and auto-exits once no sessions remain and no client has been connected for 60 seconds (it is respawned on demand by the web server). Daemon spawning is arbitrated by an `O_EXCL` lockfile so racing clients start at most one daemon; sessions are only restored after the daemon owns the IPC socket, and a daemon that loses ownership of `daemon.pid` shuts down its sessions and exits rather than running orphaned.

From WSL, the selector can also surface and drive Windows-host repos (requires `assist` installed on the Windows host). Config keys:

- `sessions.windowsProjectsRoot` — the Windows `.claude/projects` directory as seen from WSL (e.g. `/mnt/c/Users/<user>/.claude/projects`); enables discovery of Windows-host repos, tagged with a `Windows` badge. Selecting one launches a native assist daemon on Windows and runs an interactive session there.
- `sessions.windowsDaemonHost` / `sessions.windowsDaemonPort` — where the WSL daemon reaches the native Windows daemon (defaults `127.0.0.1` / `51764`; set the host to the Windows IP on WSL2 NAT-mode networking).
- `sessions.windowsVersionCheck` — how the WSL↔Windows daemon handshake reacts to a protocol-version mismatch: `block` (default) refuses creates and auto-heals the host, `warn` logs and proceeds anyway, `off` skips the check. Use `warn`/`off` to keep working across an unfixable version gap.

When iterating on assist itself: web server changes only need the `assist sessions` process restarted — sessions survive. Daemon/session-core changes need `assist daemon restart` to load the new code; this kills the PTYs, then claude sessions — including assist sessions that wrap claude, like `assist draft` — are auto-respawned via `claude --resume` with scrollback starting fresh, while run sessions (and assist sessions whose claude sessionId was never discovered) reappear as not-restored tiles that can be retried. A `--once` draft/bug/refine session is respawned through its assist wrapper instead of bare `claude --resume`, so its `assist signal done` watcher is re-established and the card still auto-closes.

- `assist next [id] [--once]` - Alias for `backlog next [id]`; `--once` exits after the first completed item run instead of prompting for another
- `assist draft [description] [--once]` (alias: `feat`) - Launch Claude in `/draft` mode, chain into next on `/next` signal; an optional `description` is forwarded as `/draft <description>`; `--once` exits when the done signal arrives after the initial draft completes; `--resume-session <id>` resumes an interrupted Claude session (used by the sessions daemon when it restarts a running item)
- `assist bug [description] [--once]` - Launch Claude in `/bug` mode, chain into next on `/next` signal; an optional `description` is forwarded as `/bug <description>`; `--once` exits when the done signal arrives after the initial bug report completes; `--resume-session <id>` resumes an interrupted Claude session (used by the sessions daemon when it restarts a running item)
- `assist refine [id] [--once]` - Launch Claude in `/refine` mode to refine a backlog item; prompts for selection when no id given; `--once` exits when the done signal arrives after refinement completes; `--resume-session <id>` resumes an interrupted Claude session (used by the sessions daemon when it restarts a running item)
- `assist review-comments [number]` - Launch Claude in `/review-comments` mode to process PR review comments (single session, no chaining); when a PR number is supplied, checks out that PR via `gh pr checkout` first
- `assist signal next [id]` - Write a next signal to chain into `assist next`; when `id` is supplied, the parent launcher runs that backlog item directly
- `assist signal done [id]` - Write a done signal marking the session's initial task complete; an optional `id` surfaces the backlog item the session created onto its session card; `--once` launch sessions exit when it arrives, plain sessions ignore it

When `commit.pull` is enabled in config, `assist draft`, `assist bug`, `assist refine`, `assist next`, and `assist backlog run` run `git pull --ff-only` before doing anything else; if the pull fails the command aborts. `assist next` pulls once per invocation, not per item in its loop.

When `commit.expectedBranch` is set (e.g. `main`), `assist commit` prints a prominent warning if HEAD is on any other branch before committing — so work committed (and pushed) on a stray branch in a repo that lands directly on the expected branch isn't silently orphaned. The warning is non-blocking: the commit still proceeds. With the key unset, behaviour is unchanged and no branch check runs.

When `branch.prefix` is set (e.g. `sw`), `assist branch <slug>` prepends `<prefix>/` to the branch name. With the key unset, no prefix segment is added.

`assist branch` resolves the base branch live from the remote (`git ls-remote --symref origin HEAD`), so it never depends on a stale or unset local `origin/HEAD`. If the remote advertises no default it falls back to `main`. Set `branch.defaultBranch` (e.g. `develop`) to override the base branch outright.

## netcap browser extension

`assist netcap` only runs the receiver; the browser side is a raw Manifest V3 extension (no build step) under `netcap-extension/`. A MAIN-world content script patches `fetch`/`XMLHttpRequest` to capture `{url, method, status, requestBody, responseBody, timestamp}`, relays each entry to the background service worker (`window.postMessage` → `chrome.runtime.sendMessage`), and the background worker POSTs it to the receiver. The XHR patch reads the response across every `responseType` (`json`, `blob`, `arraybuffer`, `document`, not just `text`) — LinkedIn's voyager GraphQL calls use `responseType: "json"`, which exposes no `responseText`, so reading `responseText` alone captured those bodies empty. Forwarding happens in the background context, so the page's CSP (`connect-src`) never blocks it — the limitation that killed the earlier console-paste approach.

1. Run `assist netcap` — it prints the receiver URL, the capture file path, and the absolute path to the extension directory to load. The receiver host/port is baked into the extension's `background.js` at this point. Under WSL (where the browser runs on the Windows host, cannot load from a WSL path, and cannot reach the receiver on `localhost` because WSL2 localhost forwarding is unreliable) it copies the extension to `C:\tools\netcap-extension`, targets the WSL VM's IP, and prints that Windows path instead. Re-run `assist netcap` after a reboot (the WSL IP can change) and reload the extension.
2. Load the unpacked extension:
   - **Firefox**: open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `manifest.json` inside the printed extension directory. (Requires Firefox 128+ for MAIN-world content scripts.)
   - **Chrome**: open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extension directory.
3. On load the background worker pings the receiver; `ping from extension` appears in the `assist netcap` log, confirming browser→server connectivity.
4. Browse a site (e.g. LinkedIn activity); matching requests append to the capture file live and survive page refreshes (re-loading the extension appends to the same file). Press Ctrl-C to stop the receiver; it prints how many entries were captured.

`assist netcap` bakes the receiver host/port and the optional `--filter` substring into the extension's `background.js` at startup, so you don't normally edit it by hand. With `--filter <pattern>`, the background worker only forwards requests whose URL contains `<pattern>` (case-sensitive substring); the matching logic mirrors `matchesNetcapFilter` in `src/commands/netcap`. Use `--out <dir>` to write `capture.jsonl` into a different directory.
