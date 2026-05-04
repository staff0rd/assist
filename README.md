# assist

A CLI tool for enforcing determinism in LLM development workflow automation.

See [devlog](https://staffordwilliams.com/devlog/assist/) for latest features.

## Installation
You can install `assist` globally using npm:

```bash
npm install -g @staff0rd/assist
assist sync
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
- `/bug` - File a bug with reproduction steps, expected and actual behavior
- `/comment` - Add pending review comments to the current PR
- `/commit` - Commit only relevant files from the session
- `/devlog` - Generate devlog entry for the next unversioned day
- `/draft` - Draft a new backlog item with LLM-assisted questioning
- `/pr` - Raise a PR with a concise description
- `/refactor` - Run refactoring checks for code quality
- `/prompts` - Analyze denied tool calls and suggest settings changes to auto-allow recurring prompts
- `/refine` - Refine an existing backlog item through conversation
- `/restructure` - Analyze and restructure tightly-coupled files
- `/review-comments` - Process PR review comments one by one
- `/jira` - View a Jira work item
- `/journal` - Append a journal entry summarising recent work, decisions, and notable observations
- `/next` - Signal completion and chain into the next backlog item
- `/standup` - Summarise recent journal entries as a standup update
- `/sync` - Sync commands and settings to ~/.claude
- `/test-cover` - Incrementally increase test coverage by identifying and testing uncovered files
- `/test-review` - Review existing tests for quality, coverage gaps, and adherence to conventions
- `/inspect` - Run .NET code inspections on changed files
- `/screenshot` - Capture a screenshot of a running application window
- `/raven` - Query and manage RavenDB connections and collections
- `/seq` - Query Seq logs from a URL or filter expression
- `/sql` - Query a MSSQL database via assist sql
- `/verify` - Run all verification commands in parallel
- `/transcript-format` - Format meeting transcripts from VTT files
- `/transcript-summarise` - Summarise transcripts missing summaries
- `/voice-setup` - Download required voice models (VAD, STT)
- `/voice-start` - Start the voice interaction daemon
- `/voice-stop` - Stop the voice interaction daemon
- `/voice-status` - Check voice daemon status
- `/voice-logs` - Show recent voice daemon logs

## CLI Commands

- `assist activity [--since <date>]` - Chart GitHub commit activity per day (defaults to last 30 days)
- `assist init` - Initialize project with VS Code and verify configurations
- `assist new vite` - Initialize a new Vite React TypeScript project
- `assist new cli` - Initialize a new tsup CLI project
- `assist sync` - Copy command files to `~/.claude/commands`
- `assist commit status` - Show git status and diff
- `assist commit <message>` - Commit staged changes with validation
- `assist commit <message> [files...]` - Stage files and create a git commit with validation
- `assist prs` - List pull requests for the current repository
- `assist prs list-comments` - List all comments on the current branch's pull request
- `assist prs fixed <comment-id> <sha>` - Reply with commit link and resolve thread
- `assist prs wontfix <comment-id> <reason>` - Reply with reason and resolve thread
- `assist prs comment <path> <line> <body>` - Add a line comment to the pending review
- `assist news` - Start the news web UI showing latest RSS feed items (same as `news web`)
- `assist news add [url]` - Add an RSS feed URL to the config
- `assist news web [-p, --port <number>]` - Start a web view of the news feeds (default port 3001)
- `assist backlog [--dir <path>]` - Open the backlog tab in the web dashboard (same as `backlog web`). `--dir` overrides the directory for backlog file discovery
- `assist backlog init` - Create an empty backlog
- `assist backlog list [--status <type>] [-v]` - List all backlog items with status icons
- `assist backlog add` - Add a new backlog item interactively (prompts for type: story/bug)
- `assist backlog add --name <n> --type <t> --desc <d> --ac <criterion...>` - Add a backlog item from CLI options (used by `/draft`)
- `assist backlog add-phase <id> <name> --task <t...> [--manual-check <c...>] [--position <pos>]` - Add a phase (appends by default; `--position` inserts at a 1-indexed position)
- `assist backlog update <id> [--name <n>] [--desc <d>] [--type <t>] [--ac <criterion...>]` - Update fields on a backlog item
- `assist backlog update-phase <id> <phase> [--name <n>] [--task <t...>] [--manual-check <c...>]` - Modify a plan phase (name, tasks, or manual checks)
- `assist backlog remove-phase <id> <phase>` - Remove a plan phase from a backlog item
- `assist backlog next` - Pick and run the next backlog item, or open `/draft` if none remain
- `assist backlog start <id>` - Set a backlog item to in-progress
- `assist backlog done <id>` - Set a backlog item to done
- `assist backlog wontdo <id> [reason]` - Set a backlog item to won't do
- `assist backlog delete <id>` - Delete a backlog item
- `assist backlog show <id>` - Display full detail for a backlog item (alias: `view`)
- `assist backlog plan <id>` - Display the phased plan for a backlog item
- `assist backlog comment <id> <text>` - Add a comment to a backlog item
- `assist backlog comments <id>` - List comments and summaries for a backlog item
- `assist backlog delete-comment <id> <comment-id>` - Delete a comment from a backlog item (summaries cannot be deleted)
- `assist backlog phase-done <id> <phase> <summary>` - Signal that a plan phase is complete with a summary (used by orchestrator)
- `assist backlog rewind <id> <phase> --reason <reason>` - Rewind a backlog item to an earlier phase, setting status to in-progress
- `assist backlog run <id>` - Run a backlog item's plan phase-by-phase with Claude
- `assist backlog web [-p, --port <number>]` - Open the backlog tab in the web dashboard (default port 3100)
- `assist roam auth` - Authenticate with Roam via OAuth (opens browser, saves tokens to ~/.assist.yml)
- `assist roam show-claude-code-icon` - Forward Claude Code hook activity to Roam local API
- `assist run <name> [params...]` - Run a configured command from assist.yml (positional params are matched to `params` config; supports `pre` array of commands to run first)
- `assist run add` - Add a new run configuration to assist.yml and create a Claude command file
- `assist run link <path> --prefix <prefix>` - Link run configurations from another project's assist.yml
- `assist run remove <name>` - Remove a run configuration from assist.yml and delete its Claude command file
- `assist config set <key> <value>` - Set a config value (e.g. commit.push true)
- `assist config get <key>` - Get a config value
- `assist config list` - List all config values
- `assist verify` - Run all verify:* commands in parallel (from run configs in assist.yml and scripts in package.json)
- `assist verify all` - Run all checks, ignoring diff-based filters
- `assist verify init` - Add verify scripts to a project (writes to `assist.yml` by default; pass `--package-json` to write to `package.json` scripts instead)
- `assist verify hardcoded-colors` - Check for hardcoded hex colors in src/ (supports `hardcodedColors.ignore` globs in config)
- `assist lint [-f, --fix]` - Run lint checks for conventions not enforced by biomejs (use `-f` to auto-fix)
- `assist lint init` - Initialize Biome with standard linter config
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
- `assist cli-hook` - PreToolUse hook for auto-approving CLI commands (reads from `allowed.cli-reads` and `allowed.cli-writes`, also auto-approves read-only `gh api` calls). Supports compound commands (`|`, `&&`, `||`, `;`) by checking each sub-command independently
- `assist cli-hook add <cli>` - Discover a CLI's commands and auto-permit read-only ones
- `assist cli-hook check <command> [--tool <tool>]` - Check whether a command would be auto-approved by `cli-hook` (tool defaults to `Bash`)
- `assist cli-hook deny` - List all deny rules
- `assist cli-hook deny add <pattern> <message>` - Add a deny rule for a command pattern
- `assist cli-hook deny remove <pattern>` - Remove a deny rule by pattern
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
- `assist screenshot <process>` - Capture a screenshot of a running application window (e.g. `assist screenshot notepad`). Output directory is configurable via `screenshot.outputDir` (default `./screenshots`)
- `assist mermaid export [file.md]` - Render each fenced mermaid block to `<stem>-<index>.svg` via [Kroki](https://kroki.io). With no file, scans `*.md` in the current directory (non-recursive). Use `--out <dir>` to override the output directory. Use `--index <n>` to render only the nth mermaid block (1-based; requires a file argument). Endpoint is configurable via `mermaid.krokiUrl` (default `https://kroki.io`).
- `assist prompts` - Show top 10 denied tool calls by frequency with count and repo breakdown
- `assist coverage` - Print global statement coverage percentage
- `assist complexity <pattern>` - Analyze a file (all metrics if single match, maintainability if multiple)
- `assist complexity cyclomatic [pattern]` - Calculate cyclomatic complexity per function
- `assist complexity halstead [pattern]` - Calculate Halstead metrics per function
- `assist complexity maintainability [pattern]` - Calculate maintainability index per file
- `assist complexity sloc [pattern]` - Count source lines of code per file
- `assist transcript configure` - Configure transcript directories
- `assist transcript format` - Convert VTT files to formatted markdown transcripts
- `assist transcript summarise` - List transcripts that do not have summaries
- `assist voice setup` - Download required voice models (VAD, STT)
- `assist voice start` - Start the voice daemon (always-on, listens for wake word)
- `assist voice start --foreground` - Start in foreground for debugging
- `assist voice stop` - Stop the voice daemon
- `assist voice status` - Check voice daemon status and recent events
- `assist voice devices` - List available audio input devices
- `assist voice logs [-n <count>]` - Show recent voice daemon log entries
- `assist sessions` - Start the web dashboard (same as `sessions web`)
- `assist sessions web [-p, --port <number>]` - Start the web dashboard with Sessions and Backlog tabs, xterm.js terminals (default port 3100)
- `assist sessions summarise [-f, --force] [-n, --limit <count>]` - Generate one-line summaries for unsummarised Claude sessions (force re-generates all; limit caps how many to process)
- `assist next` - Alias for `backlog next -w`
- `assist draft` (alias: `feat`) - Launch Claude in `/draft` mode, chain into next on `/next` signal
- `assist bug` - Launch Claude in `/bug` mode, chain into next on `/next` signal
- `assist refine [id]` - Launch Claude in `/refine` mode to refine a backlog item; prompts for selection when no id given
- `assist signal next` - Write a next signal to chain into `assist next`

