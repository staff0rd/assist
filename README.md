# assist

A CLI tool for enforcing determinism in LLM development workflow automation.

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

- `/comment` - Add pending review comments to the current PR
- `/commit` - Commit only relevant files from the session
- `/devlog` - Generate devlog entry for the next unversioned day
- `/next-backlog-item` - Pick and implement the next backlog item
- `/pr` - Raise a PR with a concise description
- `/refactor` - Run refactoring checks for code quality
- `/restructure` - Analyze and restructure tightly-coupled files
- `/review-comments` - Process PR review comments one by one
- `/journal` - Append a journal entry summarising recent work, decisions, and notable observations
- `/standup` - Summarise recent journal entries as a standup update
- `/generate-cli-read-verbs <cli>` - Discover CLI commands and classify read vs write verbs
- `/sync` - Sync commands and settings to ~/.claude
- `/verify` - Run all verification commands in parallel
- `/transcript-format` - Format meeting transcripts from VTT files
- `/transcript-summarise` - Summarise transcripts missing summaries
- `/voice-setup` - Download required voice models (VAD, STT)
- `/voice-start` - Start the voice interaction daemon
- `/voice-stop` - Stop the voice interaction daemon
- `/voice-status` - Check voice daemon status
- `/voice-logs` - Show recent voice daemon logs

## CLI Commands

- `assist init` - Initialize project with VS Code and verify configurations
- `assist new vite` - Initialize a new Vite React TypeScript project
- `assist new cli` - Initialize a new tsup CLI project
- `assist sync` - Copy command files to `~/.claude/commands`
- `assist commit status` - Show git status and diff
- `assist commit <message>` - Commit staged changes with validation
- `assist commit <files...> <message>` - Stage files and create a git commit with validation
- `assist prs` - List pull requests for the current repository
- `assist prs list-comments` - List all comments on the current branch's pull request
- `assist prs fixed <comment-id> <sha>` - Reply with commit link and resolve thread
- `assist prs wontfix <comment-id> <reason>` - Reply with reason and resolve thread
- `assist prs comment <path> <line> <body>` - Add a line comment to the pending review
- `assist backlog` - Start the backlog web UI (same as `backlog web`)
- `assist backlog init` - Create an empty assist.backlog.yml
- `assist backlog list [--status <type>] [-v]` - List all backlog items with status icons
- `assist backlog add` - Add a new backlog item interactively (prompts for type: story/bug)
- `assist backlog start <id>` - Set a backlog item to in-progress
- `assist backlog done <id>` - Set a backlog item to done
- `assist backlog delete <id>` - Delete a backlog item
- `assist backlog web [-p, --port <number>]` - Start a web view of the backlog (default port 3000)
- `assist roam auth` - Authenticate with Roam via OAuth (opens browser, saves tokens to ~/.assist.yml)
- `assist run <name>` - Run a configured command from assist.yml
- `assist run add` - Add a new run configuration to assist.yml and create a Claude command file
- `assist config set <key> <value>` - Set a config value (e.g. commit.push true)
- `assist config get <key>` - Get a config value
- `assist config list` - List all config values
- `assist verify` - Run all verify:* commands in parallel (from run configs in assist.yml and scripts in package.json)
- `assist verify all` - Run all checks, ignoring diff-based filters
- `assist verify init` - Add verify scripts to a project
- `assist verify hardcoded-colors` - Check for hardcoded hex colors in src/ (supports `hardcodedColors.ignore` globs in config)
- `assist lint` - Run lint checks for conventions not enforced by biomejs
- `assist lint init` - Initialize Biome with standard linter config
- `assist refactor check [pattern]` - Check for files that exceed the maximum line count
- `assist refactor ignore <file>` - Add a file to the refactor ignore list
- `assist refactor restructure [pattern]` - Analyze import graph and restructure tightly-coupled files into nested directories
- `assist devlog list` - Group git commits by date
- `assist devlog next` - Show commits for the day after the last versioned entry
- `assist devlog skip <date>` - Add a date to the skip list
- `assist devlog version` - Show current repo name and version info
- `assist cli-discover <cli>` - Discover a CLI's command tree via recursive `--help` parsing (outputs JSON)
- `assist cli-hook` - PreToolUse hook for auto-approving read-only CLI commands (reads JSON from stdin)
- `assist update` - Update assist to the latest version and sync commands
- `assist vscode init` - Add VS Code configuration files
- `assist deploy init` - Initialize Netlify project and configure deployment
- `assist deploy redirect` - Add trailing slash redirect script to index.html
- `assist notify` - Show desktop notification from JSON stdin (supports macOS, Windows, WSL)
- `assist status-line` - Format Claude Code status line from JSON stdin
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

